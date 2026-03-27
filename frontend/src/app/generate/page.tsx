import React, { Suspense } from 'react';
import { Metadata } from 'next';
import GenerateClient from './GenerateClient';

export const metadata: Metadata = {
  title: 'Create Your Learning Roadmap | EulerFold AI',
  description: 'Create a personalized AI-generated learning roadmap for any skill or subject.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function GeneratePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-background dark:bg-[#0f0f0f]">
        <div className="animate-pulse text-teal-700 font-mono text-sm tracking-widest uppercase">Initializing...</div>
      </div>
    }>
      <GenerateClient />
    </Suspense>
  );
}
