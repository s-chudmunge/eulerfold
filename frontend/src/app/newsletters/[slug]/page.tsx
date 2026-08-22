import React from 'react';
import { Metadata } from 'next';
import { newsletters } from '../generatedNewsletters';
import NewsletterClient from './NewsletterClient';
import PagePreloader from '@/components/PagePreloader';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

export async function generateStaticParams() {
  return Object.keys(newsletters).map((slug) => ({
    slug: slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Await params as required in Next.js 15 for dynamic route parameters
  const resolvedParams = await Promise.resolve(params);
  const newsletter = newsletters[resolvedParams.slug];
  
  if (!newsletter) {
    notFound();
  }

  const keywords = [
    newsletter.title,
    'EulerFold Newsletter',
    'AI Updates',
    'Agentic Workflows'
  ].join(', ');

  return {
    title: `${newsletter.title} - EulerFold Newsletter`,
    description: newsletter.subtitle || `Read the EulerFold weekly newsletter from ${newsletter.date}.`,
    keywords: keywords,
    authors: [{ name: newsletter.author }],
    openGraph: {
      title: newsletter.title,
      description: newsletter.subtitle,
      type: 'article',
      url: `https://www.eulerfold.com/newsletters/${resolvedParams.slug}`,
      siteName: 'EulerFold',
      images: newsletter.hero_image_url ? [{ url: newsletter.hero_image_url }] : [],
      publishedTime: new Date(newsletter.date).toISOString(),
      authors: [newsletter.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: newsletter.title,
      description: newsletter.subtitle,
      images: newsletter.hero_image_url ? [newsletter.hero_image_url] : [],
      creator: '@eulerfold',
    },
    alternates: {
      canonical: `https://www.eulerfold.com/newsletters/${resolvedParams.slug}`,
    }
  };
}

export default async function NewsletterPage({ params }: { params: { slug: string } }) {
  // Await params as required in Next.js 15 for dynamic route parameters
  const resolvedParams = await Promise.resolve(params);
  const newsletter = newsletters[resolvedParams.slug];

  if (!newsletter) {
    notFound();
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": newsletter.title,
    "description": newsletter.subtitle,
    "image": newsletter.hero_image_url ? [newsletter.hero_image_url] : [],
    "author": [
      {
        "@type": "Organization",
        "name": "EulerFold",
        "url": "https://www.eulerfold.com"
      },
      {
        "@type": "Person",
        "name": newsletter.author
      }
    ],
    "publisher": {
      "@type": "Organization",
      "name": "EulerFold",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.eulerfold.com/android-chrome-512x512.png"
      }
    },
    "datePublished": new Date(newsletter.date).toISOString(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.eulerfold.com/newsletters/${resolvedParams.slug}`
    }
  };

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
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": newsletter.title,
        "item": `https://www.eulerfold.com/newsletters/${resolvedParams.slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <NewsletterClient newsletter={{ ...newsletter, slug: resolvedParams.slug }} />
      <PagePreloader />
    </>
  );
}
