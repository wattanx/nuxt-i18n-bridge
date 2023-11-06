import { defineNuxtConfig } from "@nuxt/bridge";
import { resolve } from "path";
import BaseConfig from "../base.config";

export default defineNuxtConfig({
  ...BaseConfig,
  rootDir: __dirname,
  buildDir: resolve(__dirname, ".nuxt"),
  srcDir: __dirname,
});
