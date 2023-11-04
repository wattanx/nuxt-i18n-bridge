import { defineNuxtConfig } from "@nuxt/bridge";

export default defineNuxtConfig({
  ssr: false,
  telemetry: false,
  bridge: {
    vite: false,
    nitro: true,
  },
  build: {
    quiet: true,
  },
  modules: ["@nuxtjs/i18n"],
  // @ts-ignore
  buildModules: ["../../src/module"],
  typescript: {
    tsConfig: {
      compilerOptions: {
        types: ["@nuxtjs/i18n"],
      },
    },
  },
});
