import React, { Suspense } from 'react';
import type { Metadata } from "next/types";
import "./globals.css";
import Script from 'next/script';
// import { Inter, Inconsolata, Manrope } from 'next/font/google';
import BannerWrapper from '@/components/BannerWrapper';
import AuthProvider from '@/components/AuthProvider';
import { SettingsProvider } from '@/components/SettingsProvider';
import QueryProvider from '@/app/providers/QueryProvider';
import SessionTracker from '@/components/SessionTracker';
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import dynamic from 'next/dynamic';
import HeroBackground from '@/components/HeroBackground';

const SettingsModal = dynamic(() => import('@/components/SettingsModal'), { ssr: false });
const PomodoroCompletionModal = dynamic(() => import('@/components/grove/PomodoroCompletionModal'), { ssr: false });

import { Familjen_Grotesk } from 'next/font/google';

const familjen = Familjen_Grotesk({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const inter = { variable: '--font-inter', className: 'font-inter' };
const inconsolata = { variable: '--font-mono', className: 'font-mono' };

export const metadata: Metadata = {
  applicationName: 'EulerFold AI',
  title: {
    default: 'EulerFold AI - A free agentic tool to build, structure, and track your learning',
    template: '%s'
  },
  description: 'Tell us what you want to learn. Our free agentic system builds your study path using lectures from top educators, university notes, and research papers, tracking your progress every step of the way.',
  keywords: [
    'free ai courses',
    'free online courses',
    'free technical courses',
    'free ai learning tool',
    'free ai roadmap generator',
    'free ai course builder',
    'free learning resources',
    'free online study paths',
    'free computer science courses',
    'free ai study planner',
    'technical roadmaps',
    'learning paths',
    'skill tracking',
    'study planner',
    'research papers decoded',
    'syllabus to roadmap',
    'job description to learning path',
    'structured learning',
    'self-directed learning'
  ],
  authors: [{ name: 'EulerFold' }],
  creator: 'EulerFold',
  publisher: 'EulerFold',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.eulerfold.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'EulerFold AI',
    title: 'EulerFold AI - A free agentic tool to build, structure, and track your learning',
    description: 'Tell us what you want to learn. Our free agentic system builds your study path using lectures from top educators, university notes, and research papers, tracking your progress every step of the way.',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'EulerFold AI',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EulerFold AI - A free agentic tool to build, structure, and track your learning',
    description: 'Tell us what you want to learn. Our free agentic system builds your study path using lectures from top educators, university notes, and research papers, tracking your progress every step of the way.',
    images: ['/og-image.png'],
    creator: '@eulerfold',
    site: '@eulerfold',
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

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('eulerfold-theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
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
              "name": "EulerFold",
              "url": "https://www.eulerfold.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.eulerfold.com/android-chrome-512x512.png",
                "width": 512,
                "height": 512
              },
              "description": "Tell us what you want to learn. Our free AI tool builds your study path using lectures from top educators, university notes, and research papers, tracking your progress every step of the way.",
              "sameAs": [
                "https://x.com/eulerfold",
                "https://www.instagram.com/eulerfold"
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
                "name": "Learning Paths",
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
                    "description": "Master new languages with structured courses"
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
              "url": "https://www.eulerfold.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.eulerfold.com/explore?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${inconsolata.variable} ${familjen.variable} antialiased font-sans`}
      >
        <HeroBackground />
        <QueryProvider>
          <AuthProvider>
            <SettingsProvider>
                <Suspense fallback={null}>
                  <SessionTracker />
                </Suspense>
                <BannerWrapper />
                <main>
                  {children}
                </main>
                <SettingsModal />
                <PomodoroCompletionModal />
                <Analytics />
                <SpeedInsights />
            </SettingsProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}