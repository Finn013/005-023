import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: 
    process.env.NODE_ENV === 'production'
      ? '/005-023/'
      : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'Текстовый редактор',
        short_name: 'Редактор',
        description: 'Полнофункциональный текстовый редактор с поддержкой вкладок, таблиц и форматирования',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: 
          process.env.NODE_ENV === 'production'
            ? '/005-023/'
            : '/',
        start_url: 
          process.env.NODE_ENV === 'production'
            ? '/005-023/'
            : '/',
        lang: 'ru',
        icons: [
          {
            src: 
              process.env.NODE_ENV === 'production'
                ? '/005-023/icons/icon-72x72.png'
                : '/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: 
              process.env.NODE_ENV === 'production'
                ? '/005-023/icons/icon-96x96.png'
                : '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: 
              process.env.NODE_ENV === 'production'
                ? '/005-023/icons/icon-128x128.png'
                : '/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: 
              process.env.NODE_ENV === 'production'
                ? '/005-023/icons/icon-144x144.png'
                : '/icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: 
              process.env.NODE_ENV === 'production'
                ? '/005-023/icons/icon-152x152.png'
                : '/icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: 
              process.env.NODE_ENV === 'production'
                ? '/005-023/icons/icon-192x192.png'
                : '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: 
              process.env.NODE_ENV === 'production'
                ? '/005-023/icons/icon-384x384.png'
                : '/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: 
              process.env.NODE_ENV === 'production'
                ? '/005-023/icons/icon-512x512.png'
                : '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any'
          }
        ],
        shortcuts: [
          {
            name: 'Создать новый документ',
            short_name: 'Новый',
            description: 'Создать новую вкладку для редактирования',
            url: 
              process.env.NODE_ENV === 'production'
                ? '/005-023/?action=new'
                : '/?action=new',
            icons: [{ src: 
              process.env.NODE_ENV === 'production'
                ? '/005-023/icons/icon-96x96.png'
                : '/icons/icon-96x96.png', sizes: '96x96' }]
          }
        ],
        categories: ['productivity', 'utilities']
      }
    })
  ],
  build: {
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
