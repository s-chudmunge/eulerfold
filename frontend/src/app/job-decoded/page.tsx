import React, { Suspense } from 'react';
import { Metadata } from 'next';
import JobDecodedPageClient from './JobDecodedPageClient';

export const metadata: Metadata = {
  title: 'Job Description to Learning Roadmap | EulerFold AI',
  description: 'Convert job descriptions into structured learning roadmaps. Paste a role\'s requirements, and our AI will extract the exact tech stack and hard skills needed. Get a step-by-step curriculum to learn those missing skills and land the job.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.eulerfold.com/job-decoded',
    title: 'Job Description to Learning Roadmap | EulerFold AI',
    description: 'Convert job descriptions into structured learning roadmaps. Paste a role\'s requirements, and our AI will extract the exact tech stack and hard skills needed. Get a step-by-step curriculum to learn those missing skills and land the job.',
    siteName: 'EulerFold',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'EulerFold - Job Decoded',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Job Description to Learning Roadmap | EulerFold AI',
    description: 'Convert job descriptions into structured learning roadmaps to learn missing skills and land the job.',
    creator: '@eulerfold',
  },
};

export default function JobDecodedPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-background dark:bg-[#0f0f0f]">
        <div className="animate-pulse text-teal-700 font-mono text-sm tracking-widest uppercase">Initializing...</div>
      </div>
    }>
      <JobDecodedPageClient />
    </Suspense>
  );
}
