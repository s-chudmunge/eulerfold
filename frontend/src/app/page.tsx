import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import { AlreadySignedInMessage, LandingOnboardingTrigger } from './HomeClientComponents';
import PagePreloader from '@/components/PagePreloader';

import HeroSection from '@/components/landing/HeroSection';

import ProductEcosystem from '@/components/landing/ProductEcosystem';
import GenerationSystems from '@/components/landing/GenerationSystems';

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
    <div className="min-h-screen bg-background text-text-primary flex flex-col font-sans relative overflow-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Suspense fallback={null}>
        <AlreadySignedInMessage />
        <LandingOnboardingTrigger />
      </Suspense>
      <PagePreloader />
      <PublicHeader />
      
      <main className="flex-grow">
        <HeroSection />

        <GenerationSystems />

        <ProductEcosystem />

        {/* Final CTA Section */}
        <section className="py-20 md:py-32 px-6 bg-background relative overflow-hidden">
          {/* Subtle grid pattern in the background of the section */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
          
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="group relative overflow-hidden rounded-2xl bg-sidebar/50 border border-border backdrop-blur-xl shadow-sm transition-all hover:shadow-md">
              
              {/* Decorative gradient blur */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-50 transition-opacity group-hover:opacity-80"></div>
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/5 rounded-full blur-3xl opacity-50"></div>

              <div className="relative px-6 py-12 sm:p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left">
                <div className="max-w-xl space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-accent">
                      Start Learning
                    </span>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-text-heading tracking-tight leading-tight">
                    Build your first course today.
                  </h2>
                  <p className="text-[15px] text-text-muted leading-relaxed max-w-md">
                    Pick any technical topic, generate a structured curriculum with verified resources, and master it from first principles.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
                  <Link 
                    href="/generate"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-text-heading text-background hover:opacity-90 px-8 py-3.5 rounded-lg text-[14px] font-bold transition-all shadow-sm hover:-translate-y-0.5"
                  >
                    Create Course <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link 
                    href="/explore"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-background border border-border hover:border-accent/40 text-text-heading px-8 py-3.5 rounded-lg text-[14px] font-bold transition-all hover:-translate-y-0.5"
                  >
                    <BookOpen className="w-4 h-4 text-text-muted" /> Browse Library
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
