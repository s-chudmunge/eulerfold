import React from 'react';
import { Metadata } from 'next';
import LearnClient from './LearnClient';

export const metadata: Metadata = {
  title: 'Learning Hub',
  description: 'Explore foundational research paper breakthroughs, global competitive exam archives, and community-built learning roadmaps.',
  alternates: {
    canonical: '/learn',
  },
};

export default function LearnPage() {
  return <LearnClient />;
}
