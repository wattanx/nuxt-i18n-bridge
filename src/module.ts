import {
  defineNuxtModule,
  addImports,
  addPluginTemplate,
  addTemplate,
} from "@nuxt/kit";
import { resolve } from "pathe";
import { Nuxt } from "@nuxt/schema";
import { distDir } from "./dirs";
import { resolveVueI18nConfigInfo } from "./utils";
import { generateLoaderOptions } from "./gen";

export default defineNuxtModule({
  meta: {
    name: "@wattanx/nuxt-i18n-bridge",
    compatibility: {
      bridge: true,
    },
  },
  async setup(_, nuxt: Nuxt & { options: { vueI18n?: string; i18n: any } }) {
    addImports([
      {
        name: "useI18n",
        from: "vue-i18n-bridge",
      },
    ]);

    const appPlugin = addPluginTemplate(resolve(distDir, "runtime/plugin.mjs"));
    nuxt.hook("modules:done", () => {
      nuxt.options.plugins.unshift(appPlugin);
    });

    const vueI18nConfigPaths = await resolveLayerVueI18nConfigInfo(
      nuxt,
      nuxt.options.buildDir
    );

    const { nuxtI18nOptions, vueI18nConfigs } = generateLoaderOptions(nuxt, {
      nuxtI18nOptions: {
        vueI18n: nuxt.options.vueI18n,
        locales: nuxt.options.i18n?.locales,
      },
      vueI18nConfigPaths,
    });

    addTemplate({
      filename: "i18n.options.mjs",
      getContents: () =>
        `
export const resolveNuxtI18nOptions = async () => {
  const nuxtI18nOptions = ${JSON.stringify(nuxtI18nOptions, null, 2)};

  const vueI18nConfigLoader = async loader => {
    const config = await loader().then(r => r.default || r)
    if (typeof config === 'object') return config
    if (typeof config === 'function') return await config()
    return {}
  }

  const deepCopy = (src, des, predicate) => {
    for (const key in src) {
      if (typeof src[key] === 'object') {
        if (!(typeof des[key] === 'object')) des[key] = {}
        deepCopy(src[key], des[key], predicate)
      } else {
        if (predicate) {
          if (predicate(src[key], des[key])) {
            des[key] = src[key]
          }
        } else {
          des[key] = src[key]
        }
      }
    }
  }
  const mergeVueI18nConfigs = async (loader) => {
    const layerConfig = await vueI18nConfigLoader(loader)
    const cfg = layerConfig || {}
    
    for (const [k, v] of Object.entries(cfg)) {
      if(nuxtI18nOptions.vueI18n?.[k] === undefined || typeof nuxtI18nOptions.vueI18n?.[k] !== 'object') {
        nuxtI18nOptions.vueI18n[k] = v
      } else {
        deepCopy(v, nuxtI18nOptions.vueI18n[k])
      }
    }
  }

  nuxtI18nOptions.vueI18n = { messages: {} }
  await mergeVueI18nConfigs(${vueI18nConfigs[0]})

  
  return nuxtI18nOptions;
}`,
    });
  },
});

export async function resolveLayerVueI18nConfigInfo(
  nuxt: Nuxt & { options: { vueI18n?: string } },
  buildDir: string
) {
  const resolved = await resolveVueI18nConfigInfo(
    {
      vueI18n: nuxt.options.vueI18n,
    },
    buildDir,
    nuxt.options.rootDir
  );

  return [resolved];
}
