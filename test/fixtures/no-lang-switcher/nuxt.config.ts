import { defineNuxtConfig } from "@nuxt/bridge";
import { resolve } from "path";
import BaseConfig from "../base.config";

export default defineNuxtConfig({
  ...BaseConfig,
  buildDir: resolve(__dirname, ".nuxt"),
  srcDir: __dirname,
});
