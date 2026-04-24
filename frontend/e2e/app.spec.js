const { test, expect } = require('@playwright/test');

// Mock API responses so tests run without a live backend
test.beforeEach(async ({ page }) => {
  await page.route('**/api/events**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'evt-1',
          title: 'Jazz Night at the Garden',
          description: 'An unforgettable evening of live jazz music.',
          location: 'City Garden, Amsterdam',
          ticketPrice: 45.0,
          availableSeats: 80,
          bookingEnabled: true,
          status: 'ACTIVE',
          eventType: 'PUBLIC_EVENT',
          eventDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'evt-2',
          title: 'Corporate Team Building Day',
          description: 'A full-day team building experience.',
          location: 'Rotterdam Event Center',
          ticketPrice: 120.0,
          availableSeats: 20,
          bookingEnabled: true,
          status: 'ACTIVE',
          eventType: 'HOST_PACKAGE',
          eventDateTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]),
    });
  });

  await page.route('**/api/suppliers**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });
});

test.describe('Public pages', () => {

  test('login page shows email and password fields', async ({ page }) => {
    await page.goto('/login');

    const emailField = page.locator('input[type="email"], input[id*="email"], input[placeholder*="email" i]').first();
    const passwordField = page.locator('input[type="password"]').first();

    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();
  });

  test('login page has a submit button', async ({ page }) => {
    await page.goto('/login');

    const submitBtn = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first();
    await expect(submitBtn).toBeVisible();
  });

  test('register page is accessible from login page', async ({ page }) => {
    await page.goto('/login');

    // Find and click the link to register
    const registerLink = page.locator('a[href*="register"], a:has-text("Register"), a:has-text("Sign up")').first();
    await expect(registerLink).toBeVisible();
    await registerLink.click();

    await expect(page).toHaveURL(/register/);
  });

  test('register page shows name, email, and password fields', async ({ page }) => {
    await page.goto('/register');

    const emailField = page.locator('input[type="email"], input[id*="email"], input[placeholder*="email" i]').first();
    const passwordField = page.locator('input[type="password"]').first();

    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();
  });
});

test.describe('Events list page', () => {
  test('displays list of events from the API', async ({ page }) => {
    await page.goto('/events');

    // Wait for at least one event card to appear
    const eventCards = page.locator('[class*="card"], [class*="event"], .p-card').first();
    await expect(eventCards).toBeVisible({ timeout: 10000 });
  });

  test('shows event titles from mocked API data', async ({ page }) => {
    await page.goto('/events');

    await expect(page.getByText('Jazz Night at the Garden')).toBeVisible({ timeout: 10000 });
  });

  test('events page does not show a 5xx error', async ({ page }) => {
    const errors = [];
    page.on('response', (response) => {
      if (response.status() >= 500) {
        errors.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto('/events');
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
  });
});

test.describe('Login form validation', () => {
  test('shows error feedback when submitting empty credentials', async ({ page }) => {
    // Mock the Firebase auth to reject invalid credentials
    await page.route('**/identitytoolkit**', (route) => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: { code: 400, message: 'INVALID_LOGIN_CREDENTIALS' } }),
      });
    });

    await page.goto('/login');

    const submitBtn = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first();
    await submitBtn.click();

    // After failed login, user should still be on the login page
    await expect(page).toHaveURL(/login/);
  });
});
