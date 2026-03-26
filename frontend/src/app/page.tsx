import React, { Suspense } from 'react';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import ResearchDecodedPreview from '@/components/landing/ResearchDecodedPreview';
import StaticHeroShell from '@/components/landing/StaticHeroShell';

const HomeClient = dynamic(() => import('./HomeClient'), {
  ssr: true, // Keep true for SEO and initial shell compatibility
});

export const metadata: Metadata = {
  description: 'Learn it. Build it. Prove it.',
};

export default function EulerFoldLabsMainPage() {
  return (
    <div className="relative">
      <Suspense fallback={<StaticHeroShell />}>
        <HomeClient researchPreview={<ResearchDecodedPreview />} />
      </Suspense>
    </div>
  );
}
