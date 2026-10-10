import { readFile, mkdir, cp } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const apiTarget = process.env.API_PROXY_TARGET ?? 'http://127.0.0.1:4000';
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const demoRoot = resolve(projectRoot, 'demo');
const demoFiles = ['index.html', 'demo.css', 'demo.js'] as const;

function standaloneDemoRoute(): Plugin {
  return {
    name: 'dockpilot-standalone-demo',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
        if (pathname === '/demo') {
          response.statusCode = 302;
          response.setHeader('Location', '/demo/');
          response.end();
          return;
        }
        if (!pathname.startsWith('/demo')) {
          next();
          return;
        }
        if (request.method !== 'GET' && request.method !== 'HEAD') {
          response.statusCode = 405;
          response.setHeader('Allow', 'GET, HEAD');
          response.end();
          return;
        }

        const filename =
          pathname === '/demo/' || pathname === '/demo/index.html'
            ? 'index.html'
            : pathname.slice('/demo/'.length);
        if (!demoFiles.includes(filename as (typeof demoFiles)[number])) {
          response.statusCode = 404;
          response.end('Not found');
          return;
        }

        void readFile(resolve(demoRoot, filename))
          .then((body) => {
            response.statusCode = 200;
            response.setHeader(
              'Content-Type',
              filename.endsWith('.html')
                ? 'text/html; charset=utf-8'
                : filename.endsWith('.css')
                  ? 'text/css; charset=utf-8'
                  : 'text/javascript; charset=utf-8',
            );
            response.setHeader('Cache-Control', 'no-store');
            if (request.method === 'HEAD') response.end();
            else response.end(body);
          })
          .catch((error: unknown) => {
            next(error);
          });
      });
    },
    async writeBundle(options) {
      const outputDirectory = resolve(options.dir ?? resolve(projectRoot, 'apps/web/dist'));
      const demoOutput = resolve(outputDirectory, 'demo');
      await mkdir(demoOutput, { recursive: true });
      await Promise.all(
        demoFiles.map((filename) => cp(resolve(demoRoot, filename), resolve(demoOutput, filename))),
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), standaloneDemoRoute()],
  server: {
    host: '127.0.0.1',
    port: Number(process.env.WEB_PORT ?? 5173),
    strictPort: true,
    proxy: { '/api': { target: apiTarget, changeOrigin: false } },
  },
  preview: { host: '127.0.0.1', strictPort: true },
  build: { target: 'es2022', sourcemap: false },
});
