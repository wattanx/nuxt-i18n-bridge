import { LocaleObject } from "vue-i18n-routing";
import type { Nuxt } from "@nuxt/schema";
import { genDynamicImport } from "knitwork";
import { withQuery } from "ufo";
import type {
  VueI18nConfigPathInfo,
  LocaleInfo,
  NuxtI18nOptions,
  FileMeta,
  PrerenderTarget,
} from "./types";
import { getLocalePaths } from "./utils";
import { EXECUTABLE_EXTENSIONS } from "./constants";

export type LoaderOptions = {
  vueI18nConfigPaths: Required<VueI18nConfigPathInfo>[];
  localeInfo: LocaleInfo[];
  nuxtI18nOptions: NuxtI18nOptions;
};

function genImportSpecifier(
  {
    loadPath,
    path,
    parsed,
    hash,
    type,
  }: Pick<FileMeta, "loadPath" | "path" | "parsed" | "hash" | "type">,
  resourceType: PrerenderTarget["type"] | undefined,
  query: Record<string, string> = {}
) {
  if (!EXECUTABLE_EXTENSIONS.includes(parsed.ext)) return loadPath;

  if (resourceType != null && type === "unknown") {
    throw new Error(`'unknown' type in '${path}'.`);
  }

  if (resourceType === "locale") {
    return withQuery(loadPath, type === "dynamic" ? { hash, ...query } : {});
  }

  if (resourceType === "config") {
    return withQuery(loadPath, { hash, ...query, ...{ config: 1 } });
  }

  return loadPath;
}

const generateVueI18nConfiguration = (
  config: Required<VueI18nConfigPathInfo>
): string => {
  return genDynamicImport(genImportSpecifier(config.meta, "config"), {
    comment: `webpackChunkName: ${config.meta.key}`,
  });
};

function simplifyLocaleOptions(nuxt: Nuxt, locales: LocaleObject[]) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return locales.map(({ meta, ...locale }) => {
    if (locale.file || (locale.files?.length ?? 0) > 0) {
      locale.files = getLocalePaths(locale);
    } else {
      delete locale.files;
    }
    delete locale.file;

    return locale;
  });
}

export function generateLoaderOptions(
  nuxt: Nuxt,
  {
    nuxtI18nOptions,
    vueI18nConfigPaths,
  }: Pick<LoaderOptions, "nuxtI18nOptions" | "vueI18nConfigPaths">
) {
  const vueI18nConfigImports = vueI18nConfigPaths
    .filter((config) => config.absolute !== "")
    .map((config) => generateVueI18nConfiguration(config));

  const generatedNuxtI18nOptions = {
    ...nuxtI18nOptions,
    locales: simplifyLocaleOptions(
      nuxt,
      (nuxtI18nOptions?.locales ?? []) as unknown as LocaleObject[]
    ),
  };
  delete nuxtI18nOptions.vueI18n;

  const generated = {
    nuxtI18nOptions: generatedNuxtI18nOptions,
    vueI18nConfigs: vueI18nConfigImports,
  };

  return generated;
}
