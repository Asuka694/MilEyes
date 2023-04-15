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
    domains: [ "gateway.pinata.cloud", "youtube.com", "askul.c.yimg.jp", "www.morinaga.co.jp", "cmb.mypinata.cloud" ]
  }
}

module.exports = nextConfig
