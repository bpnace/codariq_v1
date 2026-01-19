import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "src/test",
  testMatch: "**/*.spec.ts",
  use: {
    baseURL: "http://localhost:4321",
    headless: true,
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:4321",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
