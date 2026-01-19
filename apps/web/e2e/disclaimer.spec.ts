import { test, expect } from '@playwright/test';

test.describe('Disclaimers', () => {
  test('should show disclaimer on start hub', async ({ page }) => {
    await page.goto('/start');
    await expect(page.getByText(/Материалы и практики на этой странице не являются экстренной помощью/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Экстренная помощь/i })).toBeVisible();
  });

  test('should show disclaimer on start child route', async ({ page }) => {
    await page.goto('/start/rituals');
    await expect(page.getByText(/Материалы и практики на этой странице не являются экстренной помощью/i)).toBeVisible();
  });

  test('should show disclaimer on booking steps', async ({ page }) => {
    await page.goto('/booking/service');
    await expect(page.getByText(/Консультация не является экстренной помощью/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Экстренная помощь/i })).toBeVisible();
  });
});
