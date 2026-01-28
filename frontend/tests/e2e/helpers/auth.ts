import { Page } from '@playwright/test';
import { ApiHelper } from './api';

/**
 * Authentication helpers for E2E tests
 */
export class AuthHelper {
  private api: ApiHelper;

  constructor(api: ApiHelper) {
    this.api = api;
  }

  /**
   * Login user via API and set token in localStorage
   */
  async loginViaAPI(page: Page, email: string, password: string) {
    const loginResponse = await this.api.loginUser(email, password);
    const accessToken = loginResponse.access;

    // Set token in localStorage
    await page.addInitScript((token) => {
      window.localStorage.setItem('auth_token', token);
      window.localStorage.setItem('auth_refresh_token', 'refresh_token_placeholder');
    }, accessToken);

    return accessToken;
  }

  /**
   * Login user via UI
   */
  async loginViaUI(page: Page, email: string, password: string) {
    await page.goto('/login');
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/cabinet|\/booking/, { timeout: 10000 });
  }

  /**
   * Register user via UI
   */
  async registerViaUI(
    page: Page,
    email: string,
    password: string,
    displayName: string
  ) {
    await page.goto('/register');
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', password);
    await page.fill('[name="display_name"]', displayName);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/cabinet|\/booking/, { timeout: 10000 });
  }

  /**
   * Logout user
   */
  async logout(page: Page) {
    // Clear localStorage
    await page.evaluate(() => {
      window.localStorage.clear();
    });
    await page.goto('/');
  }
}
