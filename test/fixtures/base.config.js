import { resolve } from "path";
import { fileURLToPath } from "node:url";
import Module from "../../src/module";

const config = {
  rootDir: fileURLToPath(new URL("../../", import.meta.url)),
  dev: false,
  telemetry: false,
  build: {
    quiet: true,
  },
  render: {
    resourceHints: false,
  },
  modules: ["@nuxtjs/i18n", Module],
  buildModules: [],
  i18n: {
    baseUrl: "nuxt-app.localhost",
    locales: [
      {
        code: "en",
        iso: "en",
        name: "English",
      },
      {
        code: "fr",
        iso: "fr-FR",
        name: "Français",
      },
    ],
    defaultLocale: "en",
    lazy: false,
    vueI18nLoader: true,
  },
};

export default config;
