const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

/**
 * Content-Security-Policy, built per-phase because dev needs things prod
 * doesn't (Turbopack/webpack HMR eval + the dev server's own WebSocket).
 *
 * Known permissive spots and why (tighten later, don't remove blindly):
 * - script-src 'unsafe-inline': Next.js ships some inline bootstrap scripts
 *   (hydration data, etc.) with no nonce plumbed through yet. A nonce-based
 *   CSP needs per-request middleware wiring the nonce into both the header
 *   and every <Script>/inline tag — worth doing later, not a five-minute fix.
 * - script-src 'unsafe-eval': three.js / @react-three/drei (used by the
 *   MacBook 3D model) and some GSAP plugins can hit Function()/eval() paths
 *   in certain code paths. Removing this needs an actual audit of whether
 *   the specific three.js/GSAP build here ever triggers it in production.
 * - script-src/connect-src https://www.gstatic.com: the Draco geometry
 *   decoder that @react-three/drei's useGLTF pulls in for the compressed
 *   MacBook model (public/models/macbook-transformed.glb) defaults to
 *   loading its decoder from Google's CDN — see the TODO in
 *   src/components/three/MacbookModel.tsx docs / the self-hosting task
 *   this is flagged against.
 * - media-src https://d8j0ntlcm91z4.cloudfront.net: the per-tier plan hero
 *   videos in src/app/(marketing)/plans/[tier]/page.tsx are hosted there
 *   with no local fallback — same third-party-CDN risk as the background
 *   video fallback that was removed, just not fixed yet.
 * - style-src 'unsafe-inline': Tailwind's arbitrary-value classes and
 *   Framer Motion both write inline `style` attributes at runtime.
 */
function buildCsp(isDev) {
  const directives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      'https://www.gstatic.com',
    ],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'img-src': ["'self'", 'data:', 'blob:', 'https:'],
    'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
    'media-src': ["'self'", 'https://d8j0ntlcm91z4.cloudfront.net'],
    'connect-src': ["'self'", 'https://www.gstatic.com', 'https://d8j0ntlcm91z4.cloudfront.net'],
    'worker-src': ["'self'", 'blob:'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-src': ["'none'"],
    'frame-ancestors': ["'none'"],
  };

  if (isDev) {
    // Turbopack/webpack HMR: same-origin WebSocket + eval-based fast refresh.
    directives['connect-src'].push('ws://localhost:*', 'http://localhost:*');
  }

  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Stop leaking implementation details via the X-Powered-By header.
  poweredByHeader: false,

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
module.exports = (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    ...nextConfig,
    distDir: isDev ? '.next-dev' : '.next_dist',

    async headers() {
      const securityHeaders = [
        { key: 'Content-Security-Policy', value: buildCsp(isDev) },
        // No legitimate embed use case for this site — deny framing outright.
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
      ];

      if (!isDev) {
        // Only meaningful over HTTPS — the dev server runs plain HTTP, and
        // browsers ignore this header there anyway, but keep it prod-only
        // for clarity rather than relying on that.
        securityHeaders.push({
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        });
      }

      return [{ source: '/(.*)', headers: securityHeaders }];
    },
  };
};