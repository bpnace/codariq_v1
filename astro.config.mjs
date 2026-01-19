// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { EnumChangefreq } from "sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://codariq.de",
  base: "/",
  trailingSlash: "never",
  build: {
    format: "file",
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: "de",
        locales: {
          de: "de-DE",
        },
      },
      serialize(item) {
        // Add lastmod, changefreq, and priority to sitemap entries
        const url = item.url;
        const now = new Date();

        // Newest blog post (ki-projekte-retten) - just published
        if (url.includes('/blog/ki-projekte-retten')) {
          item.lastmod = new Date('2025-01-09').toISOString();
          item.changefreq = EnumChangefreq.MONTHLY;
          item.priority = 0.9;
        }
        // Other blog posts get higher priority and more frequent updates
        else if (url.includes('/blog/') && !url.endsWith('/blog')) {
          item.lastmod = new Date('2025-01-01').toISOString();
          item.changefreq = EnumChangefreq.MONTHLY;
          item.priority = 0.8;
        }
        // Blog index page (updated with newest post)
        else if (url.endsWith('/blog')) {
          item.lastmod = new Date('2025-01-09').toISOString();
          item.changefreq = EnumChangefreq.WEEKLY;
          item.priority = 0.7;
        }
        // Homepage (recently updated with pricing changes)
        else if (url === 'https://codariq.de/' || url === 'https://codariq.de') {
          item.lastmod = now.toISOString();
          item.changefreq = EnumChangefreq.WEEKLY;
          item.priority = 1.0;
        }
        // Other pages (legal, FAQ, etc.)
        else {
          item.lastmod = new Date('2025-01-01').toISOString();
          item.changefreq = EnumChangefreq.MONTHLY;
          item.priority = 0.5;
        }

        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        onwarn(warning, defaultHandler) {
          if (
            warning?.code === "UNUSED_EXTERNAL_IMPORT" &&
            typeof warning?.message === "string" &&
            warning.message.includes("astro/dist/assets/utils/remotePattern.js") &&
            warning.message.includes("@astrojs/internal-helpers/remote")
          ) {
            return;
          }

          defaultHandler(warning);
        },
      },
    },
  },
});
