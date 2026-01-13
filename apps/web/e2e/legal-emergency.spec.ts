import { test, expect } from '@playwright/test';

test.describe('Legal and Emergency Pages', () => {
  test.describe('Emergency Page (/emergency)', () => {
    test('should display emergency page with contacts', async ({ page }) => {
      await page.goto('/emergency');

      // Check page title
      await expect(page.locator('h1')).toContainText(/Экстренная помощь/i);
      
      // Check disclaimer
      await expect(page.getByText(/не являются службой экстренной помощи/i)).toBeVisible();
      
      // Check emergency contacts
      await expect(page.getByText(/8-800-2000-122/i)).toBeVisible();
      await expect(page.getByText(/\+7 \(495\) 989-50-50/i)).toBeVisible();
      await expect(page.getByText(/112/i)).toBeVisible();
    });

    test('should have clickable phone links', async ({ page }) => {
      await page.goto('/emergency');
      
      // Check tel: links exist
      const phoneLinks = page.locator('a[href^="tel:"]');
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
      const homeButton = page.getByRole('button', { name: /На главную/i });
      await expect(homeButton).toBeVisible();
      
      // Check "Перейти в блог" button
      const blogButton = page.getByRole('button', { name: /Перейти в блог/i });
      await expect(blogButton).toBeVisible();
    });

    test('should navigate to home from emergency page', async ({ page }) => {
      await page.goto('/emergency');
      
      const homeButton = page.getByRole('button', { name: /На главную/i });
      await homeButton.click();
      
      await expect(page).toHaveURL('/');
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
      await expect(page.getByRole('link', { name: /Читать блог/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Мои услуги/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /О психологе/i })).toBeVisible();
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
      
      // Should have one H1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);
      
      // Should have H2
      const h2Count = await page.locator('h2').count();
      expect(h2Count).toBeGreaterThan(0);
    });

    test('emergency page phone links should be keyboard accessible', async ({ page }) => {
      await page.goto('/emergency');
      
      // Tab to first phone link
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Check that focus is on a link
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toHaveAttribute('href', /tel:/);
    });

    test('404 page should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/non-existent-page-12345');
      
      // Should have one H1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);
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
