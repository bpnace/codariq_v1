import { expect, test } from "@playwright/test";

test("home loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Codariq/);
});

test("desktop nav stays on homepage anchors", async ({ page }) => {
  await page.goto("/");
  const nav = page.locator("#main-nav");

  await expect(nav.locator('a[href="/#pain-points"]')).toHaveText("Probleme");
  await expect(nav.locator('a[href="/#process"]')).toHaveText("Prozess");
  await expect(nav.locator('a[href="/#benefits"]')).toHaveText("Pakete");
  await expect(nav.locator('a[href="/#testimonials"]')).toHaveText(
    "Referenzen",
  );
  await expect(nav.locator('a[href="/#final-cta"]').first()).toHaveText(
    "Kontakt",
  );

  await expect(nav.locator('a[href="/ki-agenten-kmu"]')).toHaveCount(0);
  await expect(nav.locator('a[href="/dsgvo-ki-agenten"]')).toHaveCount(0);
  await expect(nav.locator('a[href="/openclaw-agenten"]')).toHaveCount(0);
  await expect(nav.locator('a[href="/faq"]')).toHaveCount(0);
});

test("pain list uses agent reframing", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Wo KI-Agenten im Alltag wirklich helfen",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Vom Workflow zum kontrollierten Agenten"),
  ).toBeVisible();
});
