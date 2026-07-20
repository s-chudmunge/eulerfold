import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import { AlreadySignedInMessage, FAQAccordion, LandingOnboardingTrigger } from './HomeClientComponents';
import PagePreloader from '@/components/PagePreloader';

import HeroSection from '@/components/landing/HeroSection';

import PricingSection from '@/components/landing/PricingSection';
import ProductEcosystem from '@/components/landing/ProductEcosystem';
import GenerationSystems from '@/components/landing/GenerationSystems';
import RoadmapDiscovery from '@/components/landing/RoadmapDiscovery';
import CertificationSection from '@/components/landing/CertificationSection';

import { ExploreRoadmap } from '@/lib/api';

export const revalidate = 3600;

async function getFeaturedRoadmaps(): Promise<ExploreRoadmap[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
  try {
    // Fetch a larger pool of popular roadmaps
    const res = await fetch(`${API_URL}/explore?limit=100&sort_by=most_cloned`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const allRoadmaps: ExploreRoadmap[] = await res.json();

    // Prioritize roadmaps by eulerfold (official)
    const eulerfoldRoadmaps = allRoadmaps.filter(r => r.username === 'eulerfold' || r.author.toLowerCase() === 'eulerfold');
    const otherRoadmaps = allRoadmaps.filter(r => r.username !== 'eulerfold' && r.author.toLowerCase() !== 'eulerfold');

    // Combine: all available eulerfold ones (up to 4) + top popular others to fill 6 slots
    const selected = [
      ...eulerfoldRoadmaps.slice(0, 4),
      ...otherRoadmaps.slice(0, 6 - Math.min(4, eulerfoldRoadmaps.length))
    ];

    // Shuffle for variety
    return selected.sort(() => Math.random() - 0.5);
  } catch (error) {
    console.error("Error fetching featured roadmaps:", error);
    return [];
  }
}

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
  const featuredRoadmaps = await getFeaturedRoadmaps();
  const faqItems = [
    {
      question: "How do I get started with a course?",
      answer: (
        <span>
          Browse our <Link href="/explore" className="text-accent hover:underline font-bold">Explore page</Link> to find a course that fits your goals, or generate a custom one based on your specific requirements.
        </span>
      ),
      schemaAnswer: "Browse our Explore page to find a course that fits your goals, or generate a custom one based on your specific requirements."
    },
    {
      question: "What is Research Decoded?",
      answer: (
        <span>
          It's our collection of deep-dive technical articles where we break down complex papers and concepts into first principles. Check out the <Link href="/research-decoded" className="text-accent hover:underline font-bold">latest research here</Link>.
        </span>
      ),
      schemaAnswer: "It's our collection of deep-dive technical articles where we break down complex papers and concepts into first principles."
    },
    {
      question: "How are my technical skills tracked?",
      answer: (
        <span>
          Your <Link href="/dashboard" className="text-accent hover:underline font-bold">Technical Inventory</Link> updates automatically as you complete modules and submit homework. We track your progress across different courses into a unified skill profile.
        </span>
      ),
      schemaAnswer: "Your Technical Inventory updates automatically as you complete modules and submit homework. We track your progress across different courses into a unified skill profile."
    },
    {
      question: "What is 'Homework'?",
      answer: "To ensure actual mastery, you must submit technical proof for modules. These are reviewed by specialized AI models to verify your understanding before you earn skill points.",
      schemaAnswer: "To ensure actual mastery, you must submit technical proof for modules. These are reviewed by specialized AI models to verify your understanding before you earn skill points."
    },
    {
      question: "What makes EulerFold better than a video course?",
      answer: "Videos are passive. EulerFold requires you to practice and prove what you've learned through technical reviews and recall sessions, ensuring the knowledge actually sticks.",
      schemaAnswer: "Videos are passive. EulerFold requires you to practice and prove what you've learned through technical reviews and recall sessions, ensuring the knowledge actually sticks."
    },
    {
      question: "What is Local AI Mode?",
      answer: "Local AI mode runs generation models directly on your device via WebGPU. It ensures complete privacy since no data ever leaves your machine.",
      schemaAnswer: "Local AI mode runs generation models directly on your device via WebGPU. It ensures complete privacy since no data ever leaves your machine."
    },
    {
      question: "How does using my own OpenRouter key help?",
      answer: "By bringing your own API key, you get total flexibility to choose the exact model powering your learning generation. It prevents vendor lock-in, and your key remains completely secure. It is only stored locally in your browser and never touches our servers.",
      schemaAnswer: "By bringing your own API key, you get total flexibility to choose the exact model powering your learning generation. It prevents vendor lock-in, and your key remains completely secure. It is only stored locally in your browser and never touches our servers."
    },
    {
      question: "Do I get a certificate upon completion?",
      answer: "Yes, you receive a verifiable digital certificate once you reach 98% completion on any course. These certificates authenticate your study hours and average technical grade, and can be added directly to your LinkedIn profile with one click.",
      schemaAnswer: "Yes, you receive a verifiable digital certificate once you reach 98% completion on any course. These certificates authenticate your study hours and average technical grade, and can be added directly to your LinkedIn profile with one click."
    }
  ];

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

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.schemaAnswer
      }
    }))
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col font-sans relative overflow-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
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

        <RoadmapDiscovery initialRoadmaps={featuredRoadmaps} />

        <ProductEcosystem />

        <CertificationSection />

        <PricingSection />

        {/* FAQ Section */}
        <section className="py-12 md:py-32 px-6 bg-background border-t border-border/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[11px] font-bold text-accent tracking-[0.2em] uppercase mb-12 md:mb-16 manrope-body text-center">Frequently Asked Questions</h2>
            
            <FAQAccordion 
              items={faqItems}
            />
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 md:py-32 px-6 bg-sidebar/30 border-t border-border/30">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-inter text-2xl md:text-4xl font-bold text-text-heading mb-4 tracking-tight">
              Start Building Your First Course
            </h2>
            <p className="text-text-muted text-[15px] md:text-[17px] manrope-body font-medium mb-8 leading-relaxed">
              Pick a topic, generate a curriculum, and start learning with structure. No account required to explore.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/generate"
                className="inline-flex items-center gap-2 bg-accent text-white hover:bg-teal-700 px-8 py-3 rounded-md text-[14px] font-bold transition-all shadow-sm"
              >
                Generate a Course <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/explore"
                className="inline-flex items-center gap-2 bg-sidebar border border-border text-text-primary px-8 py-3 rounded-md text-[14px] font-bold transition-all hover:bg-sidebar/80"
              >
                <BookOpen className="w-4 h-4" /> Browse Existing Courses
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
