import type { NextConfig } from 'next'

// Frontend-only demo: fully static export (SSG). Listing photos are hot-linked from the source CDN.
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
}

export default nextConfig
