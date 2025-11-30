// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: true },
  ssr: false,
  spaLoadingTemplate: 'spa-loading-template.html',
  modules: ['@nuxtjs/tailwindcss', '@vite-pwa/nuxt'],
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    devOptions: {
      enabled: true,
      type: 'module',
    },
    filename: 'manifest.webmanifest',
    manifest: {
      name: 'Kiki POS',
      short_name: 'Kiki POS',
      description: 'Efficient and modern Point of Sale system for your business.',
      theme_color: '#F4C430',
      background_color: '#ffffff',
      display: 'standalone',
      start_url: '/',
      lang: 'en',
      icons: [
        {
          src: '/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: ({ request }) => request.destination === 'image',
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24, // 1 day
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
     client: {
      installPrompt: true,
      periodicSyncForUpdates: 20,
    },
  },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
    }
  },
  app: {
    head: {
      title: 'Kiki POS - Modern Point of Sale',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, interactive-widget=resizes-content' },
        { name: 'description', content: 'Efficient and modern Point of Sale system for your business. Manage sales, products, and analytics with ease.' },
        { name: 'theme-color', content: '#F4C430' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  }
})
