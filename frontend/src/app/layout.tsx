import type { Metadata } from "next/types";
import "./globals.css";
import Script from 'next/script';
// import { Inter, Inconsolata, Manrope } from 'next/font/google';
import BannerWrapper from '@/components/BannerWrapper';
import AuthProvider from '@/components/AuthProvider';
import QueryProvider from '@/app/providers/QueryProvider';
import SessionTracker from '@/components/SessionTracker';
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = { variable: '--font-inter', className: 'font-inter' };

const inconsolata = { variable: '--font-mono', className: 'font-mono' };

const manrope = { variable: '--font-sans', className: 'font-sans' };

export const metadata: Metadata = {
  applicationName: 'EulerFold',
  title: {
    default: 'EulerFold',
    template: '%s - EulerFold'
  },
  description: 'Clear learning paths with simple progress tracking that show exactly what you’ve learned and keep you on-track.',
  keywords: [
    'master real skills',
    'Gain skills',
    'prove your skills',
    'technical roadmaps',
    'skill tracking',
    'progress tracking',
    'interactive course player',
    'practice and view questions',
    'personalized learning path',
    'online study planner',
    'GATE preparation',
    'UPSC study guide',
    'AWS certification path',
    'skill development',
    'career advancement',
    'adaptive learning',
    'student accountability',
    'learn by doing',
    'hands-on learning',
    'project-based learning',
    'real-world projects',
    'skill assessment',
    'career roadmap',
    'learning dashboard',
    'study progress analytics',
    'goal-based learning',
    'self-paced courses',
    'structured learning path',
    'exam preparation platform',
    'mock tests',
    'quiz practice',
    'coding practice platform',
    'technical interview prep',
    'job-ready skills',
    'industry-relevant skills',
    'guided learning',
    'learning milestones',
    'performance tracking',
    'study planner app',
    'daily study goals',
    'learning streaks',
    'skill certification',
    'upskill platform',
    'reskill programs',
    'online education platform',
    'smart learning system',
    'AI-powered learning',
    'personalized recommendations',
    'study management tool'
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
  url: 'https://www.eulerfold.com',
  siteName: 'EulerFold',
  title: 'EulerFold',
  description: 'Clear learning paths with simple progress tracking that show exactly what you’ve learned and keep you on-track.',
  },
  twitter: {
  card: 'summary',
  title: 'EulerFold',
  description: 'Clear learning paths with simple progress tracking that show exactly what you’ve learned and keep you on track.',
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
              "description": "Clear learning paths with simple progress tracking that show exactly what you’ve learned and keep you on track",
              "sameAs": [
                "https://github.com/s-chudmunge"
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
        className={`${inter.variable} ${inconsolata.variable} ${manrope.variable} antialiased font-sans`}
      >
        <QueryProvider>
          <AuthProvider>
            <SessionTracker />
            <BannerWrapper />
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