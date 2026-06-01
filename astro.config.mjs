// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { EnumChangefreq } from "sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
const legacyRoutes = [
  "/automatisierungs-check",
  "/automatisierung-selbststaendige",
  "/automatisierung-gruender",
  "/automatisierung-kleine-teams",
  "/blog/automatisierung-roi-maximieren",
];

const engpassLandingSlugs = [
  "/ki-terminvorbereitung",
  "/ki-wissensmanagement",
  "/ki-anfragebearbeitung",
  "/ki-entscheidungsgrundlage",
  "/ki-management-reporting",
  "/ki-dokumentenablage",
];

export default defineConfig({
  site: "https://codariq.de",
  base: "/",
  trailingSlash: "never",
  build: {
    format: "file",
  },
  integrations: [
    sitemap({
      filter(page) {
        const pathname = new URL(page).pathname.replace(/\/$/, "");
        return !legacyRoutes.includes(pathname);
      },
      i18n: {
        defaultLocale: "de",
        locales: {
          de: "de-DE",
        },
      },
      serialize(item) {
        // Add lastmod, changefreq, and priority to sitemap entries
        const url = item.url;
        const pathname = new URL(url).pathname.replace(/\/$/, "") || "/";
        const now = new Date();
        const latestBlogLastmod = "2026-05-29T07:30:00.000Z";

        const fixedBlogLastmodByPath = new Map([
          ["/blog/ki-integration-roadmap-agenten", latestBlogLastmod],
          [
            "/blog/ki-integration-bestehende-systeme",
            "2026-05-08T20:45:00.000Z",
          ],
          [
            "/blog/ki-mitarbeiterumfragen-automatisieren",
            "2026-05-08T20:45:00.000Z",
          ],
          ["/blog/ki-remediation-projekte-retten", "2026-05-08T21:15:00.000Z"],
          ["/blog/ki-projekte-retten", "2026-05-08T21:15:00.000Z"],
          ["/blog/ki-agenten-roi-berechnen", "2026-05-08T20:45:00.000Z"],
          ["/blog/ki-integration-5-schritte", "2026-05-08T20:45:00.000Z"],
          ["/blog/ki-teams-vorbereiten", "2026-05-05T15:00:00.000Z"],
          ["/blog/ki-compliance-2025", "2025-01-15T09:00:00.000Z"],
        ]);
        const fixedBlogLastmod = fixedBlogLastmodByPath.get(pathname);

        if (fixedBlogLastmod) {
          item.lastmod = new Date(fixedBlogLastmod).toISOString();
          item.changefreq = EnumChangefreq.MONTHLY;
          item.priority = 0.9;
        }
        // Dynamic or externally sourced blog pages should not inherit build time.
        else if (pathname.startsWith("/blog/")) {
          delete item.lastmod;
          item.changefreq = EnumChangefreq.MONTHLY;
          item.priority = 0.6;
        }
        // Blog index page (updated with newest post)
        else if (pathname === "/blog") {
          item.lastmod = new Date(latestBlogLastmod).toISOString();
          item.changefreq = EnumChangefreq.WEEKLY;
          item.priority = 0.7;
        }
        // Homepage (recently updated with pricing changes)
        else if (
          url === "https://codariq.de/" ||
          url === "https://codariq.de"
        ) {
          item.lastmod = now.toISOString();
          item.changefreq = EnumChangefreq.WEEKLY;
          item.priority = 1.0;
        }
        // Agent landing pages and readiness quiz - high priority conversion pages
        else if (
          url.includes("/ki-agenten-") ||
          engpassLandingSlugs.includes(pathname) ||
          url.includes("/agent-readiness")
        ) {
          item.lastmod = now.toISOString();
          item.changefreq = EnumChangefreq.WEEKLY;
          item.priority = 0.8;
        }
        // Other pages (legal, FAQ, etc.)
        else {
          item.lastmod = now.toISOString();
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
            warning.message.includes(
              "astro/dist/assets/utils/remotePattern.js",
            ) &&
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
