import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import { AlreadySignedInMessage, LandingOnboardingTrigger, ScrollToHeroCTA } from './HomeClientComponents';

import HeroSection from '@/components/landing/HeroSection';

import ProductEcosystem from '@/components/landing/ProductEcosystem';
import GenerationSystems from '@/components/landing/GenerationSystems';
import SourcesConstellation from '@/components/landing/SourcesConstellation';
import EarlyResearch from '@/components/landing/EarlyResearch';
import LatestUpdates from '@/components/landing/LatestUpdates';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'EulerFold AI - Build and track your courses',
  description: 'Design dynamic, AI-generated curriculum aligned with the latest technology. Master deep technical skills with interactive courses, curated resources, and comprehensive progress tracking.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.eulerfold.com/',
    title: 'EulerFold AI - Build and track your courses',
    description: 'Design dynamic, AI-generated curriculum aligned with the latest technology. Master deep technical skills with interactive courses, curated resources, and comprehensive progress tracking.',
    siteName: 'EulerFold',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'EulerFold - Intelligent Courses',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EulerFold AI - Build and track your courses',
    description: 'Create structured learning courses, track your progress, and analyze your technical skills.',
    creator: '@eulerfold',
  },
};

// Main landing page component for EulerFold
export default async function LandingPage() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "EulerFold",
    "url": "https://www.eulerfold.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.eulerfold.com/explore?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="min-h-screen text-text-primary flex flex-col font-sans relative overflow-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Suspense fallback={null}>
        <AlreadySignedInMessage />
        <LandingOnboardingTrigger />
      </Suspense>
      <PublicHeader />
      
      <main className="flex-grow">
        <HeroSection />

        <GenerationSystems />

        <SourcesConstellation />

        <ProductEcosystem />
        
        <EarlyResearch />
        
        <LatestUpdates />

        {/* Final CTA Section */}
        <section className="py-20 md:py-32 px-6 bg-transparent relative border-t border-border/30">
          <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
            <div className="max-w-xl space-y-4">
              <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
                Start Learning
              </span>
              <h2 className="text-2xl md:text-[2.25rem] font-bold text-text-heading tracking-tight leading-[1.2]">
                Build your first course today.
              </h2>
              <p className="text-[14px] text-text-muted leading-relaxed max-w-md">
                Mention any technical topic or goal, create a structured curriculum with helpful resources, and master it from first principles.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <ScrollToHeroCTA />
              <Link 
                href="/explore"
                className="inline-flex items-center justify-center gap-2 bg-background border border-border hover:border-accent/40 text-text-heading px-6 py-2.5 rounded-md text-[13px] font-bold transition-all"
              >
                <BookOpen className="w-4 h-4 text-text-muted" /> Browse Library
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
