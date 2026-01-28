/**
 * Pa11y configuration for accessibility testing
 * See: https://pa11y.org/configuration.html
 */

module.exports = {
  // Default settings
  defaults: {
    timeout: 60000,
    wait: 3000,
    chromeLaunchConfig: {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
    ignore: [
      'notice', // Ignore notices (informational)
      'warning', // Ignore warnings (optional)
    ],
    standard: 'WCAG2AA', // WCAG 2.2 AA level
    hideElements: [
      // Hide elements that are not relevant for accessibility testing
      '.ads',
      '.advertisement',
    ],
  },

  // Test URLs
  urls: [
    {
      url: 'http://localhost:3000/',
      name: 'Homepage',
    },
    {
      url: 'http://localhost:3000/login',
      name: 'Login',
    },
    {
      url: 'http://localhost:3000/register',
      name: 'Register',
    },
    {
      url: 'http://localhost:3000/booking',
      name: 'Booking',
    },
    {
      url: 'http://localhost:3000/blog',
      name: 'Blog List',
    },
    {
      url: 'http://localhost:3000/cabinet',
      name: 'Client Cabinet',
    },
    {
      url: 'http://localhost:3000/legal/privacy',
      name: 'Privacy Policy',
    },
  ],
};
