/**
 * Pa11y runner script for accessibility testing
 * Run: node tests/a11y/pa11y-runner.js
 */

const pa11y = require('pa11y');
const config = require('./pa11y.config.js');

async function runPa11y() {
  const results = [];

  for (const testConfig of config.urls) {
    console.log(`Testing: ${testConfig.name} (${testConfig.url})`);

    try {
      const result = await pa11y(testConfig.url, {
        ...config.defaults,
        ...testConfig.options,
      });

      results.push({
        name: testConfig.name,
        url: testConfig.url,
        issues: result.issues,
        documentTitle: result.documentTitle,
        pageUrl: result.pageUrl,
      });

      // Print summary
      const errorCount = result.issues.filter((i) => i.type === 'error').length;
      const warningCount = result.issues.filter((i) => i.type === 'warning').length;
      const noticeCount = result.issues.filter((i) => i.type === 'notice').length;

      console.log(`  Errors: ${errorCount}, Warnings: ${warningCount}, Notices: ${noticeCount}`);

      if (errorCount > 0) {
        console.log('  Errors:');
        result.issues
          .filter((i) => i.type === 'error')
          .forEach((issue) => {
            console.log(`    - ${issue.message} (${issue.code})`);
          });
      }
    } catch (error) {
      console.error(`Error testing ${testConfig.name}:`, error.message);
      results.push({
        name: testConfig.name,
        url: testConfig.url,
        error: error.message,
      });
    }
  }

  // Summary
  const totalErrors = results.reduce(
    (sum, r) => sum + (r.issues ? r.issues.filter((i) => i.type === 'error').length : 0),
    0
  );
  const totalWarnings = results.reduce(
    (sum, r) => sum + (r.issues ? r.issues.filter((i) => i.type === 'warning').length : 0),
    0
  );

  console.log('\n=== Summary ===');
  console.log(`Total Errors: ${totalErrors}`);
  console.log(`Total Warnings: ${totalWarnings}`);

  // Calculate compliance percentage
  // For WCAG 2.2 AA, we need ≥95% compliance
  const totalIssues = totalErrors + totalWarnings;
  const complianceRate = totalIssues === 0 ? 100 : Math.max(0, 100 - (totalErrors * 10 + totalWarnings * 2));

  console.log(`Compliance Rate: ${complianceRate.toFixed(2)}%`);
  console.log(`Target: ≥95%`);

  if (complianceRate < 95) {
    console.log('\n⚠️  Compliance rate is below 95%');
    process.exit(1);
  } else {
    console.log('\n✅ Compliance rate meets requirements');
  }

  return results;
}

// Run if called directly
if (require.main === module) {
  runPa11y().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runPa11y };
