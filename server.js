import fs from 'node:fs/promises';
import path from 'node:path';
import express from 'express';
import compression from 'compression';
import sirv from 'sirv';

const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 3000;
const base = process.env.BASE || '/';

const app = express();

let vite;

if (!isProduction) {
  const { createServer } = await import('vite');
  vite = await createServer({
    server: { 
      middlewareMode: true,
      allowedHosts: true
    },
    appType: 'custom',
    base
  });
  app.use(vite.middlewares);
} else {
  app.use(compression());
  app.use(base, sirv(path.resolve(import.meta.dirname, 'dist/client'), { extensions: [] }));
}

async function fetchStoreData() {
  const response = await fetch('https://fakestoreapi.com/products?limit=8');
  return await response.json();
}

app.use('{*path}', async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '');
    let template, render;

    const productsData = await fetchStoreData();

    if (!isProduction) {
      template = await fs.readFile(path.resolve(import.meta.dirname, 'index.html'), 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      render = (await vite.ssrLoadModule('/src/entry-server.jsx')).render;
    } else {
      template = await fs.readFile(path.resolve(import.meta.dirname, 'dist/client/index.html'), 'utf-8');
      const serverEntryPath = path.resolve(import.meta.dirname, 'dist/server/entry-server.js');
      render = (await import(serverEntryPath)).render;
    }

    const rendered = await render(url, productsData);

    const dataScript = `<script>window.__PRELOADED_DATA__ = ${JSON.stringify(productsData).replace(/</g, '\\u003c')}</script>`;
      
    const html = template
      .replace(`<!--app-html-->`, rendered.html ?? '')
      .replace(`</head>`, `${dataScript}</head>`);

    res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
  } catch (error) {
    vite?.ssrFixStacktrace(error);
    console.error(error.stack);
    res.status(500).end(error.stack);
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${port}`);
});