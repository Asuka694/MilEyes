/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false
    }
    return config
  },
  images: {
    domains: [ "gateway.pinata.cloud", "youtube.com" ]
  }
}

module.exports = nextConfig
