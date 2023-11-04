import Vue from "vue";
import VueI18n from "vue-i18n";
import { createI18n } from "vue-i18n-bridge";
import { resolveNuxtI18nOptions } from "#build/i18n.options.mjs";

export default async function () {
  Vue.use(VueI18n, { bridge: true });

  const nuxtI18nOptions = await resolveNuxtI18nOptions();

  const i18n = createI18n(nuxtI18nOptions.vueI18n, VueI18n);

  Vue.use(i18n);
}
