import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// No /api proxy anymore - the backend URL is configured explicitly via
// VITE_API_URL (see src/api/client.js), which points at the deployed
// Spring Boot service (or http://localhost:8080 while developing).
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'NestHub',
        short_name: 'NestHub',
        description: 'Rental living, simplified.',
        theme_color: '#102b25',
        background_color: '#fbfbfd',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }
        ]
      },
      workbox: {
        // Network-first: a deployed update should never be hidden behind a stale cache.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\/api\/.*/,
            handler: 'NetworkOnly'
          }
        ]
      }
    })
  ]
});
