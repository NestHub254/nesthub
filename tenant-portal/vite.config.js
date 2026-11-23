import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const base = process.env.VITE_FIREBASE_MOUNTED === 'true' ? '/tenant/' : '/';

export default defineConfig({
  base,
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
        id: base,
        start_url: base,
        scope: base,
        icons: [
          { src: `${base}brand/tenant-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: `${base}brand/tenant-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: `${base}brand/tenant-maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [{ urlPattern: /^https?:\/\/.*\/api\/.*/, handler: 'NetworkOnly' }]
      }
    })
  ]
});
