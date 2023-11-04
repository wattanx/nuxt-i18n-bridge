import { fileURLToPath } from "node:url";
import { setup, $fetch } from "@nuxt/test-utils";
import { describe, it, expect } from "vitest";
import { JSDOM } from "jsdom";

const getDom = (html: string) => new JSDOM(html).window.document;

describe("locales as string array", async () => {
  await setup({
    rootDir: fileURLToPath(
      new URL("./fixtures/no-lang-switcher", import.meta.url)
    ),
    nuxtConfig: {
      ssr: true,
      // @ts-ignore
      i18n: {
        locales: ["en", "fr"],
      },
    },
  });

  it("renders default locale", async () => {
    const html = await $fetch("/about");
    const dom = getDom(html);
    expect(dom.querySelector("#current-page")?.textContent).toBe(
      "page: About us"
    );
  });
});
