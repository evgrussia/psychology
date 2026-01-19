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

    await page.waitForTimeout(2000); // Increased wait time
    const trackingEvents = await page.evaluate(() => (window as any).__trackedEvents || []);
    expect(trackingEvents.length).toBeGreaterThan(0); // Ensure some events were tracked
    expect(trackingEvents.find((e: any) => e.event === 'navigator_start')).toBeDefined();
    expect(trackingEvents.find((e: any) => e.event === 'navigator_step_completed')).toBeDefined();
    expect(trackingEvents.find((e: any) => e.event === 'navigator_complete')).toBeDefined();

    const crisisEvent = trackingEvents.find((e: any) => e.event === 'crisis_banner_shown');
    expect(crisisEvent).toBeDefined();
    expect(crisisEvent?.properties?.trigger_type).toBeDefined();
  });
});
