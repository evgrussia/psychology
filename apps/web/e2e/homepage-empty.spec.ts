import { test, expect } from '@playwright/test';

test.describe('Homepage empty states', () => {
  test('should show empty states when data is forced empty', async ({ page }) => {
    await page.goto('/?e2e=empty');

    await expect(page.getByRole('heading', { name: /Первый шаг уже доступен/i })).toBeVisible();
    await expect(page.getByText(/Мы готовим подборку тем/i)).toBeVisible();
    await expect(page.getByText(/Раздел о принципах и конфиденциальности/i)).toBeVisible();
  });
});
