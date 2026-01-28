import { Page } from '@playwright/test';

/**
 * A11y helper for E2E tests using axe-core
 */
export class A11yHelper {
  /**
   * Inject axe-core into the page
   */
  static async injectAxe(page: Page) {
    await page.addInitScript(() => {
      // Inject axe-core from CDN
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/axe-core@4.9.0/axe.min.js';
      document.head.appendChild(script);
    });
    // Wait for axe to be loaded
    await page.waitForFunction(() => (window as any).axe !== undefined, { timeout: 5000 });
  }

  /**
   * Run axe accessibility check on the page
   * Returns violations array
   */
  static async runAxeCheck(page: Page): Promise<any[]> {
    await this.injectAxe(page);
    
    const violations = await page.evaluate(async () => {
      const axe = (window as any).axe;
      if (!axe) {
        throw new Error('axe-core not loaded');
      }
      
      const results = await axe.run({
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'],
        },
      });
      
      return results.violations;
    });
    
    return violations;
  }

  /**
   * Assert that page has no critical accessibility violations
   * WCAG 2.2 AA compliance check
   */
  static async assertNoA11yViolations(page: Page, maxViolations: number = 0) {
    const violations = await this.runAxeCheck(page);
    
    if (violations.length > maxViolations) {
      const violationMessages = violations.map((v: any) => {
        return `\n- ${v.id}: ${v.description}\n  Impact: ${v.impact}\n  Nodes: ${v.nodes.length}`;
      }).join('\n');
      
      throw new Error(
        `Found ${violations.length} accessibility violations (max allowed: ${maxViolations}):${violationMessages}`
      );
    }
  }

  /**
   * Get accessibility compliance percentage
   * Returns percentage (0-100)
   */
  static async getCompliancePercentage(page: Page): Promise<number> {
    const violations = await this.runAxeCheck(page);
    
    // Calculate compliance: 100% - (violations * penalty)
    // Critical violations (impact: critical, serious) have higher penalty
    let penalty = 0;
    violations.forEach((v: any) => {
      if (v.impact === 'critical' || v.impact === 'serious') {
        penalty += 5; // 5% per critical/serious violation
      } else {
        penalty += 1; // 1% per minor violation
      }
    });
    
    return Math.max(0, 100 - penalty);
  }

  /**
   * Assert that page meets WCAG 2.2 AA compliance (≥95%)
   */
  static async assertWCAG22AACompliance(page: Page) {
    const compliance = await this.getCompliancePercentage(page);
    
    if (compliance < 95) {
      const violations = await this.runAxeCheck(page);
      throw new Error(
        `Page does not meet WCAG 2.2 AA compliance. Compliance: ${compliance.toFixed(2)}% (required: ≥95%). ` +
        `Found ${violations.length} violations.`
      );
    }
  }

  /**
   * Check keyboard navigation
   */
  static async checkKeyboardNavigation(page: Page) {
    // Check if skip link exists
    const skipLink = page.locator('a[href="#main-content"], a[href="#main"]');
    const hasSkipLink = await skipLink.count() > 0;
    
    if (!hasSkipLink) {
      throw new Error('Skip link not found. Pages should have a skip link for keyboard navigation.');
    }
    
    // Check focus visibility
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    const isFocused = await focusedElement.count() > 0;
    
    if (!isFocused) {
      throw new Error('No focusable elements found. Page should be keyboard navigable.');
    }
    
    // Check focus indicator visibility
    const focusStyle = await focusedElement.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        outlineStyle: styles.outlineStyle,
      };
    });
    
    if (focusStyle.outlineWidth === '0px' && focusStyle.outlineStyle === 'none') {
      throw new Error('Focus indicator not visible. Elements should have visible focus indicators.');
    }
  }

  /**
   * Check color contrast (basic check)
   */
  static async checkColorContrast(page: Page) {
    const violations = await this.runAxeCheck(page);
    
    const contrastViolations = violations.filter((v: any) => 
      v.id === 'color-contrast' || v.id === 'color-contrast-enhanced'
    );
    
    if (contrastViolations.length > 0) {
      throw new Error(
        `Found ${contrastViolations.length} color contrast violations. ` +
        `Text should have contrast ratio ≥4.5:1 (normal text) or ≥3:1 (large text).`
      );
    }
  }
}
