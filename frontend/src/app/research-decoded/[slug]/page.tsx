import React from 'react';
import { Metadata } from 'next';
import ResearchDecodedClient from './ResearchDecodedClient';
import { papers } from '../generatedData';

export const revalidate = 3600; // rebuild at most once per hour

export async function generateStaticParams() {
  return Object.keys(papers).map((slug) => ({
    slug: slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const paper = papers[params.slug as keyof typeof papers];
  
  if (!paper) {
    return {
      title: 'Paper Not Found',
      robots: {
        index: false,
        follow: false,
      }
    };
  }

  const title = paper.title;
  const rawIntro = paper.intro.trim();
  
  // Truncate at the end of a sentence if possible within 160 chars
  // Look for the last period, question mark, or exclamation mark within the limit
  let description = rawIntro;
  if (description.length > 160) {
    const truncated = description.substring(0, 160);
    const lastSentenceEnd = Math.max(
      truncated.lastIndexOf('. '),
      truncated.lastIndexOf('? '),
      truncated.lastIndexOf('! ')
    );
    
    if (lastSentenceEnd > 60) { // Only truncate at sentence if it leaves enough text
      description = truncated.substring(0, lastSentenceEnd + 1);
    } else {
      // Fallback: truncate at word boundary
      description = truncated.split(' ').slice(0, -1).join(' ') + '...';
    }
  }

  const keywords = [
    paper.title,
    paper.authors,
    'research decoded',
    'AI research',
    'technical summary',
    'EulerFold'
  ].join(', ');

  return {
    title: title,
    description: description,
    keywords: keywords,
    authors: [{ name: paper.authors }],
    openGraph: {
      title: title,
      description: description,
      type: 'article',
      url: `https://www.eulerfold.com/research-decoded/${params.slug}`,
      siteName: 'EulerFold',
      images: paper.heroImage ? [{ url: paper.heroImage }] : [],
      publishedTime: "2026-03-27T00:00:00Z", // Default base date for the series
      authors: [paper.authors],
    },
    twitter: {
      card: paper.heroImage ? 'summary_large_image' : 'summary',
      title: title,
      description: description,
      creator: '@eulerfold',
      images: paper.heroImage ? [paper.heroImage] : [],
    },
    alternates: {
      canonical: `https://www.eulerfold.com/research-decoded/${params.slug}`,
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

  // Same description logic for schema
  const rawIntro = paper.intro.trim();
  let schemaDescription = rawIntro;
  if (schemaDescription.length > 160) {
    const truncated = schemaDescription.substring(0, 160);
    const lastSentenceEnd = Math.max(
      truncated.lastIndexOf('. '),
      truncated.lastIndexOf('? '),
      truncated.lastIndexOf('! ')
    );
    if (lastSentenceEnd > 60) {
      schemaDescription = truncated.substring(0, lastSentenceEnd + 1);
    } else {
      schemaDescription = truncated.split(' ').slice(0, -1).join(' ') + '...';
    }
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": paper.title,
    "description": schemaDescription,
    "image": paper.heroImage ? [paper.heroImage] : [],
    "author": [
      {
        "@type": "Organization",
        "name": "EulerFold",
        "url": "https://www.eulerfold.com"
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
        "url": "https://www.eulerfold.com/android-chrome-512x512.png"
      }
    },
    "datePublished": "2026-03-27T00:00:00Z", 
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.eulerfold.com/research-decoded/${slug}`
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
        "name": "Research Decoded",
        "item": "https://www.eulerfold.com/research-decoded"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": paper.title,
        "item": `https://www.eulerfold.com/research-decoded/${slug}`
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
