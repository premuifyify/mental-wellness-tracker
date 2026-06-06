/**
 * Lightweight local API server for development.
 * Mirrors the Vercel serverless function runtime so local behaviour
 * is identical to production.
 *
 * Reads .env then .env.local automatically — no --env-file flag needed,
 * works on all Node.js versions.
 */

import http           from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { resolve }    from 'node:path';

// ─── Load env files ───────────────────────────────────────────────────────────
// .env is loaded first; .env.local values take precedence (same as Vite / Vercel).
// Existing process.env values (e.g. set in the shell) are never overwritten.
function loadEnvFile(filename) {
  const filepath = resolve(process.cwd(), filename);
  if (!existsSync(filepath)) return;

  // Strip UTF-8 BOM (﻿) that Windows editors sometimes prepend
  const raw_content = readFileSync(filepath, 'utf8').replace(/^﻿/, '');
  const lines = raw_content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;

    const key = trimmed.slice(0, eqIdx).trim();
    // Strip surrounding quotes from the value (single or double)
    const raw = trimmed.slice(eqIdx + 1).trim();
    const val = raw.replace(/^(['"])(.*)\1$/, '$2');

    if (key && !(key in process.env)) {
      process.env[key] = val;
    }
  }
}

loadEnvFile('.env');
loadEnvFile('.env.local');

// Confirm the key loaded (value is masked for security)
if (process.env.ANTHROPIC_API_KEY) {
  const masked = process.env.ANTHROPIC_API_KEY.slice(0, 12) + '…';
  console.log(`\x1b[36m[api]\x1b[0m ANTHROPIC_API_KEY loaded (${masked})`);
} else {
  console.warn('\x1b[33m[api] WARNING: ANTHROPIC_API_KEY not found in .env or .env.local\x1b[0m');
}

// ─── Server ───────────────────────────────────────────────────────────────────
const PORT = 3001;

async function loadHandler() {
  const mod = await import('../api/generate-plan.js');
  return mod.default;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); }
      catch { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (!req.url.startsWith('/api/')) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid JSON body' }));
    return;
  }

  let statusCode = 200;
  const responseHeaders = {
    'Content-Type':                'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  const mockReq = { method: req.method, headers: req.headers, body };
  const mockRes = {
    status(code)       { statusCode = code; return this; },
    setHeader(key, val){ responseHeaders[key] = val; return this; },
    json(data) {
      if (!res.headersSent) {
        res.writeHead(statusCode, responseHeaders);
        res.end(JSON.stringify(data));
      }
    },
    end() {
      if (!res.headersSent) {
        res.writeHead(statusCode, responseHeaders);
        res.end();
      }
    },
  };

  try {
    const handler = await loadHandler();
    await handler(mockReq, mockRes);
  } catch (err) {
    console.error('\x1b[31m[api] Unhandled error:\x1b[0m', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }
});

server.listen(PORT, () => {
  console.log(`\x1b[32m[api]\x1b[0m Dev server → http://localhost:${PORT}`);
});
