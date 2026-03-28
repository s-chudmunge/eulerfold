import React from 'react';
import { Metadata } from 'next';
import ResearchDecodedClient from './ResearchDecodedClient';
import { papers } from '../generatedData';

export async function generateStaticParams() {
  return Object.keys(papers).map((slug) => ({
    slug: slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const paper = papers[params.slug as keyof typeof papers];
  
  if (!paper) {
    return {
      title: 'Paper Not Found | Research Decoded',
    };
  }

  const title = paper.title + ' | Research Decoded';
  const description = paper.intro.substring(0, 160) + '...';

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: `https://eulerfold.com/research-decoded/${params.slug}`,
      type: 'article',
      images: paper.heroImage ? [{ url: paper.heroImage }] : [],
    },
    twitter: {
      card: paper.heroImage ? 'summary_large_image' : 'summary',
      title: title,
      description: description,
      images: paper.heroImage ? [paper.heroImage] : [],
    },
    alternates: {
      canonical: `/research-decoded/${params.slug}`,
    }
  };
}

export default function ResearchDecodedPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const paper = papers[slug as keyof typeof papers];

  if (!paper) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="manrope-body text-gray-500 italic">Paper not found. We are still decoding this one.</p>
      </div>
    );
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": paper.title,
    "description": paper.intro.substring(0, 160) + '...',
    "image": paper.heroImage ? [paper.heroImage] : [],
    "author": [
      {
        "@type": "Person",
        "name": "EulerFold",
        "url": "https://eulerfold.com"
      },
      {
        "@type": "Person",
        "name": paper.authors
      }
    ],
    "publisher": {
      "@type": "Organization",
      "name": "EulerFold",
      "logo": {
        "@type": "ImageObject",
        "url": "https://eulerfold.com/android-chrome-512x512.png"
      }
    },
    "datePublished": "2026-03-27T00:00:00Z", // Base date for decoded papers
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://eulerfold.com/research-decoded/${slug}`
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
        "item": "https://eulerfold.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Research Decoded",
        "item": "https://eulerfold.com/research-decoded"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": paper.title,
        "item": `https://eulerfold.com/research-decoded/${slug}`
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
      <ResearchDecodedClient paper={paper} slug={slug} papers={papers} />
    </>
  );
}
