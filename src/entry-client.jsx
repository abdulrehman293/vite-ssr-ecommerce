import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import App from './App';

// Pick up the data injected by the backend
const preloadedData = window.__PRELOADED_DATA__;

hydrateRoot(
  document.getElementById('root'),
  <React.StrictMode>
    <App products={preloadedData} />
  </React.StrictMode>
);
