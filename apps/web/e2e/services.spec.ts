import { test, expect } from '@playwright/test';

test.describe('Services', () => {
  test('should show services list', async ({ page }) => {
    await page.goto('/services');
    await expect(page.locator('h1')).toContainText('Услуги');
    await expect(page.locator('main')).toContainText('Ознакомительная');
  });

  test('should open service page and track booking_start', async ({ page }) => {
    await page.addInitScript(() => {
      if (!localStorage.getItem('track_events')) {
        localStorage.setItem('track_events', JSON.stringify([]));
      }
      (window as any).track = (eventName: string, properties: Record<string, any>) => {
        const existing = JSON.parse(localStorage.getItem('track_events') || '[]');
        existing.push({ eventName, properties });
        localStorage.setItem('track_events', JSON.stringify(existing));
      };
    });

    await page.goto('/services/intro-session');
    // Clear events after initial page load to start fresh for the click test
    await page.evaluate(() => localStorage.setItem('track_events', JSON.stringify([])));
    
    await expect(page.locator('h1')).toContainText('Ознакомительная');

    await page.getByRole('button', { name: /Начать запись/i }).first().click();
    await expect(page).toHaveURL(/\/booking/);

    const events = await page.evaluate(() => JSON.parse(localStorage.getItem('track_events') || '[]'));
    const bookingStart = events.find((event: any) => event.eventName === 'booking_start');
    expect(bookingStart).toBeTruthy();
    expect(bookingStart.properties.service_slug).toBe('intro-session');
  });

  test('service page should be keyboard accessible', async ({ page }) => {
    await page.goto('/services/intro-session');

    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});
