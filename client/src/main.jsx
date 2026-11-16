import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import 'leaflet/dist/leaflet.css';
import './index.css';

// Automatically route API requests to remote backend if VITE_API_URL is configured (e.g. for decoupled deployments)
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

// Register Service Worker for Native Mobile App & Offline PWA
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const isLocalOrLan = Boolean(
      window.location.hostname === 'localhost' ||
      window.location.hostname === '[::1]' ||
      window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/) ||
      window.location.hostname.startsWith('192.168.') ||
      window.location.hostname.startsWith('10.') ||
      window.location.hostname.startsWith('172.')
    );

    if (window.location.protocol === 'https:' || isLocalOrLan) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('📱 JobScout Mobile PWA active. Scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] ServiceWorker notice:', err);
        });
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
