import type { Metadata } from "next/types";
import "./globals.css";
import Script from 'next/script';
import { Inter } from 'next/font/google';
import Header from '@/components/landing/Header';
import AuthProvider from '@/components/AuthProvider';
import QueryProvider from '@/app/providers/QueryProvider';
import SessionTracker from '@/components/SessionTracker';
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'EulerFold - The World\'s Most Trusted Learning Platform',
    template: '%s - EulerFold'
  },
  description: 'Structured roadmaps, active recall, and project audits that verify what you actually know.',
  keywords: [
    'master real skills',
    'verified skills',
    'proof of work',
    'technical roadmaps',
    'skill tracking',
    'honest progress',
    'interactive course player',
    'active recall questions',
    'personalized learning path',
    'online study planner',
    'GATE preparation',
    'UPSC study guide',
    'AWS certification path',
    'skill development',
    'career advancement',
    'adaptive learning',
    'student accountability'
  ],
  authors: [{ name: 'EulerFold Labs' }],
  creator: 'EulerFold Labs',
  publisher: 'EulerFold Labs',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://eulerfold.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
  type: 'website',
  locale: 'en_US',
  url: 'https://eulerfold.com',
  siteName: 'EulerFold',
  title: 'EulerFold - The World\'s Most Trusted Learning Platform',
  description: 'Master real-world skills and build a verified proof-of-work. This is the ultimate platform to cut through the noise, ship real projects, and land your next role.',
  },
  twitter: {
  card: 'summary',
  title: 'EulerFold - The World\'s Most Trusted Learning Platform',
  description: 'Stop collecting links. Start mastering skills with structured roadmaps and verified proof of work.',
  creator: '@eulerfoldlabs',
  site: '@eulerfoldlabs',
  },  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <html lang="en" suppressHydrationWarning>
      <head>
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="Permissions-Policy" content="geolocation=(), microphone=(), camera=()" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "EulerFold Labs",
              "url": "https://eulerfold.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://eulerfold.com/android-chrome-512x512.png",
                "width": 512,
                "height": 512
              },
              "description": "Personalized AI learning offering free roadmaps across diverse subjects including programming, business, science, and professional skills",
              "sameAs": [
                "https://github.com/mountain-snatcher"
              ],
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "category": "Educational Services"
              },
              "areaServed": "Worldwide",
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Learning Courses",
                "itemListElement": [
                  {
                    "@type": "Course",
                    "name": "Programming & Web Development",
                    "description": "Learn Python, JavaScript, React, and full-stack development"
                  },
                  {
                    "@type": "Course",
                    "name": "Business & Professional Skills", 
                    "description": "Master leadership, project management, and business strategy"
                  },
                  {
                    "@type": "Course",
                    "name": "Science & Mathematics",
                    "description": "Explore physics, chemistry, mathematics, and scientific methods"
                  },
                  {
                    "@type": "Course",
                    "name": "Language Learning",
                    "description": "Master new languages with structured learning paths"
                  }
                ]
              }
            })
          }}
        />
        
        {/* WebSite JSON-LD for Search Console/Sitelinks Search Box */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "EulerFold",
              "url": "https://eulerfold.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://eulerfold.com/explore?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body
        className={`${inter.variable} antialiased font-sans`}
      >
        <QueryProvider>
          <AuthProvider>
            <SessionTracker />
            <Header />
            <main>
              {children}
            </main>
            <Analytics />
            <SpeedInsights />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}