import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      {
        name: 'serve-static-subpages',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (!req.url || req.method !== 'GET') return next();
            const [rawPathname] = req.url.split('?');
            const pathname = decodeURIComponent(rawPathname);
            if (pathname === '/' || pathname === '/index.html') {
              const rootHtml = path.resolve(__dirname, 'public', '_home.html');
              if (fs.existsSync(rootHtml)) {
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.end(fs.readFileSync(rootHtml, 'utf-8'));
                return;
              }
            }
            const cleanSubpath = pathname.replace(/^\/+|\/+$/g, '');
            if (cleanSubpath && !path.extname(cleanSubpath)) {
              const candidate = path.resolve(__dirname, 'public', cleanSubpath, 'index.html');
              if (fs.existsSync(candidate)) {
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.end(fs.readFileSync(candidate, 'utf-8'));
                return;
              }
            } else if (cleanSubpath.endsWith('/index.html')) {
              const candidate = path.resolve(__dirname, 'public', cleanSubpath);
              if (fs.existsSync(candidate)) {
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.end(fs.readFileSync(candidate, 'utf-8'));
                return;
              }
            }
            next();
          });
        },
        closeBundle() {
          const homeHtml = path.resolve(__dirname, 'public', '_home.html');
          const distIndex = path.resolve(__dirname, 'dist', 'index.html');
          if (fs.existsSync(homeHtml) && fs.existsSync(path.resolve(__dirname, 'dist'))) {
            fs.copyFileSync(homeHtml, distIndex);
          }
        },
      },
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
