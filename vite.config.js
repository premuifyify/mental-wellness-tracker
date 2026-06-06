import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 3000,
    proxy: {
      // Forward /api/* to the local API dev server (scripts/api-server.mjs).
      // In production on Vercel, /api/* is handled by serverless functions directly.
      '/api': {
        target:       'http://localhost:3001',
        changeOrigin: true,
        secure:       false,
      },
    },
  },

  test: {
    globals:     true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
});
