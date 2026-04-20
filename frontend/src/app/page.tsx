import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Plus, GraduationCap, ArrowRight, BookOpen, Target, Zap } from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import { LoginRequiredMessage, AlreadySignedInMessage, FAQAccordion, LandingOnboardingTrigger } from './HomeClientComponents';

import HeroBackground from '@/components/HeroBackground';
import SocialFeed from '@/components/SocialFeed';
import TestimonialSection from '@/components/landing/TestimonialSection';
import PricingSection from '@/components/landing/PricingSection';
import EulerLogoCanvas from '@/components/EulerLogoCanvas';
import { ExploreRoadmap } from '@/lib/api';
import VerifiedBadge from '@/components/VerifiedBadge';
import { getCategory } from '@/lib/roadmapUtils';

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
  title: 'EulerFold - Infrastructure for efficient, structured learning',
  description: 'EulerFold builds personalized learning paths to help you bridge the gap between information and mastery through high-density roadmaps and verifiable audits.',
  keywords: 'learning roadmaps, skill tracking, AI learning paths, technical mastery, structured learning, EulerFold',
  alternates: {
    canonical: 'https://www.eulerfold.com',
  },
  openGraph: {
    title: 'EulerFold - Infrastructure for efficient, structured learning',
    description: 'EulerFold builds personalized learning paths to help you bridge the gap between information and mastery through high-density roadmaps and verifiable audits.',
    url: 'https://www.eulerfold.com',
    siteName: 'EulerFold',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EulerFold - Infrastructure for efficient, structured learning',
    description: 'EulerFold builds personalized learning paths to help you bridge the gap between information and mastery.',
    creator: '@eulerfold',
  },
};

export default async function LandingPage() {
  const featuredRoadmaps = await getFeaturedRoadmaps();
  const faqItems = [
    {
      question: "How accurate are the AI roadmaps?",
      answer: "Our engine doesn't just \"guess.\" It cross-references millions of technical data points and \"Resources We Trust\" to build high-density paths that mirror industry expectations."
    },
    {
      question: "How does the Audit Senate evaluate my work?",
      answer: "Your 'Proof of Work' is evaluated by a three-auditor system: a Technician (for correctness), an Educator (for clarity), and a Relevance Judge (for alignment). This ensures your mastery is verified by multiple perspectives."
    },
    {
      question: "Can I customize my roadmap after it's generated?",
      answer: "Absolutely. While the AI provides a high-signal starting point, you can add, remove, or reorder topics to suit your specific learning style and professional goals."
    },
    {
      question: "What are EulerCoins and how do I earn them?",
      answer: "EulerCoins are the platform's proof-of-progress currency. You earn them by maintaining learning streaks, passing audits, and contributing high-signal insights to the community."
    },
    {
      question: "Is my progress actually saved?",
      answer: "Yes. Every module you finish, every practice session you complete, and every audit you pass is recorded in your global Technical Inventory and skill profile."
    },
    {
      question: "What makes EulerFold better than a video course?",
      answer: "Videos are passive. EulerFold is active. We require \"Proof of Work\" through audits and recall sessions, ensuring you actually master the material rather than just watching it."
    },
    {
      question: "Can I build roadmaps for free?",
      answer: "All new users receive 5 free credits to generate premium AI roadmaps. After that, you can earn more through the community or purchase top-ups."
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
        "text": item.answer
      }
    }))
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col font-sans relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Suspense fallback={null}>
        <LoginRequiredMessage />
        <AlreadySignedInMessage />
        <LandingOnboardingTrigger />
      </Suspense>
      <PublicHeader />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 md:pt-32 md:pb-48 px-6 min-h-[90vh] md:min-h-[95vh] flex items-center overflow-hidden">
          <HeroBackground />
          <div className="max-w-7xl mx-auto w-full relative z-10">
            <div className="max-w-3xl">
              <h1 className="font-inter text-3xl sm:text-4xl md:text-5xl font-semibold text-text-heading mb-6 leading-[1.15] md:leading-[1.1] tracking-tight">
                Infrastructure for <span className="text-accent">efficient</span>,<br className="hidden md:block" /> structured learning
              </h1>
              <p className="text-text-muted text-base md:text-lg manrope-body font-medium mb-10 leading-relaxed max-w-2xl">
                EulerFold builds personalized learning paths to help you bridge the gap between information and mastery.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                <Link 
                  href="/generate"
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-accent text-white px-7 py-3.5 rounded-2xl text-[14px] font-bold transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-accent/30 active:scale-[0.98] gap-3"
                >
                  <Plus className="w-4 h-4" /> Start Your Learning
                </Link>
                <Link 
                  href="/explore"
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-sidebar/80 backdrop-blur-sm border border-border text-text-primary px-7 py-3.5 rounded-2xl text-[14px] font-bold transition-all hover:scale-[1.02] hover:bg-sidebar active:scale-[0.98] gap-3"
                >
                  <BookOpen className="w-4 h-4" /> Browse Public Roadmaps
                </Link>
              </div>

              <div className="flex items-center gap-2">
                <span className="manrope-body text-[13px] text-text-muted">Already a member?</span>
                <Link href="/login" className="manrope-body text-[13px] font-bold text-accent hover:underline">
                  Sign in to your account
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Roadmaps Section */}
        {featuredRoadmaps.length > 0 && (
          <section className="py-12 md:py-16 px-6 bg-sidebar/10 border-t border-border/30">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                <div className="max-w-2xl">
                  <h2 className="text-[10px] md:text-[11px] font-bold text-accent tracking-[0.2em] uppercase mb-4 manrope-body">Discovery</h2>
                  <h3 className="text-2xl md:text-3xl font-bold text-text-heading leading-tight font-inter">
                    Explore community roadmaps
                  </h3>
                </div>
                <Link 
                  href="/explore" 
                  className="inline-flex items-center gap-2 text-accent font-bold text-[14px] hover:underline underline-offset-4 group"
                >
                  View all roadmaps <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="space-y-1">
                {featuredRoadmaps.map((roadmap) => (
                  <Link 
                    key={roadmap.id} 
                    href={`/roadmap/${roadmap.slug}`}
                    className="group flex items-center justify-between py-3 border-b border-border/40 hover:border-accent transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[15px] font-bold text-text-heading group-hover:text-accent transition-colors truncate">
                        {roadmap.title}
                      </span>
                      {roadmap.username === 'eulerfold' && <VerifiedBadge size={16} className="shrink-0" />}
                      <span className="hidden sm:inline-block text-[10px] font-bold text-text-muted bg-sidebar px-2 py-0.5 rounded uppercase tracking-wider inconsolata-ui opacity-70">
                        {getCategory(roadmap.subject || '')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="hidden md:inline-block text-[11px] font-bold text-text-muted inconsolata-ui uppercase tracking-tight">
                        by @{roadmap.username || roadmap.author}
                      </span>
                      <ArrowRight className="w-4 h-4 text-accent opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <TestimonialSection />

        {/* Features Section with Illustration Background */}
        <section className="relative py-16 md:py-24 px-4 md:px-6">
          <div className="lg:max-w-[60%] mx-auto relative rounded-[32px] md:rounded-[40px] overflow-hidden border border-border bg-sidebar/50 min-h-[480px] md:min-h-[520px] flex items-center shadow-2xl">
    {/* Background Image */}
    <div className="absolute inset-0 z-0">
      <img 
        src="https://images.openai.com/static-rsc-4/x5LW12uiAPJaD8XEiZqvoIbyXHN1RY4Ty_wu9xNZLgKYmC5Qe3BYUq14MLAdFDs5A7LRds8W-_OtsSALtQ-24Y6qZph1ps7MZ1J8pC_navnG0_1LvfHSZcvMGCU1VtnJu1xtZGou-H0AAV_PZysEBBmtHHyZ6zUXWPFFf-G8lT3n90vdJ6d88SVV1hqhTQqK?purpose=fullsize" 
        alt="" 
        className="w-full h-full object-cover opacity-60 dark:opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
    </div>

    <div className="relative z-10 px-6 md:px-16 py-12 md:py-0 max-w-2xl">
      <h2 className="text-[10px] md:text-[11px] font-bold text-accent tracking-[0.2em] uppercase mb-6 manrope-body">Retention based learning Architecture</h2>
      <h3 className="text-2xl md:text-4xl font-bold text-text-heading mb-6 leading-tight font-inter">
        Craft your path with <br className="hidden md:block" />mathematical precision.
      </h3>

              <p className="text-text-muted text-lg manrope-body font-medium leading-relaxed mb-10">
                Traditional education is linear. EulerFold is multi-dimensional. We map your current knowledge against your goals to find the most efficient route to mastery.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-border/50 pt-10">
                <div className="space-y-1">
                  <h4 className="font-bold text-text-heading text-[15px]">Atomic Units</h4>
                  <p className="text-sm text-text-muted manrope-body leading-relaxed">Complex topics broken down into verifiable building blocks.</p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-text-heading text-[15px]">Audits</h4>
                  <p className="text-sm text-text-muted manrope-body leading-relaxed">Verification of your understanding by the Audit Senate.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-24 md:py-40 px-6 relative overflow-hidden border-t border-border/30 bg-sidebar/10">
          {/* Large Background Logo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-[0.15] dark:opacity-[0.1] pointer-events-none select-none">
            <EulerLogoCanvas size={400} rotationSpeed={0.002} />
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-[11px] font-bold text-accent tracking-[0.2em] uppercase mb-8 md:mb-12 manrope-body">Our Mission</h2>

            <div className="relative mb-12 md:mb-16">
              <p className="text-base md:text-xl font-semibold text-text-heading leading-relaxed font-inter tracking-tight max-w-3xl mx-auto mb-6">
                To bridge the gap between information and mastery by building the most effective learning infrastructure for every individual.
              </p>
              <p className="text-sm md:text-base text-text-muted manrope-body font-medium max-w-2xl mx-auto italic opacity-80">
                "We believe Learning with an open mind, curiosity and questions gives the best results."
              </p>
            </div>
            <Link 
              href="/research-decoded" 
              className="inline-flex items-center justify-center bg-accent text-white px-8 py-3.5 rounded-2xl text-[14px] font-bold transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-accent/30 active:scale-[0.98] gap-3"
            >
              Access Research Portal 
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        <PricingSection />

        {/* FAQ Section */}
        <section className="py-20 md:py-32 px-6 bg-background border-t border-border/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[11px] font-bold text-accent tracking-[0.2em] uppercase mb-12 md:mb-16 manrope-body text-center">FAQ(Frequently Asked Questions)</h2>
            
            <FAQAccordion 
              items={faqItems}
            />
          </div>
        </section>

        <SocialFeed />

        {/* Final CTA Section */}
        <section className="py-20 md:py-32 px-4 md:px-6 relative overflow-hidden">
          <div className="lg:max-w-[60%] mx-auto relative rounded-[32px] md:rounded-[40px] overflow-hidden border border-border bg-sidebar/50 min-h-[400px] md:min-h-[450px] flex items-center justify-center shadow-xl">
            {/* Background Illustration */}
            <div className="absolute inset-0 z-0">
              <img 
                src="/images/learning_aesthetic_bg_1.jpg" 
                alt="" 
                className="w-full h-full object-cover opacity-80 dark:opacity-50 transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background/80" />
            </div>

            <div className="max-w-3xl mx-auto text-center relative z-10 px-6 py-12 md:py-0">
              <h2 className="font-inter text-2xl md:text-4xl font-bold text-text-heading mb-4 tracking-tight">
                Build your first roadmap in seconds.
              </h2>
              <p className="manrope-body text-[15px] md:text-[17px] text-text-primary mb-10 max-w-lg mx-auto leading-relaxed font-medium">
                No credit card required. Join thousands of students building their paths on the world's most effective learning platform.
              </p>
              <Link 
                href="/generate"
                className="inline-flex items-center justify-center bg-accent text-white px-9 py-4 rounded-2xl text-[15px] font-bold transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-accent/30 active:scale-[0.98] gap-3 mb-8"
              >
                <Plus className="w-4 h-4" /> Generate My Roadmap
              </Link>

              <div className="flex items-center justify-center gap-2">
                <span className="manrope-body text-[13px] text-text-muted">Already have an account?</span>
                <Link href="/login" className="manrope-body text-[13px] font-bold text-accent hover:underline">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
