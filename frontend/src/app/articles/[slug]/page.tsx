import React from 'react';
import { Metadata } from 'next';
import ArticleClient from './ArticleClient';
import { articles } from '../generatedArticles';

export const revalidate = 3600;

export async function generateStaticParams() {
  return Object.keys(articles).map((slug) => ({
    slug: slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = articles[params.slug as keyof typeof articles];
  
  if (!article) {
    return {
      title: 'Article Not Found',
      robots: { index: false, follow: false }
    };
  }

  const keywords = [
    article.title,
    article.subject,
    'technical explainer',
    'AI research',
    'engineering breakdown',
    'EulerFold glossary'
  ].join(', ');

  return {
    title: `${article.title} - EulerFold Articles`,
    description: article.excerpt,
    keywords: keywords,
    authors: [{ name: article.author }],
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      url: `https://www.eulerfold.com/articles/${params.slug}`,
      siteName: 'EulerFold',
      images: article.heroImage ? [{ url: article.heroImage }] : [],
      publishedTime: new Date(article.date).toISOString(),
      authors: [article.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: article.heroImage ? [article.heroImage] : [],
      creator: '@eulerfold',
    },
    alternates: {
      canonical: `https://www.eulerfold.com/articles/${params.slug}`,
    }
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = articles[params.slug as keyof typeof articles];

  if (!article) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="manrope-body text-text-muted italic text-xl">Article not found.</p>
      </div>
    );
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt,
    "image": article.heroImage ? [article.heroImage] : [],
    "author": [
      {
        "@type": "Organization",
        "name": "EulerFold",
        "url": "https://www.eulerfold.com"
      },
      {
        "@type": "Person",
        "name": article.author
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
    "datePublished": new Date(article.date).toISOString(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.eulerfold.com/articles/${params.slug}`
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
        "name": "Articles",
        "item": "https://www.eulerfold.com/articles"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title,
        "item": `https://www.eulerfold.com/articles/${params.slug}`
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
      <ArticleClient article={article} />
    </>
  );
}
