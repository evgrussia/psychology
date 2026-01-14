import { test, expect } from '@playwright/test';

test.describe('Boundaries Scripts E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API response for boundaries scripts
    await page.route('**/api/public/interactive/boundaries-scripts/**', async (route) => {
      const slug = route.request().url().split('/').pop();
      if (slug === 'default') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test-id',
            slug: 'default',
            title: 'Скрипты границ',
            config: {
              scenarios: [
                { id: 'work', name: 'Работа', description: 'Ситуации на работе' },
                { id: 'family', name: 'Семья', description: 'Семейные ситуации' },
              ],
              tones: [
                { id: 'soft', name: 'Мягко' },
                { id: 'firm', name: 'Твёрдо' },
              ],
              goals: [
                { id: 'refuse', name: 'Отказать' },
                { id: 'ask', name: 'Попросить о помощи' },
              ],
              matrix: [
                {
                  scenario_id: 'work',
                  tone_id: 'soft',
                  goal_id: 'refuse',
                  variants: [
                    { variant_id: 'script_work_refuse_soft_v1', text: 'Извините, но я не могу помочь с этим сейчас.' },
                    { variant_id: 'script_work_refuse_soft_v2', text: 'К сожалению, сейчас у меня нет возможности.' },
                  ],
                },
                {
                  scenario_id: 'family',
                  tone_id: 'firm',
                  goal_id: 'ask',
                  variants: [
                    { variant_id: 'script_family_ask_firm_v1', text: 'Мне нужна ваша помощь с этим вопросом.' },
                  ],
                },
              ],
              safety_block: {
                text: 'Если вы в небезопасной ситуации, обратитесь за помощью.',
              },
            },
          }),
        });
      } else {
        await route.fulfill({ status: 404 });
      }
    });
  });

  test('should complete boundaries script flow: select → view variants → copy', async ({ page }) => {
    await page.goto('/start/boundaries-scripts/default');

    // Step 1: Select scenario
    await expect(page.getByRole('heading', { name: /Выберите ситуацию/i }).first()).toBeVisible();
    await page.getByRole('button', { name: 'Работа' }).click();

    // Step 2: Select tone
    await expect(page.getByRole('heading', { name: /Выберите стиль общения/i }).first()).toBeVisible();
    await page.getByRole('button', { name: 'Мягко' }).click();

    // Step 3: Select goal
    await expect(page.getByRole('heading', { name: /Чего хотите добиться/i }).first()).toBeVisible();
    await page.getByRole('button', { name: 'Отказать' }).click();

    // Step 4: View variants
    await expect(page.getByRole('heading', { name: /Варианты фраз/i }).first()).toBeVisible();
    await expect(page.locator('text=/Извините, но я не могу/i')).toBeVisible();
    await expect(page.locator('text=/К сожалению, сейчас/i')).toBeVisible();

    // Step 5: Copy variant
    const copyButton = page.locator('button:has-text("Скопировать")').first();
    await copyButton.click();

    // Verify button text changes
    await expect(page.locator('button:has-text("Скопировано!")').first()).toBeVisible();

    // Verify safety block is visible
    await expect(page.locator('text=/Что делать, если продолжают давить/i')).toBeVisible();
  });

  test('should track events without text content', async ({ page }) => {
    // Intercept tracking calls
    await page.addInitScript(() => {
      (window as any).__trackedEvents = [];
      (window as any).track = function(event: string, properties: any) {
        (window as any).__trackedEvents.push({ event, properties });
      };
    });

    await page.goto('/start/boundaries-scripts/default');

    // Complete flow
    await page.click('button:has-text("Работа")');
    await page.click('button:has-text("Мягко")');
    await page.click('button:has-text("Отказать")');

    // Wait for variants to load
    await expect(page.locator('h2').filter({ hasText: /Варианты фраз/i }).first()).toBeVisible();
    await page.waitForTimeout(500); // Wait for tracking events

    // Copy a variant
    await page.locator('button:has-text("Скопировать")').first().click();
    await page.waitForTimeout(500);

    // Verify tracking events
    const trackingEvents = await page.evaluate(() => (window as any).__trackedEvents || []);
    const startEvent = trackingEvents.find((e: any) => e.event === 'boundaries_script_start');
    expect(startEvent).toBeDefined();
    expect(startEvent?.properties).toHaveProperty('scenario');
    expect(startEvent?.properties).toHaveProperty('tone');
    expect(startEvent?.properties).toHaveProperty('topic');
    expect(startEvent?.properties).not.toHaveProperty('text'); // No text in start event

    const viewedEvent = trackingEvents.find((e: any) => e.event === 'boundaries_script_variant_viewed');
    expect(viewedEvent).toBeDefined();
    expect(viewedEvent?.properties).toHaveProperty('variant_id');
    expect(viewedEvent?.properties).not.toHaveProperty('text'); // No text in viewed event

    const copiedEvent = trackingEvents.find((e: any) => e.event === 'boundaries_script_copied');
    expect(copiedEvent).toBeDefined();
    expect(copiedEvent?.properties).toHaveProperty('variant_id');
    expect(copiedEvent?.properties).not.toHaveProperty('text'); // No text in copied event

    // Verify variant_id is present and stable
    expect(copiedEvent?.properties.variant_id).toMatch(/^script_/);
  });

  test('should show message when no variants available', async ({ page }) => {
    // Mock API with empty matrix for a combination
    await page.route('**/api/public/interactive/boundaries-scripts/default', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-id',
          slug: 'default',
          title: 'Скрипты границ',
          config: {
            scenarios: [{ id: 'work', name: 'Работа' }],
            tones: [{ id: 'soft', name: 'Мягко' }],
            goals: [{ id: 'refuse', name: 'Отказать' }],
            matrix: [], // Empty matrix
            safety_block: { text: 'Test safety text' },
          },
        }),
      });
    });

    await page.goto('/start/boundaries-scripts/default');

    await page.click('button:has-text("Семья")');
    await page.click('button:has-text("Мягко")');
    await page.click('button:has-text("Отказать")');

    // Should show message about no variants
    await expect(page.getByText(/нет готовых фраз/i).first()).toBeVisible();
    await expect(page.getByText(/Попробуйте сменить стиль или цель/i).first()).toBeVisible();
  });

  test('should show crisis banner for unsafe scenario', async ({ page }) => {
    // Mock API with unsafe scenario
    await page.route('**/api/public/interactive/boundaries-scripts/default', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-id',
          slug: 'default',
          title: 'Скрипты границ',
          config: {
            scenarios: [
              { id: 'unsafe', name: 'Небезопасная ситуация', is_unsafe: true },
            ],
            tones: [{ id: 'soft', name: 'Мягко' }],
            goals: [{ id: 'refuse', name: 'Отказать' }],
            matrix: [],
            safety_block: { text: 'Test safety text' },
          },
        }),
      });
    });

    await page.goto('/start/boundaries-scripts/default');

    // Select unsafe scenario
    await page.click('button:has-text("Небезопасная ситуация")');

    // Should show crisis banner
    await expect(page.locator('text=/экстренн|помощь|кризис/i').first()).toBeVisible();
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    await page.goto('/start/boundaries-scripts/default');

    // Focus first button
    const firstButton = page.getByRole('button', { name: 'Работа' }).first();
    await firstButton.focus();

    // Should be able to select with Enter
    await page.keyboard.press('Enter');

    // Should move to next step and have focus on the new heading
    await expect(page.getByRole('heading', { name: /Выберите стиль общения/i }).first()).toBeVisible();
  });

  test('should have aria-live region for copy notification', async ({ page }) => {
    await page.goto('/start/boundaries-scripts/default');

    // Complete flow
    await page.click('button:has-text("Работа")');
    await page.click('button:has-text("Мягко")');
    await page.click('button:has-text("Отказать")');

    // Wait for variants
    await expect(page.locator('h2').filter({ hasText: /Варианты фраз/i }).first()).toBeVisible();

    // Check for aria-live region
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toBeAttached();

    // Copy variant
    await page.locator('button:has-text("Скопировать")').first().click();

    // Verify aria-live region has content
    await expect(liveRegion).toContainText(/Фраза скопирована/i);
  });
});
