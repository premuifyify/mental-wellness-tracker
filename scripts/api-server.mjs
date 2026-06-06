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
function loadEnvFile(filename) {
  const filepath = resolve(process.cwd(), filename);
  if (!existsSync(filepath)) return;

  const raw = readFileSync(filepath, 'utf8').replace(/^﻿/, ''); // strip BOM
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^(['"])(.*)\1$/, '$2');
    if (key && !(key in process.env)) process.env[key] = val;
  }
}

loadEnvFile('.env');
loadEnvFile('.env.local');

if (process.env.GEMINI_API_KEY) {
  const masked = process.env.GEMINI_API_KEY.slice(0, 10) + '…';
  console.log(`\x1b[36m[api]\x1b[0m GEMINI_API_KEY loaded (${masked})`);
} else {
  console.warn('\x1b[33m[api] WARNING: GEMINI_API_KEY not found in .env or .env.local\x1b[0m');
}

// ─── Route registry ───────────────────────────────────────────────────────────
const ROUTES = {
  '/api/wellness-companion': '../api/wellness-companion.js',
};

async function loadHandler(url) {
  const path = Object.keys(ROUTES).find(r => url.startsWith(r));
  if (!path) return null;
  const mod = await import(ROUTES[path]);
  return mod.default;
}

// ─── Server ───────────────────────────────────────────────────────────────────
const PORT = 3001;

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
    return res.end();
  }

  if (!req.url.startsWith('/api/')) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Not found' }));
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Invalid JSON body' }));
  }

  let statusCode = 200;
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  const mockReq = { method: req.method, headers: req.headers, body };
  const mockRes = {
    status(code)        { statusCode = code; return this; },
    setHeader(k, v)     { headers[k] = v; return this; },
    json(data) {
      if (!res.headersSent) { res.writeHead(statusCode, headers); res.end(JSON.stringify(data)); }
    },
    end() {
      if (!res.headersSent) { res.writeHead(statusCode, headers); res.end(); }
    },
  };

  try {
    const handler = await loadHandler(req.url);
    if (!handler) {
      mockRes.status(404).json({ error: `No handler for ${req.url}` });
      return;
    }
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
  console.log(`\x1b[32m[api]\x1b[0m Routes: ${Object.keys(ROUTES).join(', ')}`);
});
