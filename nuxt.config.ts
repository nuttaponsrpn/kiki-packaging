// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: false,

  modules: ["@nuxt/eslint", "@nuxt/hints", "@nuxt/image", "@nuxt/ui", "@nuxtjs/i18n"],

  css: ["~/assets/css/main.css"],

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
