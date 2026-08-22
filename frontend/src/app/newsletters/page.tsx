import React from 'react';
import { Metadata } from 'next';
import { newsletters } from './generatedNewsletters';
import NewslettersIndexClient from './NewslettersIndexClient';
import PagePreloader from '@/components/PagePreloader';

export const metadata: Metadata = {
  title: 'Weekly Newsletters - EulerFold',
  description: 'Stay updated with the latest in AI, engineering, and agentic workflows via our weekly newsletter.',
  alternates: {
    canonical: 'https://www.eulerfold.com/newsletters',
  }
};

export default function NewslettersIndexPage() {
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
        "name": "Newsletters",
        "item": "https://www.eulerfold.com/newsletters"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <NewslettersIndexClient newsletters={newsletters} />
      <PagePreloader />
    </>
  );
}
