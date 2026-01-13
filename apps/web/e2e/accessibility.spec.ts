import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Homepage Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have accessible hero section', async ({ page }) => {
    await page.goto('/');
    
    const heroSection = page.locator('section').first();
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include(heroSection)
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have accessible topic cards', async ({ page }) => {
    await page.goto('/');
    
    // Проверяем, что карточки доступны
    const topicCards = await page.locator('a[href^="/s-chem-ya-pomogayu/"]').all();
    
    for (const card of topicCards) {
      // Проверяем наличие aria-label или текстового содержимого
      const ariaLabel = await card.getAttribute('aria-label');
      const text = await card.textContent();
      
      expect(ariaLabel || text).toBeTruthy();
    }
  });

  test('should have accessible CTA buttons', async ({ page }) => {
    await page.goto('/');
    
    const buttons = await page.getByRole('button').all();
    
    for (const button of buttons) {
      // Каждая кнопка должна быть доступна с клавиатуры
      await button.focus();
      expect(await button.evaluate(el => el === document.activeElement)).toBe(true);
    }
  });

  test('should have accessible FAQ section', async ({ page }) => {
    await page.goto('/');
    
    const faqButtons = await page.locator('section:has-text("Частые вопросы") button').all();
    
    expect(faqButtons.length).toBeGreaterThan(0);
    
    for (const button of faqButtons) {
      // FAQ кнопки должны быть доступны
      const text = await button.textContent();
      expect(text).toBeTruthy();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Проверяем, что можно таб-нуться по всем интерактивным элементам
    await page.keyboard.press('Tab');
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    
    // Должен быть сфокусирован какой-то элемент
    expect(focusedElement).toBeTruthy();
    
    // Проверяем несколько табов
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['color-contrast'])
      .analyze();

    // Проверяем, что нет нарушений контраста
    const contrastViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'color-contrast'
    );
    
    expect(contrastViolations).toEqual([]);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Проверяем иерархию заголовков
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1); // Должен быть один H1
    
    // Проверяем, что H2 идут после H1
    const firstHeading = await page.locator('h1, h2, h3').first();
    const tagName = await firstHeading.evaluate(el => el.tagName);
    expect(tagName).toBe('H1');
  });

  test('should have accessible form elements if present', async ({ page }) => {
    await page.goto('/');
    
    // Если есть формы (например, подписка на newsletter), проверяем их
    const forms = await page.locator('form').count();
    
    if (forms > 0) {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('form')
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    }
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
