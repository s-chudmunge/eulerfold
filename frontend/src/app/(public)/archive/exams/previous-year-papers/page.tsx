import React from 'react';
// Trigger fresh build
import { Metadata } from 'next';
import ArchiveClient from './ArchiveClient';

export const metadata: Metadata = {
  title: 'Previous Year Papers Archive',
  description: 'Access a curated collection of previous year question papers and detailed solutions for competitive exams like GATE, IMO, IChO, UPSC, and more.',
  alternates: {
    canonical: '/archive/exams/previous-year-papers',
  },
};

export default function ArchivePage() {
  return <ArchiveClient />;
}
