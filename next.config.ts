import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Don't fail build on ESLint errors during production builds
    // Run `npm run lint` separately to check for linting issues
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'equalityvanguard.org',
        pathname: '/images/**',
      },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'x-vercel-toolbar',
            value: '0',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // CSP is set in src/middleware.ts to avoid duplicate headers
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/webhooks/:path*',
        destination: '/api/webhooks/:path*',
      },
    ];
  },
};

export default nextConfig;
