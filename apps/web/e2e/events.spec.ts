import { test, expect } from '@playwright/test';

test.describe('Events flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__trackedEvents = [];
      (window as any).track = (event: string, properties: any) => {
        (window as any).__trackedEvents.push({ event, properties });
      };
    });

    await page.route('**/api/public/events/**/register', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ registration_id: 'reg-1' }),
      });
    });
  });

  test('should view event and submit registration', async ({ page }) => {
    await page.goto('/events');

    const eventCard = page.locator('a[href^="/events/"]').first();
    await expect(eventCard).toBeVisible();
    const eventHref = await eventCard.getAttribute('href');

    await eventCard.click();

    await expect(page).toHaveURL(new RegExp(eventHref || '/events/'));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await expect.poll(async () => {
      const eventsTracked = await page.evaluate(() => (window as any).__trackedEvents || []);
      return eventsTracked.find((e: any) => e.event === 'event_viewed');
    }).toBeDefined();

    await page.getByRole('link', { name: /зарегистрироваться/i }).click();
    await expect(page).toHaveURL(/\/events\/.*\/register/);

    await page.getByLabel(/контакт/i).fill('test@example.com');
    await page.getByRole('button', { name: /отправить/i }).click();

    await expect.poll(async () => {
      const afterRegisterEvents = await page.evaluate(() => (window as any).__trackedEvents || []);
      return afterRegisterEvents.find((e: any) => e.event === 'event_registered');
    }).toBeDefined();
  });
});
