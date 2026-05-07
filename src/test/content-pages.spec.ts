import { expect, test } from "@playwright/test";

const pages = [
  {
    path: "/ki-agenten-kmu",
    title: /KI-Agenten für KMU/,
    heading: "KI-Agenten für KMU, die wirklich Aufgaben übernehmen.",
  },
  {
    path: "/dsgvo-ki-agenten",
    title: /DSGVO-konforme KI-Agenten/,
    heading: "KI-Agenten DSGVO-konform bauen, ohne Blackbox-Gefühl.",
  },
  {
    path: "/openclaw-agenten",
    title: /OpenClaw-Agenten/,
    heading: "Vom n8n-Workflow zum stabilen OpenClaw-Agenten.",
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
        .getByRole("link", { name: /Termin|Potenzial|Setup|prüfen/i })
        .first(),
    ).toBeVisible();
  });
}

test("faq page uses compact question-first layout", async ({ page }) => {
  await page.goto("/faq");

  await expect(page).toHaveTitle(/Häufige Fragen zu KI-Agenten/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Noch Fragen?",
  );
  await expect(page.locator(".faq-page__intro")).toBeVisible();
  await expect(page.locator(".faq-page__intro")).not.toHaveClass(/hero/i);
  await expect(page.locator(".faq-page__item")).toHaveCount(8);
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
