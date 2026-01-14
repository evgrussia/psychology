/** @type {import('next').NextConfig} */
const nextConfig = {
  // standalone режим для продакшена (включается автоматически в Docker, где NODE_ENV=production)
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
}

module.exports = nextConfig
