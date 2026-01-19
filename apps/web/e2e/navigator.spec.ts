import { test, expect } from '@playwright/test';

test.describe('Navigator flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__trackedEvents = [];
      (window as any).track = (event: string, properties: any) => {
        (window as any).__trackedEvents.push({ event, properties });
      };
    });
  });

  test('should complete navigator with crisis banner', async ({ page }) => {
    await page.goto('/start/navigator/state-navigator');

    await page.getByRole('button', { name: /начать/i }).click();

    await page.getByRole('button', { name: /плохо|нужна помощь|тяжело/i }).first().click();

    // Answer "Yes" to crisis question to complete the flow
    await page.getByRole('button', { name: /да/i }).first().click();

    await expect(page.locator('text=/экстренн|поддержк|опасн/i').first()).toBeVisible();

    await expect.poll(async () => {
      const trackingEvents = await page.evaluate(() => (window as any).__trackedEvents || []);
      return {
        start: trackingEvents.find((e: any) => e.event === 'navigator_start'),
        step: trackingEvents.find((e: any) => e.event === 'navigator_step_completed'),
        complete: trackingEvents.find((e: any) => e.event === 'navigator_complete'),
        crisis: trackingEvents.find((e: any) => e.event === 'crisis_banner_shown'),
      };
    }).toMatchObject({
      start: expect.anything(),
      step: expect.anything(),
      complete: expect.anything(),
      crisis: expect.anything(),
    });

    const trackingEvents = await page.evaluate(() => (window as any).__trackedEvents || []);
    const crisisEvent = trackingEvents.find((e: any) => e.event === 'crisis_banner_shown');
    expect(crisisEvent?.properties?.trigger_type).toBeDefined();
  });
});
