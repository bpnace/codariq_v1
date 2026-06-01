import { expect, test } from "@playwright/test";

test("quiz starts at question 1", async ({ page }) => {
  await page.goto("/agent-readiness");
  const question = page.locator("#quiz-question");
  await expect(question).toHaveText(
    "Welcher Ablauf frisst gerade am meisten Zeit?",
  );
});

test("quiz progress starts at 0 and reflects completed quiz questions", async ({
  page,
}) => {
  await page.goto("/agent-readiness");

  const next = page.locator("#quiz-next");
  const progressPercent = page.locator("#quiz-progress-percent");
  const progressFill = page.locator("#quiz-progress-fill");

  await expect(progressPercent).toHaveText("0%");
  await expect
    .poll(async () => progressFill.evaluate((element) => element.style.width))
    .toBe("0%");

  await page.locator("#quiz-options button").first().click();
  await expect(progressPercent).toHaveText("17%");
  await expect
    .poll(async () => progressFill.evaluate((element) => element.style.width))
    .toBe("17%");

  await next.click();

  for (let step = 2; step <= 6; step += 1) {
    await page.locator("#quiz-options button").first().click();
    await expect(next).toBeEnabled();
    await next.click();
  }

  await expect(page.locator("#quiz-step-label")).toHaveText(
    "Auswertung per E-Mail",
  );
  await expect(progressPercent).toHaveText("100%");
});

test("quiz page shows the SEO outcome section below the quiz", async ({
  page,
}) => {
  await page.goto("/agent-readiness");

  const seoSection = page.locator("#ki-agenten-check-ergebnis");
  await expect(seoSection).toBeVisible();
  await expect(seoSection.locator("h2")).toHaveText(
    "KI-Agenten-Check für E-Mail, Dokumente, CRM und Backoffice",
  );
  await expect(seoSection.locator(".quiz-seo-card")).toHaveCount(3);
  await expect(seoSection).toContainText("welcher Ablauf ist");
  await expect(seoSection.locator('a[href="/ki-agenten-kmu"]')).toHaveText(
    "KI-Agenten für kleine Unternehmen",
  );
  await expect(
    seoSection.locator('a[href="/ki-agenten-selbststaendige"]'),
  ).toHaveText("KI-Agenten für Selbstständige");
  await expect(
    seoSection.locator('a[href="/ki-agenten-kleine-teams"]'),
  ).toHaveText("KI-Agenten für kleine Teams");
  await expect(seoSection.locator('a[href="/dsgvo-ki-agenten"]')).toHaveText(
    "DSGVO-konformen KI-Agenten",
  );
  await expect(seoSection.locator('a[href="/openclaw-agenten"]')).toHaveText(
    "EU-AI-Act-fähigen Agenten-Workflows",
  );

  const verticalOrder = await page.evaluate(() => {
    const quiz = document.querySelector(".agent-quiz-section");
    const seo = document.querySelector("#ki-agenten-check-ergebnis");

    if (!quiz || !seo) {
      throw new Error("Quiz or SEO section missing");
    }

    return {
      quizBottom: quiz.getBoundingClientRect().bottom,
      seoTop: seo.getBoundingClientRect().top,
    };
  });

  expect(verticalOrder.seoTop).toBeGreaterThanOrEqual(verticalOrder.quizBottom);
});
