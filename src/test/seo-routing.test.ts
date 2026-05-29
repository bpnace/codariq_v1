import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function readProjectFile(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("technical SEO routing", () => {
  it("keeps generated homepage aliases on the root canonical", () => {
    const layout = readProjectFile("src/layouts/Base.astro");
    const htaccess = readProjectFile("public/.htaccess");

    expect(layout).toContain('if (pathname === "/index")');
    expect(htaccess).toContain(
      "RewriteRule ^index(\\.html)?/?$ https://codariq.de/ [R=301,L,NC]",
    );
  });

  it("keeps legacy ROI slugs on a single canonical redirect rule", () => {
    const htaccess = readProjectFile("public/.htaccess");

    expect(htaccess).toContain(
      "RewriteRule ^blog/automatisierung-roi-maximieren/?$ /blog/ki-agenten-roi-berechnen [R=301,L]",
    );
  });

  it("keeps technical endpoints out of crawler page discovery", () => {
    const robots = readProjectFile("public/robots.txt");
    const webhookProxy = readProjectFile("public/webhook-proxy.php");
    const newsletterProxy = readProjectFile("public/newsletter-proxy.php");

    for (const directive of [
      "Disallow: /api/",
      "Disallow: /webhook-proxy.php",
      "Disallow: /newsletter-proxy.php",
    ]) {
      expect(robots).toContain(directive);
    }
    expect(webhookProxy).toContain(
      "header('X-Robots-Tag: noindex, nofollow');",
    );
    expect(newsletterProxy).toContain(
      "header('X-Robots-Tag: noindex, nofollow');",
    );
  });

  it("uses the current remediation article update date in the sitemap", () => {
    const astroConfig = readProjectFile("astro.config.mjs");

    expect(astroConfig).toContain("/blog/ki-remediation-projekte-retten");
    expect(astroConfig).toContain("2026-05-08T21:15:00.000Z");
  });

  it("pins blog sitemap dates instead of using build time for every post", () => {
    const astroConfig = readProjectFile("astro.config.mjs");

    expect(astroConfig).toContain("/blog/ki-integration-roadmap-agenten");
    expect(astroConfig).toContain("2026-05-29T07:30:00.000Z");
    expect(astroConfig).toContain('else if (pathname.startsWith("/blog/"))');
    expect(astroConfig).not.toContain(
      'else if (url.includes("/blog/") && !url.endsWith("/blog"))',
    );
  });
});
