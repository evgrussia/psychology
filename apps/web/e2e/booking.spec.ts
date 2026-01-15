import { test, expect } from '@playwright/test';

test.describe('Booking flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__trackedEvents = [];
      (window as any).track = (eventName: string, properties: Record<string, any>) => {
        (window as any).__trackedEvents.push({ eventName, properties });
      };
    });

    await page.route('**/api/public/booking/slots**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'available',
          timezone: 'Europe/Moscow',
          service_id: 'service-1',
          service_slug: 'intro-session',
          service_title: 'Ознакомительная консультация',
          range: {
            from: new Date().toISOString(),
            to: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          },
          slots: [
            {
              id: 'slot-1',
              start_at_utc: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
              end_at_utc: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
            },
          ],
        }),
      });
    });

    await page.route('**/api/public/services', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'service-1',
            slug: 'intro-session',
            title: 'Ознакомительная сессия',
            format: 'online',
            duration_minutes: 50,
            price_amount: 4000,
            deposit_amount: 1000,
            description_markdown: 'Описание',
          },
        ]),
      });
    });

    await page.route('**/api/public/booking/start', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          appointment_id: 'appt-1',
          status: 'pending_payment',
          service: {
            id: 'service-1',
            slug: 'intro-session',
            title: 'Ознакомительная консультация',
            format: 'online',
            duration_minutes: 60,
            price_amount: 3500,
            deposit_amount: 1000,
          },
          slot: {
            id: 'slot-1',
            start_at_utc: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            end_at_utc: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
          },
        }),
      });
    });

    await page.route('**/api/public/booking/**/intake', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          appointment_id: 'appt-1',
          submitted_at: new Date().toISOString(),
        }),
      });
    });

    await page.route('**/api/public/booking/**/consents', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          appointment_id: 'appt-1',
          user_id: 'user-1',
          consents: {
            personal_data: true,
            communications: true,
            telegram: false,
          },
        }),
      });
    });

    await page.route('**/api/public/payments', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          payment_id: 'pay-1',
          confirmation: null,
        }),
      });
    });

    let statusCalls = 0;
    await page.route('**/api/public/booking/**/status', async (route) => {
      statusCalls += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          appointment_id: 'appt-1',
          status: statusCalls > 1 ? 'confirmed' : 'pending_payment',
          service_slug: 'intro-session',
          format: 'online',
          timezone: 'Europe/Moscow',
          start_at_utc: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          end_at_utc: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        }),
      });
    });
  });

  test('should complete booking flow to confirmation', async ({ page }) => {
    await page.goto('/booking/service');

    const serviceCard = page.locator('div.rounded-xl.border', { hasText: /Ознакомительная сессия|Ознакомительная консультация/i }).first();
    await expect(serviceCard).toBeVisible();
    
    const formatOption = serviceCard.getByLabel('Онлайн');
    if (await formatOption.count()) {
      await formatOption.first().click();
    }

    await serviceCard.getByRole('button', { name: /Выбрать слот/i }).first().click();
    
    // Wait for navigation and potential redirect back
    await page.waitForURL(/\/booking\/slot/, { timeout: 10000 }).catch(() => {});
    
    if (page.url().includes('/booking/service')) {
      console.log('Redirected back to service page, retrying click...');
      await serviceCard.getByRole('button', { name: /Выбрать слот/i }).first().click();
    }

    await expect(page).toHaveURL(/\/booking\/slot/, { timeout: 15000 });

    await page.getByRole('radio').first().click();
    await page.getByRole('button', { name: /Продолжить/i }).click();
    await expect(page).toHaveURL(/\/booking\/intake/);

    const selects = page.getByRole('combobox');
    await selects.nth(0).click();
    await page.getByRole('option', { name: /Тревога/i }).click();
    await selects.nth(1).click();
    await page.getByRole('option', { name: /Прояснить ситуацию/i }).click();
    await selects.nth(2).click();
    await page.getByRole('option', { name: /первая консультация/i }).click();
    await selects.nth(3).click();
    await page.getByRole('option', { name: /Средняя/i }).click();
    await selects.nth(4).click();
    await page.getByRole('option', { name: /Состояние и поддержка/i }).click();
    await page.getByPlaceholder('Коротко опишите, что важно учесть. Не пишите персональные данные.').fill('Пробный текст');
    await page.getByRole('button', { name: /Продолжить/i }).click();

    await page.waitForURL(/\/booking\/consents/, { timeout: 15000 }).catch(async () => {
      const currentUrl = page.url();
      const errorVisible = await page.getByRole('alert').isVisible();
      if (errorVisible) {
        const errorText = await page.getByRole('alert').innerText();
        throw new Error(`Intake submission failed at ${currentUrl}: ${errorText}`);
      }
      throw new Error(`Timed out waiting for /booking/consents. Current URL: ${currentUrl}`);
    });

    await page.getByLabel('Email для подтверждений').fill('test@example.com');
    await page.getByLabel(/Я даю согласие/).check();
    await page.getByLabel(/напоминания и сервисные сообщения/).check();
    await page.getByRole('button', { name: /Перейти к оплате/i }).click();

    await expect(page).toHaveURL(/\/booking\/payment/);
    await page.getByRole('button', { name: /Перейти к оплате/i }).click();

    await expect(page).toHaveURL(/\/booking\/confirmation/);
    await expect(page.getByText(/Ожидаем подтверждение|Запись подтверждена/i)).toBeVisible();
    await page.waitForTimeout(9000);
    await expect(page.getByText(/Запись подтверждена/i)).toBeVisible();

    const trackingEvents = await page.evaluate(() => (window as any).__trackedEvents || []);
    const intakeSubmitted = trackingEvents.find((event: any) => event.eventName === 'intake_submitted');
    expect(intakeSubmitted).toBeDefined();
    expect(intakeSubmitted.properties).not.toHaveProperty('notes');
  });
});
