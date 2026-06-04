// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },
    modules: ["@pinia/nuxt", "@nuxt/icon"],
    app: {
        head: {
            titleTemplate: "%s | Витязь",
        },
    },
    runtimeConfig: {
        internalApiUrl: "",
        public: {
            apiUrl: process.env.NUXT_PUBLIC_API_URL ?? "http://localhost:8000",
        },
    },
    vite: {
        server: {
            allowedHosts: ["localhost", process.env.NUXT_PUBLIC_APP_HOST ?? "localhost:3000"],
        },
    },
});
