import { expect, test, type Page } from "@playwright/test";

type QuizSubmissionPayload = Record<string, unknown> & {
  answerDetails: unknown[];
  resultSummary: Record<string, unknown>;
  emailDraft: Record<string, unknown>;
};

async function answerQuizQuestions(page: Page) {
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
}

test("quiz flow completes and shows results", async ({ page }) => {
  const submittedPayloads: QuizSubmissionPayload[] = [];

  await page.route("**/webhook-proxy.php", async (route) => {
    submittedPayloads.push(
      route.request().postDataJSON() as QuizSubmissionPayload,
    );
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });
  await page.route("**/newsletter-proxy.php", async () => {
    throw new Error("Quiz flow should not call the newsletter proxy.");
  });

  await page.goto("/agent-readiness");

  const next = page.locator("#quiz-next");
  await answerQuizQuestions(page);

  await page.fill("#quiz-name", "Test Nutzer");
  await page.fill("#quiz-company", "Codariq Test GmbH");
  await page.fill("#quiz-email", "test@example.com");
  await expect(page.locator("#quiz-newsletter-consent")).not.toBeChecked();
  await expect(next).toBeDisabled();
  await page.check("#quiz-consent");
  await expect(next).toBeEnabled();
  await next.click();

  await expect(page.locator("#quiz-result")).toBeVisible();
  await expect(page.locator("#result-level")).not.toHaveText("-");
  const payload = submittedPayloads[0];
  if (!payload) {
    throw new Error("Expected quiz submission payload.");
  }

  expect(payload).toMatchObject({
    source: "codariq_quiz",
    name: "Test Nutzer",
    company: "Codariq Test GmbH",
    email: "test@example.com",
    dataProcessingConsent: true,
    newsletterConsent: false,
  });
  expect(payload.answerDetails).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: "q1_task_area",
        question: "Welcher Ablauf frisst gerade am meisten Zeit?",
      }),
      expect.objectContaining({
        id: "q4_data_systems",
      }),
    ]),
  );
  expect(payload.resultSummary).toMatchObject({
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
  expect(payload.emailDraft).toMatchObject({
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

test("quiz sends checked newsletter consent in the lead payload", async ({
  page,
}) => {
  const submittedPayloads: QuizSubmissionPayload[] = [];

  await page.route("**/webhook-proxy.php", async (route) => {
    submittedPayloads.push(
      route.request().postDataJSON() as QuizSubmissionPayload,
    );
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });
  await page.route("**/newsletter-proxy.php", async () => {
    throw new Error("Quiz flow should not call the newsletter proxy.");
  });

  await page.goto("/agent-readiness");
  await answerQuizQuestions(page);

  await page.fill("#quiz-email", "newsletter@example.com");
  await page.check("#quiz-consent");
  await page.check("#quiz-newsletter-consent");
  await page.locator("#quiz-next").click();

  await expect(page.locator("#quiz-result")).toBeVisible();
  expect(submittedPayloads[0]).toMatchObject({
    email: "newsletter@example.com",
    dataProcessingConsent: true,
    newsletterConsent: true,
  });
});

test("quiz answers use svg icons and keep data-system step compact", async ({
  page,
}) => {
  await page.goto("/agent-readiness");

  const next = page.locator("#quiz-next");
  const question = page.locator("#quiz-question");
  const options = page.locator("#quiz-options button");
  const optionIcons = page.locator("#quiz-options .quiz-option-icon svg");

  await expect(question).toHaveText(
    "Welcher Ablauf frisst gerade am meisten Zeit?",
  );
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

  await expect(question).toHaveText(
    "Wie ist eure heutige KI-Nutzung geregelt?",
  );
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
  await page.goto("/agent-readiness");
  await expect(page.locator("#quiz-question")).toHaveText(
    "Welcher Ablauf frisst gerade am meisten Zeit?",
  );
  await expect(page.locator(".quiz-option-text").first()).toBeVisible();

  const metrics = await page
    .locator(".agent-quiz-section")
    .evaluate((shell) => {
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
