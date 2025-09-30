// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://codariq.de",
  base: "/",
  trailingSlash: "never",
  build: {
    format: "directory",
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: "de",
        locales: {
          de: "de-DE",
        },
      },
      canonicalURL: "https://codariq.de",
      filter: (page) =>
        !page.includes("/agb") && !page.includes("/cookie-richtlinien"),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
