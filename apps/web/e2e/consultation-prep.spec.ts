import { test, expect } from '@playwright/test';

test.describe('Consultation prep flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__trackedEvents = [];
      (window as any).track = (event: string, properties: any) => {
        (window as any).__trackedEvents.push({ event, properties });
      };
    });

    await page.route('**/api/public/deep-links', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          deep_link_id: 'dl-test',
          url: '#tg',
        }),
      });
    });
  });

  test('should complete prep wizard and export to Telegram', async ({ page }) => {
    await page.goto('/start/prep/consultation-prep');

    await page.getByRole('button', { name: /начать/i }).click();

    await page.getByRole('button', { name: /тревога|выгорание|отношения/i }).first().click();
    await page.getByRole('button', { name: /далее/i }).click();

    await page.getByRole('button', { name: /прояснить|поддержк|план/i }).first().click();
    await page.getByRole('button', { name: /далее/i }).click();

    await page.getByRole('button', { name: /мягко|структурно|смешан/i }).first().click();
    await page.getByRole('button', { name: /далее/i }).click();

    await page.getByRole('button', { name: /онлайн|время|конфиденциальность/i }).first().click();
    await page.getByRole('button', { name: /далее/i }).click();

    await page.getByRole('button', { name: /правила|план|вопрос/i }).first().click();
    await page.getByRole('button', { name: /готово/i }).click();

    await expect(page.getByText(/черновик|подготов/i)).toBeVisible();

    await page.getByRole('button', { name: /telegram/i }).click();

    const trackingEvents = await page.evaluate(() => (window as any).__trackedEvents || []);
    expect(trackingEvents.find((e: any) => e.event === 'consultation_prep_start')).toBeDefined();
    expect(trackingEvents.find((e: any) => e.event === 'consultation_prep_complete')).toBeDefined();

    const exportedEvent = trackingEvents.find((e: any) => e.event === 'consultation_prep_exported');
    expect(exportedEvent).toBeDefined();
    expect(exportedEvent?.properties).toHaveProperty('export_target', 'telegram');

    const tgEvent = trackingEvents.find((e: any) => e.event === 'cta_tg_click');
    expect(tgEvent?.properties?.deep_link_id).toBe('dl-test');
  });
});
