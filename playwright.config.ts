import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */

/**
 * Port the built game is previewed on.
 *
 * Env-driven so several checkouts (or several templates) can run their suites side by side.
 * With a hardcoded port, `reuseExistingServer` will happily attach to whatever is already
 * listening and screenshot somebody else's app. `--strictPort` makes a clash fail loudly
 * instead of silently sliding to the next free port.
 *
 * CI leaves EX_E2E_PORT unset and gets Vite's default preview port.
 */
const port = Number(process.env.EX_E2E_PORT ?? 4173);
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: './tests',
  webServer: {
    // Deliberately previewing the *built* output rather than running a dev server: verifying
    // that the production build pipeline still produces a working game is the whole point of a
    // template. `npm test` runs the build first.
    command: `npm run serve -- --port ${port} --strictPort`,
    timeout: 240 * 1000, // linux takes a long time
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ["--no-sandbox", '--disable-web-security', "--use-angle=gl"]
        }
      },
    },

    // Snapshot baselines are committed for chromium/linux only (that is what CI runs).
    // Enabling another browser or platform means regenerating baselines for it.

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],
});
