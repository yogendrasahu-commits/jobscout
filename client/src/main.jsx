import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'leaflet/dist/leaflet.css';
import './index.css';

// Automatically route API requests to remote backend if VITE_API_URL is configured (e.g. for decoupled Vercel + Render deployments)
if (import.meta.env.VITE_API_URL) {
  const backendBase = import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  const originalFetch = window.fetch;
  window.fetch = (url, options) => {
    if (typeof url === 'string' && url.startsWith('/api')) {
      return originalFetch(`${backendBase}${url}`, options);
    }
    return originalFetch(url, options);
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
