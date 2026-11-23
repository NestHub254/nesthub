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
      includeAssets: ['brand/owner-mark.svg', 'brand/owner-favicon.ico', 'brand/owner-180.png', 'brand/owner-32.png'],
      manifest: {
        name: 'NestHub Owners',
        short_name: 'NH Owners',
        description: 'Rental living, simplified.',
        theme_color: '#14264B',
        background_color: '#fbfbfd',
        display: 'standalone',
        start_url: '/',
        id: '/',
        scope: '/',
        icons: [
          { src: '/brand/owner-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/brand/owner-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/brand/owner-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api\//],
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
