import React, { Suspense } from 'react';
import { Metadata } from 'next';
import SyllabusToRoadmapClient from './SyllabusToRoadmapClient';

export const metadata: Metadata = {
  title: 'Syllabus Parser to Interactive Course | EulerFold AI',
  description: 'Turn static syllabi into interactive courses. Paste a list of topics from a college class or textbook. We will automatically break it down, find the best resources, and build an interactive learning path.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.eulerfold.com/syllabus-to-roadmap',
    title: 'Syllabus Parser to Interactive Course | EulerFold AI',
    description: 'Turn static syllabi into interactive courses. Paste a list of topics from a college class or textbook. We will automatically break it down, find the best resources, and build an interactive learning path.',
    siteName: 'EulerFold',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'EulerFold - Syllabus Parser',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Syllabus Parser to Interactive Course | EulerFold AI',
    description: 'Convert textbook chapters or university syllabi into interactive roadmaps.',
    creator: '@eulerfold',
  },
};

export default function SyllabusToRoadmapPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-background dark:bg-[#0f0f0f]">
        <div className="animate-pulse text-amber-500 font-mono text-sm tracking-widest uppercase">Initializing...</div>
      </div>
    }>
      <SyllabusToRoadmapClient />
    </Suspense>
  );
}
