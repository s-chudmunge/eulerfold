import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import { articles } from './generatedArticles';

export const metadata: Metadata = {
  title: 'Articles and Breakdowns - EulerFold',
  description: 'Deep dives into technical terms and concepts decoded for you. Master the fundamentals of AI, research, and modern engineering.',
  alternates: {
    canonical: 'https://www.eulerfold.com/articles',
  }
};

import ArticlesIndexClient from './ArticlesIndexClient';
import PagePreloader from '@/components/PagePreloader';

export default function ArticlesIndexPage() {
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
        "name": "Articles",
        "item": "https://www.eulerfold.com/articles"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ArticlesIndexClient articles={articles} />
      <PagePreloader />
    </>
  );
}
