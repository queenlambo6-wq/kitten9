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
          const injectDownloadBar = (html: string) => {
            const bar = `<div style="position:fixed;left:18px;bottom:18px;z-index:9999;display:flex;gap:8px;align-items:center;background:#102C25;color:#fff;padding:10px 16px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.3);font-family:system-ui,sans-serif;font-size:14px;border:2px solid #D86F45;">
              <a href="/gatitosenespana-hostinger-updated.zip" download="gatitosenespana-hostinger.zip" style="color:#fff;text-decoration:none;font-weight:700;display:flex;align-items:center;gap:8px;">
                <span style="background:#D86F45;padding:4px 8px;border-radius:6px;font-size:12px;">ZIP</span>
                ⬇ Descargar archivo para Hostinger (public_html)
              </a>
            </div>`;
            return html.replace('</body>', `${bar}</body>`);
          };

          server.middlewares.use((req, res, next) => {
            if (!req.url || req.method !== 'GET') return next();
            const [rawPathname] = req.url.split('?');
            const pathname = decodeURIComponent(rawPathname);
            if (pathname === '/gatitosenespana-hostinger-updated.zip') {
              const zipPath = path.resolve(__dirname, 'public', 'gatitosenespana-hostinger-updated.zip');
              if (fs.existsSync(zipPath)) {
                res.setHeader('Content-Type', 'application/zip');
                res.setHeader('Content-Disposition', 'attachment; filename="gatitosenespana-hostinger.zip"');
                fs.createReadStream(zipPath).pipe(res);
                return;
              }
            }
            if (pathname === '/' || pathname === '/index.html') {
              const rootHtml = path.resolve(__dirname, 'public', '_home.html');
              if (fs.existsSync(rootHtml)) {
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.end(injectDownloadBar(fs.readFileSync(rootHtml, 'utf-8')));
                return;
              }
            }
            const cleanSubpath = pathname.replace(/^\/+|\/+$/g, '');
            if (cleanSubpath && !path.extname(cleanSubpath)) {
              const candidate = path.resolve(__dirname, 'public', cleanSubpath, 'index.html');
              if (fs.existsSync(candidate)) {
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.end(injectDownloadBar(fs.readFileSync(candidate, 'utf-8')));
                return;
              }
            } else if (cleanSubpath.endsWith('/index.html')) {
              const candidate = path.resolve(__dirname, 'public', cleanSubpath);
              if (fs.existsSync(candidate)) {
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.end(injectDownloadBar(fs.readFileSync(candidate, 'utf-8')));
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
