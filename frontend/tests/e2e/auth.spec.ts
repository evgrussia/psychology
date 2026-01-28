import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Вход/i })).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('should display registration form', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /Регистрация/i })).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="display_name"]')).toBeVisible();
  });

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /Зарегистрироваться/i }).click();
    await expect(page).toHaveURL(/\/register/);
    
    await page.getByRole('link', { name: /Войти/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('successful login', async ({ page }) => {
    // Mock login API
    await page.route('**/api/v1/auth/login/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            user: { id: '1', email: 'test@example.com' }
          }
        }),
        headers: {
          'set-cookie': 'access_token=mock_access; HttpOnly; Path=/; SameSite=Lax'
        }
      });
    });

    await page.goto('/login');
    await page.locator('input[name="email"]').fill('test@example.com');
    await page.locator('input[name="password"]').fill('password123');
    await page.getByRole('button', { name: /Войти/i }).click();

    await expect(page).toHaveURL(/\/cabinet/);
  });

  test('failed login (validation error)', async ({ page }) => {
    // Mock login API error
    await page.route('**/api/v1/auth/login/', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Неверный email или пароль' })
      });
    });

    await page.goto('/login');
    await page.locator('input[name="email"]').fill('wrong@example.com');
    await page.locator('input[name="password"]').fill('wrongpass');
    await page.getByRole('button', { name: /Войти/i }).click();

    await expect(page.locator('text=Неверный email или пароль')).toBeVisible();
  });

  test('successful registration', async ({ page }) => {
    // Mock register API
    await page.route('**/api/v1/auth/register/', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            user: { id: '2', email: 'new@example.com' }
          }
        }),
        headers: {
          'set-cookie': 'access_token=mock_access; HttpOnly; Path=/; SameSite=Lax'
        }
      });
    });

    await page.goto('/register');
    await page.locator('input[name="display_name"]').fill('Новый пользователь');
    await page.locator('input[name="email"]').fill('new@example.com');
    await page.locator('input[name="password"]').fill('password123');
    await page.getByRole('button', { name: /Зарегистрироваться/i }).click();

    await expect(page).toHaveURL(/\/cabinet/);
  });

  test('successful logout', async ({ page }) => {
    // Mock login state
    await page.context().addCookies([
      { name: 'access_token', value: 'mock_access', domain: 'localhost', path: '/' }
    ]);

    // Mock stats API for cabinet
    await page.route('**/api/v1/cabinet/stats/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ upcoming_appointments: 0, diary_entries_count: 0, materials_count: 0 })
      });
    });

    // Mock logout API
    await page.route('**/api/v1/auth/logout/', async (route) => {
      await route.fulfill({ status: 204 });
    });

    await page.goto('/cabinet');
    await page.getByRole('button', { name: /Выйти/i }).click();

    await expect(page).toHaveURL(/\/login|\//);
  });
});
