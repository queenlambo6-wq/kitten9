/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '');
    const targetUrl = pathname ? `/${pathname}/index.html` : '/_home.html';
    fetch(targetUrl)
      .then((res) => (res.ok ? res.text() : fetch('/404.html').then((r) => r.text())))
      .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        if (doc.title) document.title = doc.title;
        document.body.innerHTML = doc.body.innerHTML;
        const loadScript = (src: string) =>
          new Promise<void>((resolve) => {
            const s = document.createElement('script');
            s.src = src;
            s.onload = () => resolve();
            s.onerror = () => resolve();
            document.body.appendChild(s);
          });
        loadScript('/assets/kittens.js').then(() => loadScript('/assets/main.js'));
      });
  }, []);

  return null;
}
