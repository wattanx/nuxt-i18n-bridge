import type { ParsedPath } from "node:path";
import type { LocaleObject, I18nRoutingOptions } from "vue-i18n-routing";

export type PrerenderTarget = {
  type: "locale" | "config";
  path: string;
};

export type FileMeta = {
  path: string;
  loadPath: string;
  hash: string;
  type: LocaleType;
  parsed: ParsedPath;
  key: string;
};

export type LocaleType = "static" | "dynamic" | "unknown";

export type LocaleFile = { path: string; cache?: boolean };

export type LocaleInfo = {
  /**
   * NOTE:
   *  The following fields are for `file` in the nuxt i18n module `locales` option
   */
  path?: string; // abolute path
  hash?: string;
  type?: LocaleType;
  /**
   * NOTE:
   *  The following fields are for `files` (excludes nuxt layers) in the nuxt i18n module `locales` option.
   */
  paths?: string[];
  hashes?: string[];
  types?: LocaleType[];
} & Omit<LocaleObject, "file" | "files"> & {
    files: LocaleFile[];
    meta?: (FileMeta & { file: LocaleFile })[];
  };

export type VueI18nConfigPathInfo = {
  relative?: string;
  absolute?: string;
  hash?: string;
  type?: LocaleType;
  rootDir: string;
  relativeBase: string;
  meta: FileMeta;
};

export type NuxtI18nOptions = {
  vueI18n?: string;
  locales: I18nRoutingOptions["locales"];
};
