/** @type {import('next').NextConfig} */
const nextConfig = {
  // standalone режим для продакшена (включается автоматически в Docker, где NODE_ENV=production)
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  basePath: '/admin',

  /**
   * Proxy API calls from the admin app to the backend API.
   *
   * This allows client-side fetches like `/api/admin/...` to work in any environment
   * without hardcoding `http://127.0.0.1:3001`.
   */
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';

    return [
      {
        source: '/api/:path*',
        destination: `${apiBase}/:path*`,
      },
    ];
  },
}

module.exports = nextConfig
