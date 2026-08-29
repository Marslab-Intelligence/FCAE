const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Compress all responses
  compress: true,

  images: {
    // Serve modern formats (avif → webp → original)
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  experimental: {
    optimizePackageImports: [
      'framer-motion',
      'lucide-react',
      '@gsap/react',
    ],
  },

  // /sign-up is the canonical URL (used everywhere internally); /signup was a
  // byte-for-byte duplicate route — redirect instead of serving both, so
  // there's exactly one indexable URL per intent.
  async redirects() {
    return [
      { source: '/signup', destination: '/sign-up', permanent: true },
    ];
  },
}

// `next dev` and `next build` get separate output directories. Sharing one
// distDir means a build run while the dev server is up rewrites the manifests
// under it — the dev server then 404s every route and dies on the next request
// (which surfaces in the browser as `TypeError: Failed to fetch`).
module.exports = (phase) => ({
  ...nextConfig,
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next_dist',
})