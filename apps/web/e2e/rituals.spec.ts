import { test, expect } from '@playwright/test';

test.describe('Rituals flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__trackedEvents = [];
      (window as any).track = (event: string, properties: any) => {
        (window as any).__trackedEvents.push({ event, properties });
      };
    });

    await page.route('**/api/public/interactive/rituals', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              id: 'rit-1',
              slug: 'breathing-ritual',
              title: 'Дыхание 4-7-8',
              topicCode: 'anxiety',
              config: {
                why: 'Помогает быстро успокоиться и снизить уровень стресса.',
                totalDurationSeconds: 180,
              },
            },
          ],
          total: 1,
        }),
      });
    });
  });

  test('should start and complete a ritual', async ({ page }) => {
    await page.goto('/start/rituals');

    await expect(page.getByText('Дыхание 4-7-8')).toBeVisible();
    await page.getByRole('link', { name: 'Начать', exact: true }).click();

    await expect(page).toHaveURL(/\/start\/rituals\/breathing-ritual/);
    await page.getByRole('button', { name: /начать ритуал/i }).click();

    await page.getByRole('button', { name: 'Перейти к следующему шагу' }).click();
    await page.getByRole('button', { name: 'Перейти к следующему шагу' }).click();
    await page.getByRole('button', { name: 'Завершить ритуал' }).click();

    await expect(page.getByText(/Ритуал завершен/i)).toBeVisible();

    const trackingEvents = await page.evaluate(() => (window as any).__trackedEvents || []);
    expect(trackingEvents.find((e: any) => e.event === 'ritual_started')).toBeDefined();
    expect(trackingEvents.find((e: any) => e.event === 'ritual_completed')).toBeDefined();
  });
});
