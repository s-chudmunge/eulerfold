import React from 'react';
import { Metadata } from 'next';
import PricingClient from './PricingClient';

export const metadata: Metadata = {
  title: 'Pricing & Credits',
  description: 'Unlock premium AI roadmaps and advanced technical study paths with EulerFold credits.',
  alternates: {
    canonical: '/pricing',
  },
};

export default function PricingPage() {
  return (
    <main className="flex-1 min-w-0 h-full overflow-y-auto bg-background scroll-smooth">
      <div className="max-w-[700px] mx-auto px-6 py-10 md:py-16">
        <PricingClient />
      </div>
    </main>
  );
}
