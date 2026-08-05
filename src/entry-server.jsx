import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

export function render(url, data) {
  const html = renderToString(
    <React.StrictMode>
      <App products={data} />
    </React.StrictMode>
  );
  return { html };
}
