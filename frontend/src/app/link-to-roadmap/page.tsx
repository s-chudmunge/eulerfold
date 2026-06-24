import React, { Suspense } from 'react';
import { Metadata } from 'next';
import LinkToRoadmapClient from './LinkToRoadmapClient';

export const metadata: Metadata = {
  title: 'Deconstruct URL to Roadmap | EulerFold AI',
  description: 'Learn tech directly from the source. Paste a link to a GitHub repository, technical blog, or documentation. Our AI engine will read it and build a curriculum to teach you exactly how it works.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.eulerfold.com/link-to-roadmap',
    title: 'Deconstruct URL to Roadmap | EulerFold AI',
    description: 'Learn tech directly from the source. Paste a link to a GitHub repository, technical blog, or documentation. Our AI engine will read it and build a curriculum to teach you exactly how it works.',
    siteName: 'EulerFold',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'EulerFold - URL to Roadmap',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Deconstruct URL to Roadmap | EulerFold AI',
    description: 'Turn any technical link into an interactive learning curriculum.',
    creator: '@eulerfold',
  },
};

export default function LinkToRoadmapPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-background dark:bg-[#0f0f0f]">
        <div className="animate-pulse text-indigo-500 font-mono text-sm tracking-widest uppercase">Initializing...</div>
      </div>
    }>
      <LinkToRoadmapClient />
    </Suspense>
  );
}
