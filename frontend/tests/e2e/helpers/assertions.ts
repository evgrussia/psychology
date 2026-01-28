import { expect, Page } from '@playwright/test';

/**
 * Custom assertions for E2E tests
 */
export class CustomAssertions {
  /**
   * Assert that page has correct title
   */
  static async assertPageTitle(page: Page, expectedTitle: string | RegExp) {
    await expect(page).toHaveTitle(expectedTitle);
  }

  /**
   * Assert that element is visible and accessible
   */
  static async assertElementVisible(page: Page, selector: string) {
    const element = page.locator(selector);
    await expect(element).toBeVisible();
  }

  /**
   * Assert that element has correct text
   */
  static async assertElementText(page: Page, selector: string, expectedText: string | RegExp) {
    const element = page.locator(selector);
    await expect(element).toHaveText(expectedText);
  }

  /**
   * Assert that URL matches pattern
   */
  static async assertURL(page: Page, urlPattern: string | RegExp) {
    await expect(page).toHaveURL(urlPattern);
  }

  /**
   * Assert that form field has error
   */
  static async assertFormFieldError(page: Page, fieldName: string) {
    const field = page.locator(`[name="${fieldName}"]`);
    const errorMessage = page.locator(`[data-testid="${fieldName}-error"]`);
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await expect(errorMessage).toBeVisible();
  }

  /**
   * Assert that loading state is shown
   */
  static async assertLoadingState(page: Page) {
    const loadingIndicator = page.locator('[data-testid="loading"]');
    await expect(loadingIndicator).toBeVisible();
  }

  /**
   * Assert that success message is shown
   */
  static async assertSuccessMessage(page: Page, message?: string) {
    const successMessage = page.locator('[data-testid="success-message"]');
    await expect(successMessage).toBeVisible();
    if (message) {
      await expect(successMessage).toContainText(message);
    }
  }

  /**
   * Assert that error message is shown
   */
  static async assertErrorMessage(page: Page, message?: string) {
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    if (message) {
      await expect(errorMessage).toContainText(message);
    }
  }

  /**
   * Assert accessibility: element is keyboard accessible
   */
  static async assertKeyboardAccessible(page: Page, selector: string) {
    const element = page.locator(selector);
    await element.focus();
    await expect(element).toBeFocused();
  }

  /**
   * Assert that page has skip link
   */
  static async assertSkipLink(page: Page) {
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeVisible();
  }
}
