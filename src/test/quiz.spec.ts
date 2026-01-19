import { expect, test } from "@playwright/test";

test("quiz starts at question 1", async ({ page }) => {
  await page.goto("/automatisierungs-check");
  const question = page.locator("#quiz-question");
  await expect(question).toHaveText(
    "Wie stehst du zum Thema Automatisierung?"
  );
});
