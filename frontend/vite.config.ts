import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
        navigateFallback: '/index.html', // Para que las rutas SPA funcionen offline o con caché primero
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/diario\.trigamer\.xyz\/api\/v1\/news.*/i,
            handler: 'NetworkFirst' as const,
            options: {
              cacheName: 'api-news-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1 día
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/i,
            handler: 'CacheFirst' as const,
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 días
              }
            }
          }
        ]
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo.png'], // Ajusta según tus assets
      manifest: {
        name: 'Diario CdelU',
        short_name: 'DiarioCdelU',
        description: 'Tu diario digital de Concepción del Uruguay.',
        theme_color: '#ffffff', // Color del tema para la barra de título de la PWA
        background_color: '#ffffff', // Color de fondo para la pantalla de inicio
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'logo-192x192.png', // Necesitarás crear este archivo
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo-512x512.png', // Necesitarás crear este archivo
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'logo-512x512-maskable.png', // Icono maskable (opcional pero recomendado)
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module',
        /* navigateFallback: 'index.html' // Ya está en workbox, pero puede ser útil aquí también si hay problemas específicos del dev server */
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}) 