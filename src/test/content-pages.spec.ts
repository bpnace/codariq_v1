import { expect, test } from "@playwright/test";

const SITE_URL = "https://codariq.de";
const HUMANIZER_METADATA_PATTERN =
  /\b(?:triage|echt|echte|echten|echter|echtes|dieser)\b|\bnicht[^"\n.?!]{0,100}\bsondern\b|\bDie Frage ist nicht\b|\bGenau da kippt\b|\bverschwindet nicht\b|\bklingt trocken\b/iu;

const pages = [
  {
    path: "/terminmappe-vor-dem-gespraech",
    title: /Terminmappe vor dem Gespräch/,
    heading: "Terminmappe vor dem Gespräch, ohne Sucherei.",
    minimumFaqs: 8,
  },
  {
    path: "/teamwissen-ohne-zuruf",
    title: /Teamwissen ohne Zuruf/,
    heading: "Teamwissen ohne Zuruf auffindbar machen.",
    minimumFaqs: 8,
  },
  {
    path: "/anfragen-sauber-einordnen",
    title: /Anfragen sauber einordnen/,
    heading: "Anfragen einordnen, bevor jemand zurückruft.",
    minimumFaqs: 8,
  },
  {
    path: "/entscheidungen-vorbereiten",
    title: /Entscheidungen vorbereiten/,
    heading: "Entscheidungen mit vorbereitetem Stand treffen.",
    minimumFaqs: 8,
  },
  {
    path: "/chef-ueberblick-ohne-nachfragen",
    title: /Chef-Überblick ohne Nachfragen/,
    heading: "Chef-Überblick ohne Nachfragen.",
    minimumFaqs: 8,
  },
  {
    path: "/daten-und-unterlagen-vorsortieren",
    title: /Daten und Unterlagen vorsortieren/,
    heading: "Daten und Unterlagen vorsortieren, bevor Nacharbeit entsteht.",
    minimumFaqs: 8,
  },
  {
    path: "/ki-agenten-kmu",
    title: /KI-Agenten für KMU/,
    heading: "KI-Agenten für KMU, die wirklich Aufgaben übernehmen.",
    minimumFaqs: 10,
  },
  {
    path: "/dsgvo-ki-agenten",
    title: /DSGVO-orientierte KI-Agenten/,
    heading: "KI-Agenten DSGVO-konform bauen, ohne Blackbox-Gefühl.",
    minimumFaqs: 10,
  },
  {
    path: "/openclaw-agenten",
    title: /OpenClaw-Agenten/,
    heading: "Vom n8n-Workflow zum stabilen OpenClaw-Agenten.",
    minimumFaqs: 10,
  },
  {
    path: "/ki-integration-prozesse",
    title: /KI-Integration Prozesse/,
    heading: "KI-Integration, die in Arbeitsprozesse passt.",
    minimumFaqs: 8,
  },
  {
    path: "/crm-und-ki-integration",
    title: /CRM und KI-Integration/,
    heading: "CRM und KI integrieren, ohne Vertrieb und Support zu verwirren.",
    minimumFaqs: 8,
  },
  {
    path: "/ki-projekt-retten",
    title: /KI-Projekt retten/,
    heading: "Dein KI-Projekt hängt fest? Wir finden den Bruch.",
    minimumFaqs: 8,
  },
  {
    path: "/ki-agenten-selbststaendige",
    title: /KI-Agenten für Selbstständige/,
    heading:
      "KI-Agenten für Selbstständige, die vorarbeiten statt alles zu übernehmen",
    minimumFaqs: 12,
  },
  {
    path: "/ki-agenten-gruender",
    title: /KI-Agenten für Gründer/,
    heading: "KI-Agenten für Gründer, damit Admin nicht den Tag führt",
    minimumFaqs: 12,
  },
  {
    path: "/ki-agenten-kleine-teams",
    title: /KI-Agenten für kleine Teams/,
    heading: "KI-Agenten für kleine Teams, die Übergaben sauber vorbereiten",
    minimumFaqs: 12,
  },
];

for (const pageInfo of pages) {
  test(`${pageInfo.path} loads agent content page`, async ({ page }) => {
    await page.goto(pageInfo.path);
    await expect(page).toHaveTitle(pageInfo.title);
    const pageTitle = await page.title();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      pageInfo.heading,
    );

    const canonicalUrl = `${SITE_URL}${pageInfo.path}`;
    const metadata = await page.evaluate(() => ({
      canonical: document
        .querySelector('link[rel="canonical"]')
        ?.getAttribute("href"),
      title: document
        .querySelector('meta[name="title"]')
        ?.getAttribute("content"),
      description: document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content"),
      keywords: document
        .querySelector('meta[name="keywords"]')
        ?.getAttribute("content"),
      robots: document
        .querySelector('meta[name="robots"]')
        ?.getAttribute("content"),
      ogUrl: document
        .querySelector('meta[property="og:url"]')
        ?.getAttribute("content"),
      ogTitle: document
        .querySelector('meta[property="og:title"]')
        ?.getAttribute("content"),
      ogDescription: document
        .querySelector('meta[property="og:description"]')
        ?.getAttribute("content"),
      ogImage: document
        .querySelector('meta[property="og:image"]')
        ?.getAttribute("content"),
      twitterUrl: document
        .querySelector('meta[name="twitter:url"]')
        ?.getAttribute("content"),
      twitterTitle: document
        .querySelector('meta[name="twitter:title"]')
        ?.getAttribute("content"),
      twitterDescription: document
        .querySelector('meta[name="twitter:description"]')
        ?.getAttribute("content"),
    }));

    expect(metadata.canonical).toBe(canonicalUrl);
    expect(metadata.ogUrl).toBe(canonicalUrl);
    expect(metadata.twitterUrl).toBe(canonicalUrl);
    expect(metadata.title).toBe(pageTitle);
    expect(metadata.ogTitle).toBe(pageTitle);
    expect(metadata.twitterTitle).toBe(pageTitle);
    expect(metadata.robots).toBe("index, follow");
    expect(metadata.description?.length ?? 0).toBeGreaterThan(70);
    expect(metadata.keywords?.length ?? 0).toBeGreaterThan(40);
    expect(metadata.ogDescription).toBe(metadata.description);
    expect(metadata.twitterDescription).toBe(metadata.description);
    expect(metadata.ogImage).toBe(`${SITE_URL}/images/hero/hero2.webp`);
    expect(metadata.canonical).not.toContain(".html");

    const metadataText = [
      metadata.title,
      metadata.description,
      metadata.keywords,
      metadata.ogTitle,
      metadata.ogDescription,
      metadata.twitterTitle,
      metadata.twitterDescription,
    ]
      .filter(Boolean)
      .join(" ");
    expect(metadataText).not.toMatch(HUMANIZER_METADATA_PATTERN);

    await expect(
      page
        .getByRole("link", {
          name: /Termin|Potenzial|Setup|prüfen|klären|Check|Ablauf|Beispiele|Use Cases/i,
        })
        .first(),
    ).toBeVisible();
    await expect(page.locator("#trust-bar")).toHaveCount(0);
    await expect(page.locator("#fuer-wen")).toBeVisible();
    await expect(page.locator("#value-focus")).toBeVisible();
    await expect(page.locator("#process")).toBeVisible();
    await expect(page.locator("#final-cta")).toBeVisible();
    await expect(page.locator("#faq")).toBeVisible();

    const scaffoldOrder = await page.evaluate(() => {
      const ids = ["fuer-wen", "value-focus", "process", "final-cta", "faq"];

      return ids.map((id) => {
        const element = document.getElementById(id);

        if (!element) {
          throw new Error(`${id} missing`);
        }

        return element.getBoundingClientRect().top + window.scrollY;
      });
    });

    expect(scaffoldOrder).toEqual([...scaffoldOrder].sort((a, b) => a - b));

    const visibleFaqCount = await page.locator("#faq details").count();
    expect(visibleFaqCount).toBeGreaterThanOrEqual(pageInfo.minimumFaqs);

    const visibleFaqs = await page
      .locator("#faq details")
      .evaluateAll((details) =>
        details.map((detail) => ({
          question:
            detail
              .querySelector("h3")
              ?.textContent?.replace(/\s+/g, " ")
              .trim() ?? "",
          answer:
            detail
              .querySelector("p")
              ?.textContent?.replace(/\s+/g, " ")
              .trim() ?? "",
        })),
      );

    const structuredData = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((scripts) =>
        scripts.map((script) => JSON.parse(script.textContent ?? "{}")),
      );

    const faqSchema = structuredData.find(
      (schema) => schema["@type"] === "FAQPage",
    );
    expect(
      faqSchema?.mainEntity?.map(
        (entity: {
          name?: string;
          acceptedAnswer?: {
            text?: string;
          };
        }) => ({
          question: entity.name,
          answer: entity.acceptedAnswer?.text,
        }),
      ),
    ).toEqual(visibleFaqs);

    const breadcrumbSchema = structuredData.find(
      (schema) => schema["@type"] === "BreadcrumbList",
    );
    expect(breadcrumbSchema?.itemListElement?.[0]).toMatchObject({
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${SITE_URL}/`,
    });
    expect(breadcrumbSchema?.itemListElement?.at(-1)).toMatchObject({
      "@type": "ListItem",
      item: canonicalUrl,
    });
  });
}

for (const pageInfo of pages) {
  test(`${pageInfo.path} uses the compact content hero`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(pageInfo.path);

    const hero = page.locator("#hero[data-content-hero]");
    await expect(hero).toHaveCount(1);
    await expect(hero.locator("[data-hero-agent-console]")).toHaveCount(0);
    await expect(hero.locator("[data-hero-motion-contract]")).toHaveCount(0);
    await expect(
      hero.locator("[data-seo-entry-links] a").first(),
    ).toBeVisible();

    const heroEntryTargets = await hero
      .locator("[data-seo-entry-links] a")
      .evaluateAll((anchors) =>
        anchors.map((anchor) => anchor.getAttribute("href") ?? ""),
      );

    expect(heroEntryTargets.length).toBeGreaterThanOrEqual(3);
    expect(heroEntryTargets.every((href) => !href.startsWith("/blog/"))).toBe(
      true,
    );
    expect(heroEntryTargets).toContain("/agent-readiness");

    const heroMetrics = await hero.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const next = element.nextElementSibling;

      if (!(next instanceof HTMLElement)) {
        throw new Error("Content hero next section is missing.");
      }

      const nextRect = next.getBoundingClientRect();

      return {
        height: rect.height,
        viewportHeight: window.innerHeight,
        nextTop: nextRect.top,
        nextVisiblePixels: window.innerHeight - nextRect.top,
      };
    });

    expect(heroMetrics.height).toBeLessThan(heroMetrics.viewportHeight * 0.85);
    expect(heroMetrics.nextTop).toBeLessThan(heroMetrics.viewportHeight);
    expect(heroMetrics.nextVisiblePixels).toBeGreaterThanOrEqual(24);
  });
}

test("content landing hero stays compact on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ki-agenten-kmu");

  const heroMetrics = await page
    .locator("#hero[data-content-hero]")
    .evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const next = element.nextElementSibling;

      if (!(next instanceof HTMLElement)) {
        throw new Error("Content hero next section is missing.");
      }

      const nextRect = next.getBoundingClientRect();

      return {
        height: rect.height,
        viewportHeight: window.innerHeight,
        nextTop: nextRect.top,
      };
    });

  expect(heroMetrics.height).toBeLessThan(heroMetrics.viewportHeight * 0.9);
  expect(heroMetrics.nextTop).toBeLessThan(heroMetrics.viewportHeight);
});

test("landing FAQ columns expand independently on desktop", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/ki-agenten-gruender");

  const faq = page.locator("#faq");
  await faq.scrollIntoViewIfNeeded();
  await expect(faq.locator("[data-faq-column]")).toHaveCount(2);

  const closedMetrics = await faq.evaluate((section) => {
    const columns = Array.from(
      section.querySelectorAll<HTMLElement>("[data-faq-column]"),
    );

    return columns.map((column) => {
      const firstItem = column.querySelector<HTMLElement>("[data-faq-item]");

      if (!firstItem) {
        throw new Error("FAQ column item missing");
      }

      return firstItem.getBoundingClientRect().height;
    });
  });

  await faq
    .locator('[data-faq-column="1"] [data-faq-item] summary')
    .first()
    .click();

  const openMetrics = await faq.evaluate((section) => {
    const columns = Array.from(
      section.querySelectorAll<HTMLElement>("[data-faq-column]"),
    );

    return columns.map((column) => {
      const firstItem = column.querySelector<HTMLElement>("[data-faq-item]");

      if (!firstItem) {
        throw new Error("FAQ column item missing");
      }

      return firstItem.getBoundingClientRect().height;
    });
  });

  expect(openMetrics[0]).toBeGreaterThan(closedMetrics[0] + 30);
  expect(Math.abs(openMetrics[1] - closedMetrics[1])).toBeLessThan(4);
});

test("landing page homepage anchors navigate to the homepage", async ({
  page,
}) => {
  await page.goto("/ki-agenten-kmu");

  await page.locator('a[href="/#final-cta"]').first().click();
  await expect(page).toHaveURL(/\/#final-cta$/);
  await expect(page.locator("#hero[data-content-hero]")).toHaveCount(0);
  await expect(page.locator("#final-cta")).toBeVisible();
});

const legacyRoutes = [
  ["/automatisierungs-check", "/agent-readiness"],
  ["/automatisierung-selbststaendige", "/ki-agenten-selbststaendige"],
  ["/automatisierung-gruender", "/ki-agenten-gruender"],
  ["/automatisierung-kleine-teams", "/ki-agenten-kleine-teams"],
  ["/blog/automatisierung-roi-maximieren", "/blog/ki-agenten-roi-berechnen"],
] as const;

for (const [legacyRoute, canonicalRoute] of legacyRoutes) {
  test(`${legacyRoute} redirects to renamed canonical route`, async ({
    page,
  }) => {
    await page.goto(legacyRoute);
    await expect(page).toHaveURL(new RegExp(`${canonicalRoute}$`));
  });
}

test("homepage exposes root canonical social URLs", async ({ page }) => {
  await page.goto("/");

  const seoUrls = await page.evaluate(() => ({
    canonical: document
      .querySelector('link[rel="canonical"]')
      ?.getAttribute("href"),
    ogUrl: document
      .querySelector('meta[property="og:url"]')
      ?.getAttribute("content"),
    twitterUrl: document
      .querySelector('meta[name="twitter:url"]')
      ?.getAttribute("content"),
  }));

  expect(seoUrls).toEqual({
    canonical: "https://codariq.de",
    ogUrl: "https://codariq.de",
    twitterUrl: "https://codariq.de",
  });
});

test("ki integration roadmap blog post is indexable and internally linked", async ({
  page,
}) => {
  await page.goto("/blog/ki-integration-roadmap-agenten");

  await expect(page).toHaveTitle(/KI-Integration Roadmap/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "KI-Integration Roadmap: vom Pilot zum stabilen Agenten-Stack",
  );
  await expect(page.getByText("29. Mai 2026")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Integrationspunkt prüfen" }),
  ).toHaveAttribute("href", "/ki-integration-prozesse");

  const seoSignals = await page.evaluate(() => ({
    canonical: document
      .querySelector('link[rel="canonical"]')
      ?.getAttribute("href"),
    robots: document
      .querySelector('meta[name="robots"]')
      ?.getAttribute("content"),
    articlePublished: document
      .querySelector('meta[property="article:published_time"]')
      ?.getAttribute("content"),
  }));

  expect(seoSignals).toEqual({
    canonical: "https://codariq.de/blog/ki-integration-roadmap-agenten",
    robots: "index, follow",
    articlePublished: "2026-05-29T09:30:00+02:00",
  });
});

test("faq page uses compact question-first layout", async ({ page }) => {
  await page.goto("/faq");

  await expect(page).toHaveTitle(/FAQ zu KI-Agenten/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Noch Fragen?",
  );
  await expect(page.locator(".faq-page__intro")).toBeVisible();
  await expect(page.locator(".faq-page__intro")).not.toHaveClass(/hero/i);
  await expect(page.locator(".faq-page__item")).toHaveCount(13);
  await expect(page.locator("[data-delivery-card-inner]")).toHaveCount(0);
  await expect(
    page.getByRole("heading", {
      level: 3,
      name: "Für welche Unternehmen sind KI-Agenten sinnvoll?",
    }),
  ).toBeVisible();

  const introHeight = await page
    .locator(".faq-page__intro")
    .evaluate((element) => element.getBoundingClientRect().height);
  expect(introHeight).toBeLessThan(230);

  const introRuleAlignment = await page.evaluate(() => {
    const intro = document.querySelector(".faq-page__intro");
    const title = document.querySelector("#faq-title");
    const firstFaqItem = document.querySelector(".faq-page__item");

    if (!intro || !title || !firstFaqItem) {
      throw new Error("FAQ intro alignment elements missing");
    }

    const introRect = intro.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();
    const faqItemRect = firstFaqItem.getBoundingClientRect();

    return {
      introLeft: introRect.left,
      titleLeft: titleRect.left,
      introRight: introRect.right,
      faqItemRight: faqItemRect.right,
    };
  });
  expect(
    Math.abs(introRuleAlignment.introLeft - introRuleAlignment.titleLeft),
  ).toBeLessThanOrEqual(1);
  expect(
    Math.abs(introRuleAlignment.introRight - introRuleAlignment.faqItemRight),
  ).toBeLessThanOrEqual(1);

  const sectionHead = page.locator(".faq-page__section-head");
  await expect(
    sectionHead.getByText("Hier findest du deine Antwort"),
  ).toBeVisible();

  const sectionHeadStyles = await sectionHead.evaluate((element) => {
    const style = window.getComputedStyle(element);
    return {
      paddingTop: style.paddingTop,
      position: style.position,
      top: style.top,
    };
  });
  expect(sectionHeadStyles).toEqual({
    paddingTop: "16px",
    position: "sticky",
    top: "64px",
  });

  const stickyScrollTarget = await page.evaluate(() => {
    const questions = document.querySelector(".faq-page__questions");
    if (!questions) {
      throw new Error("FAQ questions section missing");
    }

    const target = questions.getBoundingClientRect().top + window.scrollY + 180;
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, target);

    return target;
  });
  await page.waitForFunction(
    (target) => Math.abs(window.scrollY - target) < 2,
    stickyScrollTarget,
  );

  const navHeight = await page
    .locator("#main-nav")
    .evaluate((element) => element.getBoundingClientRect().height);
  const sectionHeadTop = await sectionHead.evaluate(
    (element) => element.getBoundingClientRect().top,
  );
  expect(Math.abs(sectionHeadTop - navHeight)).toBeLessThanOrEqual(2);
  const stickyLabelTop = await sectionHead
    .getByText("Hier findest du deine Antwort")
    .evaluate((element) => element.getBoundingClientRect().top);
  expect(Math.abs(stickyLabelTop - navHeight - 16)).toBeLessThanOrEqual(2);

  const schemaType = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll(
      (scripts) =>
        scripts
          .map((script) => JSON.parse(script.textContent ?? "{}"))
          .find((schema) => schema["@type"] === "FAQPage")?.["@type"],
    );
  expect(schemaType).toBe("FAQPage");
});
