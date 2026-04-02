import React from 'react';
import { Metadata } from 'next';
import PricingClient from './PricingClient';

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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main className="flex-1 min-w-0 h-full overflow-y-auto bg-background scroll-smooth">
        <div className="max-w-[700px] mx-auto px-6 py-10 md:py-16">
          <PricingClient />
        </div>
      </main>
    </>
  );
}
