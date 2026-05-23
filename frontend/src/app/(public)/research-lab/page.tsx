import React from 'react';
import { Metadata } from 'next';
import ResearchLabClient from './ResearchLabClient';

export const metadata: Metadata = {
  title: 'Decode | EulerFold',
  description: 'Detailed analysis of academic papers. Convert complex research into technical breakdowns.',
};

export default function ResearchLabPage() {
  return (
    <div className="min-h-screen bg-background">
      <ResearchLabClient />
    </div>
  );
}
