import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    include: ["src/**/*.test.{js,ts,jsx,tsx}"],
    exclude: ["src/**/*.spec.{js,ts,jsx,tsx}"],
    setupFiles: ["src/test/setup.ts"],
  },
});
