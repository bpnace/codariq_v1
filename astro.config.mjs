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
      serialize(item) {
        // Add lastmod, changefreq, and priority to sitemap entries
        const url = item.url;

        // Blog posts get higher priority and more frequent updates
        if (url.includes('/blog/') && !url.endsWith('/blog')) {
          item.lastmod = new Date('2025-10-22');
          item.changefreq = 'monthly';
          item.priority = 0.8;
        }
        // Blog index page
        else if (url.endsWith('/blog')) {
          item.lastmod = new Date('2025-10-22');
          item.changefreq = 'weekly';
          item.priority = 0.7;
        }
        // Homepage
        else if (url === 'https://codariq.de/' || url === 'https://codariq.de') {
          item.lastmod = new Date('2025-10-22');
          item.changefreq = 'weekly';
          item.priority = 1.0;
        }
        // Other pages (legal, FAQ, etc.)
        else {
          item.lastmod = new Date('2025-10-22');
          item.changefreq = 'monthly';
          item.priority = 0.5;
        }

        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
