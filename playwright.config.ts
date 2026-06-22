import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const authenticatedTestIgnore = [/.*\.setup\.ts/, /safari-viewport\.spec\.ts/];
const devServerCommand = process.platform === "win32" ? "npm.cmd run dev" : "npm run dev";

export default defineConfig({
  testDir: "./tests",

  // Para começar, evita conflitos caso você use a mesma conta de teste.
  fullyParallel: false,
  workers: process.env.CI ? 1 : 1,

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  reporter: "html",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },

    {
      name: "chromium",
      testIgnore: authenticatedTestIgnore,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },

    {
      name: "firefox",
      testIgnore: authenticatedTestIgnore,
      use: {
        ...devices["Desktop Firefox"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },

    {
      name: "webkit",
      testIgnore: authenticatedTestIgnore,
      use: {
        ...devices["Desktop Safari"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },

    {
      name: "webkit-safari-viewport",
      testMatch: /safari-viewport\.spec\.ts/,
      use: {
        ...devices["Desktop Safari"],
      },
    },
  ],

  webServer: {
    command: devServerCommand,
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
