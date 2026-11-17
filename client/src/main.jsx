import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import 'leaflet/dist/leaflet.css';
import './index.css';

// Universal Dynamic API Backend Base URL Resolver
const getDynamicApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    const savedServer = localStorage.getItem('jobscout_server_url');
    if (savedServer) return savedServer.replace(/\/+$/, '');

    const isNativeCapacitor = Boolean(
      (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) ||
      window.location.protocol === 'capacitor:' ||
      window.location.protocol === 'ionic:' ||
      window.location.protocol === 'file:' ||
      (window.location.hostname === 'localhost' && (!window.location.port || window.location.port === '80' || window.location.port === '443'))
    );

    if (isNativeCapacitor) {
      // Connect to local development machine on LAN Wi-Fi
      return 'http://192.168.11.22:5000';
    }
  }
  return '';
};

// Global Fetch Interceptor: Routes /api and /download to correct backend base URL
const originalFetch = window.fetch;
window.fetch = (input, init) => {
  const apiBase = getDynamicApiBase();
  if (apiBase) {
    if (typeof input === 'string') {
      if (input.startsWith('/api') || input.startsWith('/download') || input.startsWith('/socket.io')) {
        return originalFetch(`${apiBase}${input}`, init);
      }
    } else if (input instanceof Request && typeof input.url === 'string') {
      try {
        const parsed = new URL(input.url);
        if (parsed.pathname.startsWith('/api') || parsed.pathname.startsWith('/download')) {
          const newUrl = `${apiBase}${parsed.pathname}${parsed.search}`;
          return originalFetch(new Request(newUrl, input), init);
        }
      } catch {}
    }
  }
  return originalFetch(input, init);
};

// Bulletproof Safe Response.json Guard: Prevents HTML 404/500/offline pages from crashing the app with raw SyntaxError
const originalResponseJson = Response.prototype.json;
Response.prototype.json = async function () {
  try {
    const contentType = this.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      console.warn(`[JSON-Shield] Non-JSON HTML response received from ${this.url || 'endpoint'} (Status: ${this.status})`);
      return {
        error: `Server responded with ${this.status} ${this.statusText || 'Error'} (non-JSON)`,
        isHtmlResponse: true,
        status: this.status
      };
    }
    return await originalResponseJson.call(this);
  } catch (err) {
    console.warn(`[JSON-Shield] Caught JSON parse exception from ${this.url || 'endpoint'}:`, err.message);
    return {
      error: err.message || 'Failed to parse JSON response',
      isParseError: true,
      status: this.status
    };
  }
};

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
