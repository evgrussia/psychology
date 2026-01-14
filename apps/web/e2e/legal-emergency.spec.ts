import { test, expect } from '@playwright/test';

test.describe('Legal and Emergency Pages', () => {
  test.describe('Emergency Page (/emergency)', () => {
    test('should display emergency page with contacts', async ({ page }) => {
      await page.goto('/emergency');

      // Check page title
      await expect(page.locator('main h1')).toContainText(/Экстренная помощь/i);
      
      // Check disclaimer
      await expect(page.locator('main').getByText(/не являются службой экстренной помощи/i)).toBeVisible();
      
      // Check emergency contacts
      await expect(page.locator('main').getByText(/8-800-2000-122/i).first()).toBeVisible();
      await expect(page.locator('main').getByText(/\+7 \(495\) 989-50-50/i).first()).toBeVisible();
      await expect(page.locator('main').getByText(/112/i).first()).toBeVisible();
    });

    test('should have clickable phone links', async ({ page }) => {
      await page.goto('/emergency');
      
      // Check tel: links exist
      const phoneLinks = page.locator('main a[href^="tel:"]');
      const count = await phoneLinks.count();
      expect(count).toBeGreaterThan(0);
      
      // Check first phone link
      const firstLink = phoneLinks.first();
      const href = await firstLink.getAttribute('href');
      expect(href).toMatch(/^tel:/);
    });

    test('should have navigation buttons', async ({ page }) => {
      await page.goto('/emergency');
      
      // Check "На главную" button
      const homeButton = page.locator('main').getByRole('button', { name: /На главную/i }).first();
      await expect(homeButton).toBeVisible();
      
      // Check "Библиотека практик" button
      const practicesButton = page.locator('main').getByRole('button', { name: /Библиотека практик/i }).first();
      await expect(practicesButton).toBeVisible();
    });

    test('should navigate to home from emergency page', async ({ page }) => {
      await page.goto('/emergency');
      
      const homeButton = page.locator('main').getByRole('button', { name: /На главную/i }).first();
      await homeButton.click();
      
      await page.waitForURL('**/');
      await expect(page).toHaveURL(/\/$/);
    });

    test('should have link to emergency in footer', async ({ page }) => {
      await page.goto('/');
      
      // Scroll to footer
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      
      // Check emergency link in footer
      const emergencyLink = page.getByRole('link', { name: /Все экстренные контакты/i });
      await expect(emergencyLink).toBeVisible();
      await expect(emergencyLink).toHaveAttribute('href', '/emergency');
    });

    test('should navigate from footer to emergency page', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      
      const emergencyLink = page.getByRole('link', { name: /Все экстренные контакты/i });
      await emergencyLink.click();
      
      await expect(page).toHaveURL('/emergency');
      await expect(page.locator('h1')).toContainText(/Экстренная помощь/i);
    });
  });

  test.describe('Legal Pages (/legal/*)', () => {
    const legalPages = [
      { slug: 'privacy', title: 'Политика конфиденциальности' },
      { slug: 'personal-data-consent', title: 'Согласие на обработку персональных данных' },
      { slug: 'offer', title: 'Публичная оферта' },
      { slug: 'disclaimer', title: 'Отказ от ответственности' },
      { slug: 'cookies', title: 'Политика использования Cookies' },
    ];

    for (const { slug, title } of legalPages) {
      test(`should display ${slug} page`, async ({ page }) => {
        await page.goto(`/legal/${slug}`);
        
        // Check page title
        await expect(page.locator('h1')).toBeVisible();
        
        // Check that page content exists
        const content = page.locator('main');
        await expect(content).toBeVisible();
      });
    }

    test('should have all legal links in footer', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      
      // Check legal links
      await expect(page.getByRole('link', { name: /Политика конфиденциальности/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Согласие на обработку ПДн/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Публичная оферта/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Отказ от ответственности/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Cookie Policy/i })).toBeVisible();
    });
  });

  test.describe('404 Page', () => {
    test('should display 404 page with navigation', async ({ page }) => {
      await page.goto('/non-existent-page-12345');
      
      // Check 404 number
      await expect(page.getByText('404')).toBeVisible();
      
      // Check heading
      await expect(page.getByRole('heading', { name: /Страница не найдена/i })).toBeVisible();
      
      // Check "С чего начать?" section
      await expect(page.getByRole('heading', { name: /С чего начать\?/i })).toBeVisible();
    });

    test('should have navigation links on 404 page', async ({ page }) => {
      await page.goto('/non-existent-page-12345');
      
      // Check navigation links
      await expect(page.getByRole('link', { name: /Руководство/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Читать блог/i }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: /Мои услуги/i }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: /О психологе/i }).first()).toBeVisible();
    });

    test('should navigate from 404 to start page', async ({ page }) => {
      await page.goto('/non-existent-page-12345');
      
      const startLink = page.getByRole('link', { name: /Руководство/i });
      await startLink.click();
      
      await expect(page).toHaveURL('/start');
    });

    test('should have "На главную" button on 404 page', async ({ page }) => {
      await page.goto('/non-existent-page-12345');
      
      const homeButton = page.getByRole('button', { name: /На главную/i });
      await expect(homeButton).toBeVisible();
      
      await homeButton.click();
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Accessibility', () => {
    test('emergency page should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/emergency');
      
      // Should have at least one H1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(1);
      
      // Should have H2
      const h2Count = await page.locator('h2').count();
      expect(h2Count).toBeGreaterThan(0);
    });

    test('emergency page phone links should be keyboard accessible', async ({ page }) => {
      await page.goto('/emergency');
      
      // Tab to first phone link
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Check that focus is on a link or button
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('404 page should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/non-existent-page-12345');
      
      // Should have at least one H1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(1);
    });

    test('404 page navigation should be keyboard accessible', async ({ page }) => {
      await page.goto('/non-existent-page-12345');
      
      // Tab to navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Press Enter on focused link
      await page.keyboard.press('Enter');
      
      // Should navigate (URL should change)
      await page.waitForURL(/\/(start|blog|services|about)/);
    });
  });
});
