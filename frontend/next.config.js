/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Ignore linting and type errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // SEO and security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options', 
            value: 'DENY',
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
            value: 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=7200',
          },
          {
            key: 'Content-Type',
            value: 'application/xml; charset=utf-8',
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
          {
            key: 'Content-Type',
            value: 'text/plain; charset=utf-8',
          },
        ],
      },
      {
        source: '/site.webmanifest',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000',
          },
          {
            key: 'Content-Type',
            value: 'application/manifest+json; charset=utf-8',
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/wikipedia/commons/thumb/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // transpilePackages to support ESM-only libraries like react-markdown in Next.js
  transpilePackages: ['react-markdown', 'remark-math', 'rehype-katex', 'vfile', 'vfile-message', 'unist-util-stringify-position'],

  // Enhanced SEO with trailing slash normalization
  trailingSlash: false,
  
  // Performance optimizations
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/api/auth/register',
        destination: '/api/auth/register',
      },
      {
        source: '/api/auth/login', 
        destination: '/api/auth/login',
      },
      {
        source: '/api/auth/validate_token',
        destination: '/api/auth/validate_token',
      },
    ];
  },

  // Generate additional sitemaps for better SEO
  async generateBuildId() {
    return `build-${Date.now()}`;
  },
};

module.exports = nextConfig;
