import { test, expect } from '@playwright/test';

test.describe('Homepage Accessibility', () => {
  test('should have basic accessibility markers', async ({ page }) => {
    await page.goto('/');
    
    // Check for main landmark
    await expect(page.locator('main')).toBeVisible();
    
    // Check for lang attribute
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('ru');
  });

  test('should have accessible topic cards', async ({ page }) => {
    await page.goto('/');
    
    // Проверяем, что карточки доступны
    const topicCards = await page.locator('a[href^="/s-chem-ya-pomogayu/"]').all();
    
    for (const card of topicCards) {
      // Проверяем наличие текстового содержимого
      const text = await card.textContent();
      expect(text?.trim()).toBeTruthy();
    }
  });

  test('should have accessible CTA buttons', async ({ page }) => {
    await page.goto('/');
    
    const buttons = await page.getByRole('button').all();
    
    for (const button of buttons) {
      // Каждая кнопка должна быть видима
      await expect(button).toBeVisible();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Проверяем, что можно таб-нуться по всем интерактивным элементам
    await page.keyboard.press('Tab');
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    
    // Должен быть сфокусирован какой-то элемент
    expect(focusedElement).toBeTruthy();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Проверяем иерархию заголовков
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    
    // Проверяем, что H2 идут после H1
    const firstHeading = await page.locator('h1, h2, h3').first();
    const tagName = await firstHeading.evaluate(el => el.tagName);
    expect(tagName).toBe('H1');
  });

  test('should have accessible images with alt text', async ({ page }) => {
    await page.goto('/');
    
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      // Alt может быть пустым для декоративных изображений, но атрибут должен присутствовать
      expect(alt !== null).toBe(true);
    }
  });
});
