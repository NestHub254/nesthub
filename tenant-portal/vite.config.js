import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['brand/tenant-mark.svg', 'brand/tenant-favicon.ico', 'brand/tenant-180.png', 'brand/tenant-32.png'],
      manifest: {
        name: 'NestHub Tenants',
        short_name: 'NH Tenants',
        description: 'Pay rent, raise tickets, stay connected to your building.',
        theme_color: '#A53F37',
        background_color: '#f7f7fc',
        display: 'standalone',
        id: '/',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/brand/tenant-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/brand/tenant-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/brand/tenant-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [{ urlPattern: /^https?:\/\/.*\/api\/.*/, handler: 'NetworkOnly' }]
      }
    })
  ]
});
