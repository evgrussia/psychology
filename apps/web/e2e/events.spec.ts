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

    const eventLink = page.getByRole('link', { name: /Подробнее/i }).first();
    await expect(eventLink).toBeVisible();
    const eventHref = await eventLink.getAttribute('href');

    await Promise.all([
      page.waitForURL(new RegExp(eventHref || '/events/')),
      eventLink.click()
    ]);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Wait for event_viewed tracking
    await expect.poll(async () => {
      const eventsTracked = await page.evaluate(() => (window as any).__trackedEvents || []);
      return eventsTracked.find((e: any) => e.event === 'event_viewed');
    }, { timeout: 15000 }).toBeDefined();

    // Register
    const registerLink = page.getByRole('link', { name: /зарегистрироваться/i });
    await expect(registerLink).toBeVisible();
    
    await Promise.all([
      page.waitForURL(/\/events\/.*\/register/),
      registerLink.click()
    ]);

    await page.getByLabel(/контакт/i).fill('test@example.com');
    await page.getByRole('button', { name: /отправить/i }).click();

    // Wait for event_registered tracking
    await expect.poll(async () => {
      const afterRegisterEvents = await page.evaluate(() => (window as any).__trackedEvents || []);
      return afterRegisterEvents.find((e: any) => e.event === 'event_registered');
    }, { timeout: 15000 }).toBeDefined();
  });
});
