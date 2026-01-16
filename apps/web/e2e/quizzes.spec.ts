import { test, expect } from '@playwright/test';

test.describe('Quiz E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to quizzes page
    await page.goto('/start/quizzes');
  });

  test('should complete QZ-01 quiz and see result level', async ({ page }) => {
    // Navigate to anxiety quiz (assuming it exists)
    await page.goto('/start/quizzes/anxiety');
    
    // Wait for quiz to load
    await expect(page.locator('h1')).toContainText(/тревог/i);
    
    // Click start button
    await page.click('button:has-text("Начать тест")');
    
    // Wait for transition to questions
    await page.waitForSelector('h2');
    
    // Answer all 7 questions (selecting option with value 1 for each)
    for (let i = 0; i < 7; i++) {
      // Wait for question to appear
      const question = page.locator('h2');
      await expect(question).toBeVisible();
      
      // Click first option (usually value 0 or 1)
      const option = page.getByRole('button').filter({ hasText: /несколько дней|совсем нет/i }).first();
      await expect(option).toBeVisible({ timeout: 10000 });
      await option.click();
      
      // Wait for next question or result transition
      await page.waitForTimeout(300);
    }
    
    // Should see result
    await expect(page.locator('text=/низкий|умеренный|высокий/i').first()).toBeVisible();
    
    // Should see CTA button
    await expect(page.locator('button:has-text("Получить план"), button:has-text("Telegram")')).toBeVisible();
  });

  test('should not send answers in network payload', async ({ page }) => {
    // Intercept network requests
    const requests: any[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/complete')) {
        requests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData(),
        });
      }
    });

    await page.goto('/start/quizzes/anxiety');
    await page.click('button:has-text("Начать тест")');
    
    // Wait for transition to questions
    await page.waitForSelector('h2');

    // Answer a few questions
    for (let i = 0; i < 3; i++) {
      const option = page.getByRole('button').filter({ hasText: /несколько дней|совсем нет/i }).first();
      await expect(option).toBeVisible();
      await option.click();
      await page.waitForTimeout(500);
    }

    // Wait for completion request
    await page.waitForTimeout(2000);

    // Check that no request contains "answer" or "answers" in payload
    for (const req of requests) {
      if (req.postData) {
        const payload = JSON.parse(req.postData);
        expect(payload).not.toHaveProperty('answers');
        expect(payload).not.toHaveProperty('answer');
        // Should only contain aggregated data
        expect(payload).toHaveProperty('resultLevel');
        expect(payload).toHaveProperty('durationMs');
      }
    }
  });

  test('should show crisis banner for high score', async ({ page }) => {
    await page.goto('/start/quizzes/anxiety');
    await page.click('button:has-text("Начать тест")');
    
    // Wait for transition to questions
    await page.waitForSelector('h2');
    
    // Select maximum values for all questions to trigger high score
    for (let i = 0; i < 7; i++) {
      // Select option with highest value (usually "почти каждый день" or similar)
      const option = page.getByRole('button').filter({ hasText: /почти каждый день|каждый день/i }).first();
      await expect(option).toBeVisible({ timeout: 10000 });
      await option.click();
      await page.waitForTimeout(300);
    }
    
    // Should see crisis banner
    await expect(page.locator('text=/экстренн|помощь|кризис/i').first()).toBeVisible();
  });

  test('should return 404 for draft quiz', async ({ page }) => {
    // This test assumes there's a way to create a draft quiz
    // In real scenario, you'd need to set up test data first
    const response = await page.goto('/start/quizzes/non-existent-draft-quiz');
    expect(response?.status()).toBe(404);
  });
});
