import fs from 'node:fs/promises';
import express from 'express';

const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 3000;
const base = process.env.BASE || '/';

const app = express();

let vite;

if (!isProduction) {
  // We are in dev mode. Load Vite tools.
  const { createServer } = await import('vite');
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base
  });
  app.use(vite.middlewares);
} else {
  // We are in production. Keep it fast and light.
  const compression = (await import('compression')).default;
  const sirv = (await import('sirv')).default;
  app.use(compression());
  app.use(base, sirv('./dist/client', { extensions: [] }));
}

// Reach out to the Fake Store API
async function fetchStoreData() {
  const response = await fetch('https://fakestoreapi.com/products?limit=8');
  return await response.json();
}

app.use('{*path}', async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '');
    let template, render;

    // Grab the store data before doing anything else
    const productsData = await fetchStoreData();

    if (!isProduction) {
      // Dev mode: read the raw HTML and let Vite process it
      template = await fs.readFile('./index.html', 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      render = (await vite.ssrLoadModule('/src/entry-server.jsx')).render;
    } else {
      // Prod mode: read the pre-built HTML from the dist folder
      template = await fs.readFile('./dist/client/index.html', 'utf-8');
      render = (await import('./dist/server/entry-server.js')).render;
    }

    // Fire the render function and pass in the products
    const rendered = await render(url, productsData);

    // Turn the data into a string and put it on the window object
    const dataScript = `<script>window.__PRELOADED_DATA__ = ${JSON.stringify(productsData).replace(/</g, '\\u003c')}</script>`;
      
    // Swap the placeholders with real content
    const html = template
      .replace(`<!--app-html-->`, rendered.html ?? '')
      .replace(`</head>`, `${dataScript}</head>`);

    res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
  } catch (error) {
    vite?.ssrFixStacktrace(error);
    console.log(error.stack);
    res.status(500).end(error.stack);
  }
});

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});