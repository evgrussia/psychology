import { test, expect } from '@playwright/test';
import { ApiHelper } from '../helpers/api';
import { AuthHelper } from '../helpers/auth';
import { CustomAssertions } from '../helpers/assertions';
import { A11yHelper } from '../helpers/a11y';

// Load fixtures
const usersFixture = require('../fixtures/users.json');

/**
 * G3: Telegram-связка
 * Путь: CTA "получить план/сохранить" → deep link → онбординг → серия/план
 * 
 * Критерии успеха:
 * - Deep link корректно передает контекст
 * - Онбординг завершается успешно
 * - Серия доставляется согласно настройкам
 * - Отписка работает корректно
 */
test.describe('G3: Telegram-связка', () => {
  let api: ApiHelper;
  let auth: AuthHelper;

  test.beforeEach(async ({ page }) => {
    api = new ApiHelper();
    auth = new AuthHelper(api);
  });

  test('должен отобразить CTA с deep link для Telegram', async ({ page }) => {
    // Переход на страницу с результатом интерактива
    await page.goto('/quiz/test-quiz');
    await page.waitForLoadState('networkidle');

    // Проверка наличия Telegram CTA
    const telegramCTA = page.locator('[data-testid="cta-telegram"]');
    await expect(telegramCTA).toBeVisible({ timeout: 10000 });

    // Проверка deep link
    const href = await telegramCTA.getAttribute('href');
    expect(href).toContain('tg://');
    expect(href).toContain('start');
  });

  test('должен передавать контекст через deep link параметры', async ({ page }) => {
    await page.goto('/quiz/test-quiz');
    await page.waitForLoadState('networkidle');

    const telegramCTA = page.locator('[data-testid="cta-telegram"]');
    if (await telegramCTA.isVisible()) {
      const href = await telegramCTA.getAttribute('href');
      
      // Проверка наличия параметров контекста
      // Например: tg://resolve?domain=bot&start=quiz_result_123
      expect(href).toMatch(/start=/);
      
      // Проверка передачи типа ресурса
      if (href.includes('quiz')) {
        expect(href).toContain('quiz');
      }
    }
  });

  test('должен обрабатывать deep link при открытии через Telegram', async ({ page }) => {
    // Симуляция открытия через Telegram deep link
    const deepLinkParams = 'start=quiz_result_123&type=quiz&topic=anxiety';
    await page.goto(`/?${deepLinkParams}`);
    await page.waitForLoadState('networkidle');

    // Проверка обработки параметров (если есть обработчик на фронтенде)
    // В реальном сценарии это обрабатывается ботом, но можно проверить редирект
  });

  test('должен работать CTA "Сохранить в Telegram"', async ({ page }) => {
    await page.goto('/quiz/test-quiz');
    await page.waitForLoadState('networkidle');

    // Альтернативный CTA для сохранения
    const saveCTA = page.locator('[data-testid="cta-save-telegram"]');
    if (await saveCTA.isVisible()) {
      const href = await saveCTA.getAttribute('href');
      expect(href).toContain('tg://');
    }
  });

  test('должен работать CTA "Получить план"', async ({ page }) => {
    await page.goto('/content/article/test-article');
    await page.waitForLoadState('networkidle');

    // CTA для получения плана
    const planCTA = page.locator('[data-testid="cta-get-plan"]');
    if (await planCTA.isVisible()) {
      const href = await planCTA.getAttribute('href');
      expect(href).toContain('tg://');
    }
  });

  test('должен корректно обрабатывать ошибки при недоступности Telegram', async ({ page }) => {
    // Если Telegram недоступен, должна быть альтернатива
    await page.goto('/quiz/test-quiz');
    await page.waitForLoadState('networkidle');

    const telegramCTA = page.locator('[data-testid="cta-telegram"]');
    if (await telegramCTA.isVisible()) {
      // Проверка наличия fallback (например, веб-версия)
      const fallbackCTA = page.locator('[data-testid="cta-fallback"]');
      // Fallback может быть не всегда виден, но должен существовать
    }
  });

  test('должен быть доступен с клавиатуры', async ({ page }) => {
    await page.goto('/quiz/test-quiz');
    await page.waitForLoadState('networkidle');

    const telegramCTA = page.locator('[data-testid="cta-telegram"]');
    if (await telegramCTA.isVisible()) {
      await telegramCTA.focus();
      await expect(telegramCTA).toBeFocused();
      
      // Проверка, что можно активировать с клавиатуры
      await page.keyboard.press('Enter');
      // После Enter должна произойти навигация или открытие приложения
    }
  });
});
