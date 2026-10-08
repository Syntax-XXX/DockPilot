import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiTarget = process.env.API_PROXY_TARGET ?? 'http://127.0.0.1:4000';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: Number(process.env.WEB_PORT ?? 5173),
    strictPort: true,
    proxy: { '/api': { target: apiTarget, changeOrigin: false } },
  },
  preview: { host: '127.0.0.1', strictPort: true },
  build: { target: 'es2022', sourcemap: false },
});
