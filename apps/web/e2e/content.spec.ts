import { test, expect } from '@playwright/test';

test.describe('Content Management E2E', () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
  const adminUrl = process.env.ADMIN_URL || 'http://localhost:3001';

  test('should create article in admin → publish → view on public blog', async ({ page, request }) => {
    // This is a simplified E2E test that tests the critical path
    // In a real scenario, you'd need authentication setup

    const slug = `e2e-test-article-${Date.now()}`;
    const articleTitle = `E2E Test Article ${Date.now()}`;

    // Step 1: Create content via API (simulating admin action)
    const createResponse = await request.post(`${apiUrl}/admin/content`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token', // In real scenario, use proper auth
      },
      data: {
        contentType: 'article',
        slug,
        title: articleTitle,
        bodyMarkdown: '# Test Article\n\nДисклеймер: это не диагноз.\n\nThis is a test article for E2E testing.',
        excerpt: 'Test excerpt for E2E',
      },
    });

    // Skip if auth is not set up (for CI/CD)
    if (createResponse.status() === 401) {
      test.skip();
      return;
    }

    expect(createResponse.ok()).toBeTruthy();
    const created = await createResponse.json();
    expect(created.slug).toBe(slug);
    expect(created.status).toBe('draft');

    // Step 2: Publish via API
    const publishResponse = await request.post(`${apiUrl}/admin/content/${created.id}/publish`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      data: {
        qaChecklist: {
          hasDisclaimer: true,
          isToneGentle: true,
          hasTryNowBlock: true,
          hasCTA: true,
          hasInternalLinks: true,
          hasAltTexts: true,
          spellCheckDone: true,
        },
      },
    });

    expect(publishResponse.ok()).toBeTruthy();
    const published = await publishResponse.json();
    expect(published.status).toBe('published');

    // Step 3: Verify public API returns the content
    const publicResponse = await request.get(`${apiUrl}/public/content/article/${slug}`);
    expect(publicResponse.ok()).toBeTruthy();
    const publicContent = await publicResponse.json();
    expect(publicContent.title).toBe(articleTitle);
    expect(publicContent.body_markdown).toContain('Дисклеймер');

    // Step 4: Verify blog list includes the article
    const listResponse = await request.get(`${apiUrl}/public/content/article`);
    expect(listResponse.ok()).toBeTruthy();
    const list = await listResponse.json();
    const found = list.items.find((item: any) => item.slug === slug);
    expect(found).toBeDefined();
    expect(found.title).toBe(articleTitle);

    // Step 5: Verify public page renders correctly
    await page.goto(`/blog/${slug}`);
    await expect(page).toHaveTitle(new RegExp(articleTitle));
    await expect(page.locator('h1')).toContainText(articleTitle);
    await expect(page.locator('body')).toContainText('Дисклеймер');
  });

  test('should show blog list page', async ({ page }) => {
    await page.goto('/blog');
    await expect(page).toHaveTitle(/Блог/);
    
    // Check that page loads (even if empty)
    const heading = page.locator('h1');
    await expect(heading).toContainText('Блог');
  });

  test('should show resources list page', async ({ page }) => {
    await page.goto('/resources');
    await expect(page).toHaveTitle(/Полезные ресурсы/);
    
    // Check that page loads (even if empty)
    const heading = page.locator('h1');
    await expect(heading).toContainText('Полезные ресурсы');
  });

  test('should show glossary list page', async ({ page }) => {
    await page.goto('/glossary');
    await expect(page).toHaveTitle(/Словарь/);

    const heading = page.locator('h1');
    await expect(heading).toContainText('Словарь');
  });

  test('should open glossary term page when available', async ({ page, request }) => {
    const glossaryResponse = await request.get(`${apiUrl}/public/glossary`);
    if (!glossaryResponse.ok()) {
      test.skip();
      return;
    }

    const glossary = await glossaryResponse.json();
    if (!Array.isArray(glossary) || glossary.length === 0) {
      test.skip();
      return;
    }

    const term = glossary[0];
    await page.goto(`/glossary/${term.slug}`);
    await expect(page.locator('h1')).toContainText(term.title);
  });
});
