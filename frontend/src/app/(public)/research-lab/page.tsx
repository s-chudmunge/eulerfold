import React from 'react';
import { Metadata } from 'next';
import ResearchLabClient from './ResearchLabClient';

export const metadata: Metadata = {
  title: 'Research Paper Decoder to Blueprint | EulerFold AI',
  description: 'Paste any academic paper, arXiv link, or research PDF. Our AI breaks down complex scientific concepts into a simple, step-by-step technical blueprint and learning curriculum.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.eulerfold.com/research-lab',
    title: 'Research Paper Decoder to Blueprint | EulerFold AI',
    description: 'Paste any academic paper, arXiv link, or research PDF. Our AI breaks down complex scientific concepts into a simple, step-by-step technical blueprint and learning curriculum.',
    siteName: 'EulerFold',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'EulerFold - Research Paper Decoder',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Research Paper Decoder to Blueprint | EulerFold AI',
    description: 'Convert complex academic papers into simple technical blueprints.',
    creator: '@eulerfold',
  },
};

export default function ResearchLabPage() {
  return (
    <div className="min-h-screen bg-background">
      <ResearchLabClient />
    </div>
  );
}
