import React from 'react';
import { Metadata } from 'next';
import ResearchDecodedIndexClient from './ResearchDecodedIndexClient';

export const revalidate = 3600; // rebuild at most once per hour

export const metadata: Metadata = {
  title: 'Research Decoded',
  description: 'Foundational technical breakthroughs and academic papers, decoded for humans. Master the fundamentals of AI, distributed systems, and modern engineering.',
  alternates: {
    canonical: '/research-decoded',
  },
};

export default function ResearchDecodedPage() {
  return <ResearchDecodedIndexClient />;
}
