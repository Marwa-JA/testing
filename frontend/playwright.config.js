const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    // Provide fake Firebase config so the app can initialize without real credentials.
    // These values are intentionally fake — auth requests will fail but the UI renders.
    env: {
      REACT_APP_FIREBASE_API_KEY: 'fake-key-playwright-tests',
      REACT_APP_FIREBASE_AUTH_DOMAIN: 'test-project.firebaseapp.com',
      REACT_APP_FIREBASE_PROJECT_ID: 'test-project',
      REACT_APP_FIREBASE_STORAGE_BUCKET: 'test-project.firebasestorage.app',
      REACT_APP_FIREBASE_MESSAGING_SENDER_ID: '000000000000',
      REACT_APP_FIREBASE_APP_ID: '1:000000000000:web:000000000000',
    },
  },
});
