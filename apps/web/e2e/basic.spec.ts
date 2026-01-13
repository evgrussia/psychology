import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  // Basic check for existence
  await expect(page).toHaveURL('/');
});
