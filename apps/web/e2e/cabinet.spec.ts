import { test, expect } from '@playwright/test';

test.describe('Client cabinet', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'sessionId',
        value: 'session-test',
        url: 'http://127.0.0.1:3001',
      },
    ]);

    await page.route('**/api/auth/client/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'user-1',
          email: 'client@example.com',
          displayName: 'Клиент',
          roles: ['client'],
        }),
      });
    });

    await page.route('**/api/cabinet/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'user-1',
          email: 'client@example.com',
          display_name: 'Клиент',
          roles: ['client'],
        }),
      });
    });

    await page.route('**/api/cabinet/appointments', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          upcoming: [
            {
              id: 'appt-1',
              start_at_utc: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
              end_at_utc: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
              timezone: 'Europe/Moscow',
              format: 'online',
              status: 'confirmed',
              service: {
                id: 'service-1',
                slug: 'intro-session',
                title: 'Ознакомительная консультация',
                duration_minutes: 60,
              },
            },
          ],
          past: [],
        }),
      });
    });

    await page.route('**/api/cabinet/materials', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [],
        }),
      });
    });
  });

  test('login -> cabinet -> see appointments', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('client@example.com');
    await page.getByLabel('Пароль').fill('secret');
    await page.getByRole('button', { name: 'Войти' }).click();

    await expect(page).toHaveURL('/cabinet');
    await expect(page.getByText('Ознакомительная консультация')).toBeVisible();

    await page.goto('/cabinet/appointments');
    await expect(page.getByText('Предстоящие')).toBeVisible();
    await expect(page.getByText('Ознакомительная консультация')).toBeVisible();
  });
});
