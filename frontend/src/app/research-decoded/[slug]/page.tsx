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

  return <ResearchDecodedClient paper={paper} slug={slug} papers={papers} />;
}
