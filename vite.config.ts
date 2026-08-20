import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import fs from 'fs'; // Node.js File System module
import { fileURLToPath } from 'node:url';

// FIX: this previously read cert.pem/key.pem unconditionally, including
// during `vite build` — those files are gitignored dev-only certs, so a
// fresh clone or a CI/Vercel build (where they don't exist) crashed
// immediately with ENOENT. Only apply HTTPS during `vite serve`, and only
// if the cert files actually exist locally.
const hasLocalCerts = fs.existsSync('./key.pem') && fs.existsSync('./cert.pem');

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: command === 'serve' ? {
    https: hasLocalCerts ? {
      key: fs.readFileSync('./key.pem'),
      cert: fs.readFileSync('./cert.pem'),
    } : undefined,
    host: true, // listen on all interfaces (LAN + localhost), not a hardcoded IP
    port: 5173,
  } : undefined,
}));
