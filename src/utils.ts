import {
  promises as fs,
  readFileSync as _readFileSync,
  constants as FS_CONSTANTS,
} from "node:fs";
import { createHash } from "node:crypto";
import { resolvePath } from "@nuxt/kit";
import { parse as parsePath, relative, join } from "pathe";
import type { I18nRoutingOptions, LocaleObject } from "vue-i18n-routing";
import { parse as _parseCode } from "@babel/parser";
import type { File } from "@babel/types";
import { isString } from "@intlify/shared";
// @ts-ignore
import { transform as stripType } from "@mizchi/sucrase";
import type { VueI18nConfigPathInfo, LocaleType, LocaleFile } from "./types";

export const NULL_HASH = "00000000" as const;

export const TS_EXTENSIONS = [".ts", ".cts", ".mts"];
export const JS_EXTENSIONS = [".js", ".cjs", ".mjs"];
export const EXECUTABLE_EXTENSIONS = [...JS_EXTENSIONS, ...TS_EXTENSIONS];

export const normalizeWithUnderScore = (name: string) =>
  name.replace(/-/g, "_").replace(/\./g, "_").replace(/\//g, "_");

export const getLocalePaths = (locale: LocaleObject): string[] => {
  if (locale.file != null) {
    return [locale.file as unknown as LocaleFile].map((x) =>
      typeof x === "string" ? x : x.path
    );
  }

  if (locale.files != null) {
    return [...locale.files].map((x) => (typeof x === "string" ? x : x.path));
  }

  return [];
};

export function getHash(text: Buffer | string): string {
  return createHash("sha256").update(text).digest("hex").substring(0, 8);
}

export function readFileSync(path: string) {
  return _readFileSync(path, { encoding: "utf-8" });
}

export async function isExists(path: string) {
  try {
    await fs.access(path, FS_CONSTANTS.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

export async function resolveVueI18nConfigInfo(
  options: { vueI18n?: string },
  buildDir: string,
  rootDir: string
) {
  const configPathInfo: Required<VueI18nConfigPathInfo> = {
    relativeBase: relative(buildDir, rootDir),
    relative: options.vueI18n ?? "i18n.config",
    absolute: "",
    rootDir,
    hash: NULL_HASH,
    type: "unknown",
    meta: {
      path: "",
      loadPath: "",
      type: "unknown",
      hash: NULL_HASH,
      key: "",
      parsed: { base: "", dir: "", ext: "", name: "", root: "" },
    },
  };

  const absolutePath = await resolvePath(configPathInfo.relative, {
    cwd: rootDir,
    extensions: EXECUTABLE_EXTENSIONS,
  });
  if (!(await isExists(absolutePath))) return undefined;

  const parsed = parsePath(absolutePath);
  const loadPath = join(
    configPathInfo.relativeBase,
    relative(rootDir, absolutePath)
  );

  configPathInfo.absolute = absolutePath;
  configPathInfo.type = getLocaleType(absolutePath);
  configPathInfo.hash = getHash(loadPath);

  const key = `${normalizeWithUnderScore(configPathInfo.relative)}_${
    configPathInfo.hash
  }`;

  configPathInfo.meta = {
    path: absolutePath,
    type: configPathInfo.type,
    hash: configPathInfo.hash,
    loadPath,
    parsed,
    key,
  };

  return configPathInfo;
}

function getLocaleType(path: string): LocaleType {
  const ext = parsePath(path).ext;
  if (EXECUTABLE_EXTENSIONS.includes(ext)) {
    const code = readCode(path, ext);
    const parsed = parseCode(code, path);
    const analyzed = scanProgram(parsed.program);
    if (analyzed === "object") {
      return "static";
    } else if (analyzed === "function" || analyzed === "arrow-function") {
      return "dynamic";
    } else {
      return "unknown";
    }
  } else {
    return "static";
  }
}

const PARSE_CODE_CACHES = new Map<string, ReturnType<typeof _parseCode>>();

function parseCode(code: string, path: string) {
  if (PARSE_CODE_CACHES.has(path)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return PARSE_CODE_CACHES.get(path)!;
  }

  const parsed = _parseCode(code, {
    allowImportExportEverywhere: true,
    sourceType: "module",
  });

  PARSE_CODE_CACHES.set(path, parsed);
  return parsed;
}

function scanProgram(program: File["program"] /*, calleeName: string*/) {
  let ret: false | "object" | "function" | "arrow-function" = false;
  for (const node of program.body) {
    if (node.type === "ExportDefaultDeclaration") {
      if (node.declaration.type === "ObjectExpression") {
        ret = "object";
        break;
      } else if (
        node.declaration.type === "CallExpression" &&
        node.declaration.callee.type === "Identifier" // &&
        // node.declaration.callee.name === calleeName
      ) {
        const [fnNode] = node.declaration.arguments;
        if (fnNode.type === "FunctionExpression") {
          ret = "function";
          break;
        } else if (fnNode.type === "ArrowFunctionExpression") {
          ret = "arrow-function";
          break;
        }
      }
    }
  }
  return ret;
}

export function readCode(absolutePath: string, ext: string) {
  let code = readFileSync(absolutePath);
  if (TS_EXTENSIONS.includes(ext)) {
    const out = stripType(code, {
      transforms: ["jsx"],
      keepUnusedImports: true,
    });
    code = out.code;
  }
  return code;
}

export function getNormalizedLocales(
  locales: I18nRoutingOptions["locales"]
): LocaleObject[] {
  locales = locales || [];
  const normalized: LocaleObject[] = [];
  for (const locale of locales) {
    if (isString(locale)) {
      normalized.push({ code: locale, iso: locale });
    } else {
      normalized.push(locale);
    }
  }
  return normalized;
}
