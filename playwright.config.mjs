import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./engine/tests/browser",
  testMatch: "*.spec.mjs",
  fullyParallel: true,
  workers: 2,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? "github" : "list",
  outputDir: "test-results",
  use: {
    browserName: "chromium",
    headless: true,
    launchOptions: process.env.BROWSER_EXECUTABLE_PATH
      ? { executablePath: process.env.BROWSER_EXECUTABLE_PATH }
      : {},
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "mobile", use: { viewport: { width: 375, height: 1000 } } },
    { name: "desktop", use: { viewport: { width: 768, height: 1000 } } },
  ],
});
