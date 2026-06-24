import React from 'react';
import { Metadata } from 'next';
import PlannerClient from './PlannerClient';

export const metadata: Metadata = {
  title: 'Study Planner | EulerFold AI',
  description: 'Create a dynamic daily schedule from your technical roadmaps. Pick your learning intensity and get an optimized list of tasks to complete each day.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.eulerfold.com/planner',
    title: 'Study Planner | EulerFold AI',
    description: 'Create a dynamic daily schedule from your technical roadmaps. Pick your learning intensity and get an optimized list of tasks to complete each day.',
    siteName: 'EulerFold',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'EulerFold - Study Planner',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Study Planner | EulerFold AI',
    description: 'Organize your learning journey into actionable daily study plans.',
    creator: '@eulerfold',
  },
};

export default function PlannerPage() {
  return <PlannerClient />;
}
