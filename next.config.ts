import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    // Don't fail build on ESLint errors during production builds
    // Run `npm run lint` separately to check for linting issues
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don't fail build on TypeScript errors during production builds
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Disable Next.js image optimization to avoid Vercel 503 errors
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'equalityvanguard.org',
        pathname: '/images/**',
      },
      // R2/S3 image domain (Cloudflare R2 or AWS S3)
      {
        protocol: 'https',
        hostname: '*.r2.dev',
        pathname: '/**',
      },
      // Localhost for development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
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
  // Removed redundant rewrite - it was a no-op (same source and destination)
  // If webhook routing is needed, configure it properly in vercel.json or middleware
};

export default nextConfig;
