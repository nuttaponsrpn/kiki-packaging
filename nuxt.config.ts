// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: false,

  app: {
    head: {
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },

  modules: ["@nuxt/eslint", "@nuxt/hints", "@nuxt/image", "@nuxt/ui", "@nuxtjs/i18n", "@vite-pwa/nuxt"],
  
  colorMode: {
    preference: "system",
    fallback: "light",
  },

  css: ["~/assets/css/main.css"],

  pwa: {
    registerType: "autoUpdate",
    devOptions: {
      enabled: true,
      type: "module",
    },
    filename: "manifest.webmanifest",
    manifest: {
      name: "Kiki Packaging Backoffice",
      short_name: "Kiki Pack",
      description: "Efficient and modern packaging management system.",
      theme_color: "#F4C430",
      background_color: "#ffffff",
      display: "standalone",
      start_url: "/",
      lang: "en",
      icons: [
        {
          src: "/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
    workbox: {
      globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
          handler: "NetworkFirst",
          options: {
            cacheName: "api-cache",
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
          urlPattern: ({ request }) => request.destination === "image",
          handler: "CacheFirst",
          options: {
            cacheName: "images-cache",
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

  i18n: {
    locales: [
      { code: "en", name: "English", file: "en.json" },
      { code: "th", name: "ไทย", file: "th.json" },
    ],
    defaultLocale: "en",
    langDir: "locales",
    strategy: "no_prefix",
    compilation: {
      strictMessage: false,
    },
  },

  runtimeConfig: {
    // Private keys (server-side only)
    supabaseServiceKey: process.env.NUXT_SUPABASE_SERVICE_KEY || "",

    // Client-side (public)
    public: {
      appName: "Kiki Packaging Backoffice",
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || "https://api.example.com",
      apiToken: process.env.NUXT_PUBLIC_API_TOKEN || "",
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || "",
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || "",
    },
  },
});
