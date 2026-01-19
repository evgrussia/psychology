import { test, expect } from '@playwright/test';

test.describe('Resource thermometer flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__trackedEvents = [];
      (window as any).track = (event: string, properties: any) => {
        (window as any).__trackedEvents.push({ event, properties });
      };
    });
  });

  test('should complete thermometer and track aggregated result', async ({ page }) => {
    await page.goto('/start/thermometer/resource-thermometer');

    await page.getByRole('button', { name: /начать/i }).click();

    await page.getByRole('button', { name: /далее|результат/i }).click();
    await page.getByRole('button', { name: /далее|результат/i }).click();
    await page.getByRole('button', { name: /результат/i }).click();

    await expect(page.locator('text=/ресурс|опора/i').first()).toBeVisible();

    await page.waitForTimeout(1000); // Give time for all events to be processed
    const trackingEvents = await page.evaluate(() => (window as any).__trackedEvents || []);
    const startEvent = trackingEvents.find((e: any) => e.event === 'resource_thermometer_start');
    const completeEvent = trackingEvents.find((e: any) => e.event === 'resource_thermometer_complete');

    expect(startEvent).toBeDefined();
    expect(completeEvent).toBeDefined();
    expect(completeEvent?.properties).toHaveProperty('resource_level');
    expect(completeEvent?.properties).toHaveProperty('duration_ms');
    expect(completeEvent?.properties).not.toHaveProperty('score');
  });
});
