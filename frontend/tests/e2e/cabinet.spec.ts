import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';
import { ApiHelper } from './helpers/api';

test.describe('Client Cabinet', () => {
  let auth: AuthHelper;
  let api: ApiHelper;

  test.beforeEach(async ({ page }) => {
    api = new ApiHelper();
    auth = new AuthHelper(api);
    
    // Login before each test in this describe block
    // We use API login for speed
    await auth.loginViaAPI(page, 'test@example.com', 'password123');
  });

  test('should display cabinet overview with stats', async ({ page }) => {
    await page.goto('/cabinet');
    
    await expect(page.getByRole('heading', { name: /Личный кабинет/i })).toBeVisible();
    
    // Check for main sections
    await expect(page.getByText(/Встречи/i)).toBeVisible();
    await expect(page.getByText(/Дневники/i)).toBeVisible();
    await expect(page.getByText(/Материалы/i)).toBeVisible();
  });

  test('should navigate to appointments page', async ({ page }) => {
    await page.goto('/cabinet');
    await page.getByRole('link', { name: /Встречи/i }).click();
    await expect(page).toHaveURL(/\/cabinet\/appointments/);
    await expect(page.getByRole('heading', { name: /Встречи/i })).toBeVisible();
  });

  test('should navigate to diary page', async ({ page }) => {
    await page.goto('/cabinet');
    await page.getByRole('link', { name: /Дневники/i }).click();
    await expect(page).toHaveURL(/\/cabinet\/diary/);
    await expect(page.getByRole('heading', { name: /Дневники/i })).toBeVisible();
  });

  test('should navigate to materials page', async ({ page }) => {
    await page.goto('/cabinet');
    await page.getByRole('link', { name: /Материалы/i }).click();
    await expect(page).toHaveURL(/\/cabinet\/materials/);
    await expect(page.getByRole('heading', { name: /Материалы/i })).toBeVisible();
  });
});
