import { test, expect } from '@playwright/test';

test.describe('Trust Pages', () => {
  test.describe('About Page (/about)', () => {
    test('should display about page content', async ({ page }) => {
      await page.goto('/about');

      // Check page title
      await expect(page.locator('h1')).toBeVisible();
      
      // Check trust blocks section
      await expect(page.getByRole('heading', { name: /Мои принципы и этика/i })).toBeVisible();
      await expect(page.getByText(/Конфиденциальность/i)).toBeVisible();
      await expect(page.getByText(/Границы/i)).toBeVisible();
      await expect(page.getByText(/Образование/i)).toBeVisible();
    });

    test('should navigate from /about to /booking when clicking CTA', async ({ page }) => {
      await page.goto('/about');
      
      // Wait for page to load
      await expect(page.locator('h1')).toBeVisible();
      
      // Click "Записаться" button
      const bookingButton = page.getByRole('button', { name: /Записаться/i });
      await expect(bookingButton).toBeVisible();
      await bookingButton.click();
      
      // Should navigate to booking page
      await expect(page).toHaveURL(/\/booking/);
    });

    test('should display CTA block with booking and Telegram options', async ({ page }) => {
      await page.goto('/about');
      
      // Check CTA section
      await expect(page.getByText(/С чего начнём\?/i)).toBeVisible();
      await expect(page.getByText(/Вы можете записаться на ознакомительную сессию/i)).toBeVisible();
      
      // Check both CTA buttons
      await expect(page.getByRole('button', { name: /Записаться/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Написать в Telegram/i })).toBeVisible();
    });
  });

  test.describe('How It Works Page (/how-it-works)', () => {
    test('should display how-it-works page content', async ({ page }) => {
      await page.goto('/how-it-works');

      // Check page title
      await expect(page.locator('h1')).toBeVisible();
      
      // Check FAQ section
      await expect(page.getByRole('heading', { name: /Частые вопросы о процессе/i })).toBeVisible();
    });

    test('should toggle FAQ items on /how-it-works', async ({ page }) => {
      await page.goto('/how-it-works');
      
      // Find FAQ question button
      const faqButton = page.getByRole('button', { name: /Как подготовиться к первой встрече\?/i });
      await expect(faqButton).toBeVisible();
      
      // Answer should not be visible initially
      await expect(page.getByText(/Специальная подготовка не нужна/i)).not.toBeVisible();
      
      // Click to open FAQ
      await faqButton.click();
      
      // Answer should now be visible
      await expect(page.getByText(/Специальная подготовка не нужна/i)).toBeVisible();
      await expect(page.getByText(/Достаточно вашего желания и тихого места/i)).toBeVisible();
    });

    test('should close FAQ when clicking again', async ({ page }) => {
      await page.goto('/how-it-works');
      
      const faqButton = page.getByRole('button', { name: /Как подготовиться к первой встрече\?/i });
      
      // Open FAQ
      await faqButton.click();
      await expect(page.getByText(/Специальная подготовка не нужна/i)).toBeVisible();
      
      // Close FAQ
      await faqButton.click();
      await expect(page.getByText(/Специальная подготовка не нужна/i)).not.toBeVisible();
    });

    test('should show only one FAQ answer at a time', async ({ page }) => {
      await page.goto('/how-it-works');
      
      const firstQuestion = page.getByRole('button', { name: /Как подготовиться к первой встрече\?/i });
      const secondQuestion = page.getByRole('button', { name: /В каком формате проходят встречи\?/i });
      
      // Open first question
      await firstQuestion.click();
      await expect(page.getByText(/Специальная подготовка не нужна/i)).toBeVisible();
      
      // Open second question - first should close
      await secondQuestion.click();
      await expect(page.getByText(/Специальная подготовка не нужна/i)).not.toBeVisible();
      await expect(page.getByText(/Обычно это видеозвонок/i)).toBeVisible();
    });

    test('should navigate from /how-it-works to /booking when clicking CTA', async ({ page }) => {
      await page.goto('/how-it-works');
      
      // Click "Записаться" button
      const bookingButton = page.getByRole('button', { name: /Записаться/i });
      await expect(bookingButton).toBeVisible();
      await bookingButton.click();
      
      // Should navigate to booking page
      await expect(page).toHaveURL(/\/booking/);
    });
  });

  test.describe('Navigation and Links', () => {
    test('should have link to /about in footer', async ({ page }) => {
      await page.goto('/');
      
      // Scroll to footer
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      
      // Check footer navigation
      const aboutLink = page.getByRole('link', { name: /О психологе/i });
      await expect(aboutLink).toBeVisible();
      await expect(aboutLink).toHaveAttribute('href', '/about');
    });

    test('should have link to /how-it-works in footer', async ({ page }) => {
      await page.goto('/');
      
      // Scroll to footer
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      
      // Check footer navigation
      const howItWorksLink = page.getByRole('link', { name: /Как проходит консультация/i });
      await expect(howItWorksLink).toBeVisible();
      await expect(howItWorksLink).toHaveAttribute('href', '/how-it-works');
    });

    test('should navigate from footer link to /about', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      
      const aboutLink = page.getByRole('link', { name: /О психологе/i });
      await aboutLink.click();
      
      await expect(page).toHaveURL('/about');
      await expect(page.locator('h1')).toBeVisible();
    });

    test('should navigate from footer link to /how-it-works', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      
      const howItWorksLink = page.getByRole('link', { name: /Как проходит консультация/i });
      await howItWorksLink.click();
      
      await expect(page).toHaveURL('/how-it-works');
      await expect(page.locator('h1')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/about');
      
      // Should have one H1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);
      
      // H2 should come after H1
      const firstHeading = await page.locator('h1, h2').first();
      const tagName = await firstHeading.evaluate(el => el.tagName);
      expect(tagName).toBe('H1');
    });

    test('FAQ buttons should have aria-expanded attribute', async ({ page }) => {
      await page.goto('/how-it-works');
      
      const faqButton = page.getByRole('button', { name: /Как подготовиться к первой встрече\?/i });
      
      // Initially should be aria-expanded="false"
      await expect(faqButton).toHaveAttribute('aria-expanded', 'false');
      
      // After clicking should be aria-expanded="true"
      await faqButton.click();
      await expect(faqButton).toHaveAttribute('aria-expanded', 'true');
    });

    test('should support keyboard navigation in FAQ', async ({ page }) => {
      await page.goto('/how-it-works');
      
      // Tab to first FAQ button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Press Enter to open
      await page.keyboard.press('Enter');
      
      // Check that FAQ is opened
      await expect(page.getByText(/Специальная подготовка не нужна/i)).toBeVisible();
    });
  });
});
