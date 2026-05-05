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
    await expect(page.getByRole("link", { name: /Termin|Potenzial|Setup|prüfen/i }).first()).toBeVisible();
  });
}
