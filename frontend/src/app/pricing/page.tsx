import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import PricingClient from './PricingClient';
import UserNav from '@/components/UserNav';

export const metadata: Metadata = {
  title: 'Pricing & Credits',
  description: 'Unlock premium AI roadmaps and advanced technical study paths with EulerFold credits. Choose the plan that fits your learning pace.',
  keywords: 'pricing, EulerFold credits, AI roadmaps, technical mastery, premium learning',
  openGraph: {
    title: 'Pricing & Credits',
    description: 'Unlock premium AI roadmaps and advanced technical study paths with EulerFold credits.',
    type: 'website',
    url: 'https://www.eulerfold.com/pricing',
    siteName: 'EulerFold',
  },
  twitter: {
    card: 'summary',
    title: 'Pricing & Credits',
    description: 'Unlock premium AI roadmaps and advanced technical study paths with EulerFold credits.',
    creator: '@eulerfold',
  },
  alternates: {
    canonical: 'https://www.eulerfold.com/pricing',
  },
};

export default function PricingPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.eulerfold.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Pricing",
        "item": "https://www.eulerfold.com/pricing"
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <header className="inconsolata-ui border-b border-border bg-header h-[48px] shrink-0 z-50 sticky top-0 inset-x-0">
          <div className="w-full px-4 md:px-6 flex h-full items-center justify-between">
              <div className="flex items-center gap-2 md:gap-4">
                  <Link className="flex items-center group shrink-0" href="/dashboard" aria-label="Dashboard">
                      <img src="/apple-touch-icon.png" alt="EulerFold" className="w-7 h-7 group-hover:opacity-80 transition-opacity" />
                  </Link>
              </div>
              <div className="flex items-center gap-4">
                  <UserNav />
              </div>
          </div>
      </header>
      <main className="flex-grow min-w-0 bg-background scroll-smooth">
        <div className="max-w-[1000px] mx-auto px-6 py-10 md:py-16">
          <PricingClient />
        </div>
      </main>
    </div>
  );
}
