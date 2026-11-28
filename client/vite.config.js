import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    hmr: {
      clientPort: 5173
    },
    watch: {
      ignored: ['**/android/**', '**/downloads/**']
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      },
      '/download': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      },
      '/downloads': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://127.0.0.1:5000',
        ws: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            if (err.code !== 'ECONNABORTED' && err.code !== 'ECONNRESET') {
              console.error('[vite-ws-error]', err);
            }
          });
        }
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-map': ['leaflet', 'react-leaflet'],
          'vendor-icons': ['lucide-react'],
          'vendor-socket': ['socket.io-client']
        }
      }
    }
  }
});
