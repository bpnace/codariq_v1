import { expect, test } from "@playwright/test";

test("quiz flow completes and shows results", async ({ page }) => {
  let submittedPayload: Record<string, unknown> | null = null;

  await page.route("**/webhook-proxy.php", async (route) => {
    submittedPayload = route.request().postDataJSON() as Record<
      string,
      unknown
    >;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });

  await page.goto("/automatisierungs-check");

  const next = page.locator("#quiz-next");
  const question = page.locator("#quiz-question");
  const options = page.locator("#quiz-options button");

  for (let step = 0; step < 6; step += 1) {
    await expect(question).not.toHaveText("");
    const count = await options.count();
    if (step === 3 && count > 1) {
      await options.nth(0).click();
      await options.nth(1).click();
    } else {
      await options.first().click();
    }
    await expect(next).toBeEnabled();
    await next.click();
  }

  await page.fill("#quiz-name", "Test Nutzer");
  await page.fill("#quiz-company", "Codariq Test GmbH");
  await page.fill("#quiz-email", "test@example.com");
  await page.check("#quiz-consent");
  await expect(next).toBeEnabled();
  await next.click();

  await expect(page.locator("#quiz-result")).toBeVisible();
  await expect(page.locator("#result-level")).not.toHaveText("-");
  expect(submittedPayload).toMatchObject({
    source: "codariq_quiz",
    name: "Test Nutzer",
    company: "Codariq Test GmbH",
    email: "test@example.com",
  });
  expect(submittedPayload?.answerDetails).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: "q1_task_area",
        question: "Wo frisst Arbeit gerade am meisten Zeit?",
      }),
      expect.objectContaining({
        id: "q4_data_systems",
      }),
    ]),
  );
  expect(submittedPayload?.resultSummary).toMatchObject({
    level: expect.any(String),
    outcomeTitle: expect.any(String),
    auditSignal: expect.stringMatching(/niedrig|mittel|hoch/),
    dimensions: {
      kiNeedScore: expect.any(Number),
      agentReliefScore: expect.any(Number),
      complianceReadinessScore: expect.any(Number),
    },
    recommendations: expect.any(Array),
  });
  expect(submittedPayload?.emailDraft).toMatchObject({
    to: "test@example.com",
    subject: expect.stringContaining("Codariq Auswertung"),
    text: expect.stringContaining("Hallo Test"),
    ctaUrl: "https://codariq.de/#benefits",
    servicesUrl: "https://codariq.de/#benefits",
    faqUrl: "https://codariq.de/faq",
    primaryCta: {
      label: "Leistungen ansehen",
    },
  });
});

test("quiz answers use svg icons and keep data-system step compact", async ({
  page,
}) => {
  await page.goto("/automatisierungs-check");

  const next = page.locator("#quiz-next");
  const question = page.locator("#quiz-question");
  const options = page.locator("#quiz-options button");
  const optionIcons = page.locator("#quiz-options .quiz-option-icon svg");

  await expect(question).toHaveText("Wo frisst Arbeit gerade am meisten Zeit?");
  await expect(optionIcons).toHaveCount(6);
  await options.first().click();
  await next.click();

  await expect(question).toHaveText("Wie oft wiederholt sich dieser Ablauf?");
  await expect(optionIcons).toHaveCount(5);
  await options.first().click();
  await next.click();

  await expect(question).toHaveText(
    "Wie viel dürfte ein Agent davon übernehmen?",
  );
  await expect(optionIcons).toHaveCount(5);
  await options.first().click();
  await next.click();

  await expect(question).toHaveText(
    "Welche Daten oder Systeme wären betroffen?",
  );
  await expect(page.locator("#quiz-options .quiz-multi")).toHaveCount(7);
  await expect(
    page.locator("#quiz-options .quiz-multi .quiz-option-icon svg"),
  ).toHaveCount(7);

  const optionBox = await page.locator("#quiz-options").evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }));
  expect(optionBox.scrollHeight).toBeLessThanOrEqual(
    optionBox.clientHeight + 1,
  );

  await options.first().click();
  await next.click();

  await expect(question).toHaveText("Wie nutzt ihr KI heute schon?");
  await expect(optionIcons).toHaveCount(5);
  await options.first().click();
  await next.click();

  await expect(question).toHaveText(
    "Was wäre in den nächsten 30 Tagen ein gutes Ergebnis?",
  );
  await expect(optionIcons).toHaveCount(6);
});

test("desktop quiz surface is wider and more readable", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/automatisierungs-check");
  await expect(page.locator("#quiz-question")).toHaveText(
    "Wo frisst Arbeit gerade am meisten Zeit?",
  );
  await expect(page.locator(".quiz-option-text").first()).toBeVisible();

  const metrics = await page.locator(".agent-quiz-section").evaluate((shell) => {
    const quizBody = document.querySelector(".quiz-body");
    const options = document.querySelector("#quiz-options");
    const option = document.querySelector(".quiz-option");
    const question = document.querySelector("#quiz-question");
    const optionText = document.querySelector(".quiz-option-text");
    const optionIcon = document.querySelector(".quiz-option-icon");

    if (
      !quizBody ||
      !options ||
      !option ||
      !question ||
      !optionText ||
      !optionIcon
    ) {
      throw new Error("Quiz desktop readability elements missing");
    }

    return {
      sectionWidth: shell.getBoundingClientRect().width,
      bodyMinHeight: Number.parseFloat(
        window.getComputedStyle(quizBody).minHeight,
      ),
      optionsMaxHeight: Number.parseFloat(
        window.getComputedStyle(options).maxHeight,
      ),
      optionMinHeight: Number.parseFloat(
        window.getComputedStyle(option).minHeight,
      ),
      questionFontSize: Number.parseFloat(
        window.getComputedStyle(question).fontSize,
      ),
      optionFontSize: Number.parseFloat(
        window.getComputedStyle(optionText).fontSize,
      ),
      iconWidth: optionIcon.getBoundingClientRect().width,
    };
  });

  expect(metrics.sectionWidth).toBeGreaterThanOrEqual(1280);
  expect(metrics.bodyMinHeight).toBeLessThanOrEqual(368);
  expect(metrics.optionsMaxHeight).toBeLessThanOrEqual(480);
  expect(metrics.optionMinHeight).toBeLessThanOrEqual(57);
  expect(metrics.questionFontSize).toBeGreaterThanOrEqual(32);
  expect(metrics.optionFontSize).toBeGreaterThanOrEqual(17);
  expect(metrics.iconWidth).toBeGreaterThanOrEqual(34);
});
