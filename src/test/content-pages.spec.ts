import { expect, test } from "@playwright/test";

const pages = [
  {
    path: "/ki-agenten-kmu",
    title: /KI-Agenten für KMU/,
    heading: "KI-Agenten für KMU, die wirklich Aufgaben übernehmen.",
  },
  {
    path: "/dsgvo-ki-agenten",
    title: /DSGVO-orientierte KI-Agenten/,
    heading: "KI-Agenten DSGVO-konform bauen, ohne Blackbox-Gefühl.",
  },
  {
    path: "/openclaw-agenten",
    title: /OpenClaw-Agenten/,
    heading: "Vom n8n-Workflow zum stabilen OpenClaw-Agenten.",
  },
  {
    path: "/ki-integration-prozesse",
    title: /KI-Integration Prozesse/,
    heading: "KI-Integration, die in echte Prozesse passt.",
  },
  {
    path: "/crm-und-ki-integration",
    title: /CRM und KI-Integration/,
    heading: "CRM und KI integrieren, ohne Vertrieb und Support zu verwirren.",
  },
  {
    path: "/ki-projekt-retten",
    title: /KI-Projekt retten/,
    heading: "Dein KI-Projekt hängt fest? Wir finden den Bruch.",
  },
  {
    path: "/ki-agenten-selbststaendige",
    title: /KI-Agenten für Selbstständige/,
    heading:
      "KI-Agenten für Selbstständige, die vorarbeiten statt alles zu übernehmen",
  },
  {
    path: "/ki-agenten-gruender",
    title: /KI-Agenten für Gründer/,
    heading: "KI-Agenten für Gründer, damit Admin nicht den Tag führt",
  },
  {
    path: "/ki-agenten-kleine-teams",
    title: /KI-Agenten für kleine Teams/,
    heading: "KI-Agenten für kleine Teams, die Übergaben sauber vorbereiten",
  },
];

for (const pageInfo of pages) {
  test(`${pageInfo.path} loads agent content page`, async ({ page }) => {
    await page.goto(pageInfo.path);
    await expect(page).toHaveTitle(pageInfo.title);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      pageInfo.heading,
    );
    await expect(
      page
        .getByRole("link", {
          name: /Termin|Potenzial|Setup|prüfen|klären|Check|Ablauf|Beispiele|Use Cases/i,
        })
        .first(),
    ).toBeVisible();
  });
}

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
