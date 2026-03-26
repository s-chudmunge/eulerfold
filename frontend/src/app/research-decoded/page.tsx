import React from 'react';
import { Metadata } from 'next';
import ResearchDecodedIndexClient from './ResearchDecodedIndexClient';

export const metadata: Metadata = {
  title: 'Research Decoded',
  description: 'Foundational technical breakthroughs, explained simply.',
};

export default function ResearchDecodedPage() {
  return <ResearchDecodedIndexClient />;
}
