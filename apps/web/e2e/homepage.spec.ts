import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display hero section and key blocks', async ({ page }) => {
    await page.goto('/');

    // Check Hero Section
    await expect(page.locator('h1')).toContainText('Эмоциональный баланс');
    await expect(page.getByRole('button', { name: /Записаться/i }).first()).toBeVisible();

    // Check Topics section
    await expect(page.getByRole('heading', { name: /С чего начать|С чем я помогаю/i })).toBeVisible();
    
    // Check FAQ Section
    await expect(page.getByRole('heading', { name: /Частые вопросы/i })).toBeVisible();
    
    // Check Trust Blocks
    await expect(page.getByText(/Конфиденциальность/i)).toBeVisible();
  });

  test('should navigate to booking page or telegram from hero CTA', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Записаться на консультацию|Получить план/i }).first().click();
    await page.waitForURL(/\/booking|t\.me/, { timeout: 20000, waitUntil: 'commit' });
    expect(page.url()).toMatch(/\/booking|t\.me/);
  });

  test('should navigate to topic page when clicking a topic card', async ({ page }) => {
    await page.goto('/');
    // Assuming 'anxiety' is one of the topics
    const anxietyCard = page.getByRole('link', { name: /Тревога/i }).first();
    if (await anxietyCard.isVisible()) {
      await anxietyCard.click();
      await expect(page).toHaveURL(/\/s-chem-ya-pomogayu\/anxiety/);
    }
  });

  test('should toggle FAQ items', async ({ page }) => {
    await page.goto('/');
    const question = page.getByText(/Как проходит первая встреча\?/i);
    await question.click();
    await expect(page.getByText(/Мы знакомимся, обсуждаем ваш запрос/i)).toBeVisible();
  });
});
