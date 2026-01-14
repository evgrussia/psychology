/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@psychology/design-system'],
  // standalone режим для продакшена (включается автоматически в Docker, где NODE_ENV=production и platform=linux)
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
}

module.exports = nextConfig
