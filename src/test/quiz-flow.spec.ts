import { expect, test } from "@playwright/test";

test("quiz flow completes and shows results", async ({ page }) => {
  await page.route("**/api/submit", async (route) => {
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

  for (let step = 0; step < 10; step += 1) {
    await expect(question).not.toHaveText("");
    const count = await options.count();
    if (step === 4 && count > 1) {
      await options.nth(0).click();
      await options.nth(1).click();
    } else {
      await options.first().click();
    }
    await expect(next).toBeEnabled();
    await next.click();
  }

  await page.fill("#quiz-name", "Test Nutzer");
  await expect(next).toBeEnabled();
  await next.click();

  await page.fill("#quiz-email", "test@example.com");
  await page.check("#quiz-consent");
  await expect(next).toBeEnabled();
  await next.click();

  await expect(page.locator("#quiz-result")).toBeVisible();
  await expect(page.locator("#result-level")).not.toHaveText("-");
});
