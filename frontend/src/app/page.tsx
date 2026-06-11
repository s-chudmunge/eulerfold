import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Plus, GraduationCap, ArrowRight, BookOpen, Target, Zap } from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import { LoginRequiredMessage, AlreadySignedInMessage, FAQAccordion, LandingOnboardingTrigger } from './HomeClientComponents';

import HeroSection from '@/components/landing/HeroSection';
import SocialFeed from '@/components/SocialFeed';
import TestimonialSection from '@/components/landing/TestimonialSection';
import PricingSection from '@/components/landing/PricingSection';
import ProductEcosystem from '@/components/landing/ProductEcosystem';
import GenerationSystems from '@/components/landing/GenerationSystems';
import RoadmapDiscovery from '@/components/landing/RoadmapDiscovery';
import LatestArticlesCarousel from '@/components/landing/LatestArticlesCarousel';
import EulerLogoCanvas from '@/components/EulerLogoCanvas';
import { ExploreRoadmap } from '@/lib/api';
import VerifiedBadge from '@/components/VerifiedBadge';
import { getCategory } from '@/lib/roadmapUtils';
import { articles } from './articles/generatedArticles';
import ArticleCard from '@/components/ArticleCard';

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
  title: 'EulerFold - Build and track your learning paths',
  description: 'Create structured learning roadmaps, track your progress, and analyze your technical skills.',
  keywords: 'learning roadmaps, skill tracking, AI learning paths, technical mastery, structured learning, EulerFold',
  alternates: {
    canonical: 'https://www.eulerfold.com',
  },
  openGraph: {
    title: 'EulerFold - Build and track your learning paths',
    description: 'Create structured learning roadmaps, track your progress, and analyze your technical skills.',
    url: 'https://www.eulerfold.com',
    siteName: 'EulerFold',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EulerFold - Build and track your learning paths',
    description: 'Create structured learning roadmaps, track your progress, and analyze your technical skills.',
    creator: '@eulerfold',
  },
};

// Main landing page component for EulerFold
export default async function LandingPage() {
  const featuredRoadmaps = await getFeaturedRoadmaps();
  const faqItems = [
    {
      question: "How do I get started with a learning path?",
      answer: (
        <span>
          Browse our <Link href="/explore" className="text-accent hover:underline font-bold">Explore page</Link> to find a roadmap that fits your goals, or generate a custom one based on your specific requirements.
        </span>
      ),
      schemaAnswer: "Browse our Explore page to find a roadmap that fits your goals, or generate a custom one based on your specific requirements."
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
      question: "Where can I find curated study materials?",
      answer: (
        <span>
          The <Link href="/archive" className="text-accent hover:underline font-bold">Archive</Link> contains a massive directory of verified resources, past papers, and technical documents for various academic and technical fields.
        </span>
      ),
      schemaAnswer: "The Archive contains a massive directory of verified resources, past papers, and technical documents for various academic and technical fields."
    },
    {
      question: "How are my technical skills tracked?",
      answer: (
        <span>
          Your <Link href="/dashboard" className="text-accent hover:underline font-bold">Technical Inventory</Link> updates automatically as you complete modules and submit homework. We track your progress across different roadmaps into a unified skill profile.
        </span>
      ),
      schemaAnswer: "Your Technical Inventory updates automatically as you complete modules and submit homework. We track your progress across different roadmaps into a unified skill profile."
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
      question: "What are the limitations of Local AI Mode?",
      answer: "It requires a modern GPU and browser. Downloading the initial model takes time and storage space, and generation speed depends entirely on your local hardware.",
      schemaAnswer: "It requires a modern GPU and browser. Downloading the initial model takes time and storage space, and generation speed depends entirely on your local hardware."
    },
    {
      question: "What is OpenRouter?",
      answer: "OpenRouter is a unified API gateway that allows you to access dozens of top-tier AI models (including Claude 3.5, GPT-4o, and Gemini 2.5) from a single interface.",
      schemaAnswer: "OpenRouter is a unified API gateway that allows you to access dozens of top-tier AI models from a single interface."
    },
    {
      question: "How does using my own OpenRouter key help?",
      answer: "By bringing your own API key, you get total flexibility to choose the exact model powering your learning generation. It prevents vendor lock-in, and your key remains completely secure—it is only stored locally in your browser and never touches our servers.",
      schemaAnswer: "By bringing your own API key, you get total flexibility to choose the exact model powering your learning generation. It prevents vendor lock-in, and your key remains completely secure—it is only stored locally in your browser and never touches our servers."
    },
    {
      question: "Need more help or have feedback?",
      answer: (
        <span>
          Visit our <Link href="/help" className="text-accent hover:underline font-bold">Help Center</Link> for detailed guides on platform features, or reach out to us if you encounter any issues.
        </span>
      ),
      schemaAnswer: "Visit our Help Center for detailed guides on platform features, or reach out to us if you encounter any issues."
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
        <HeroSection />

        <GenerationSystems />

        <RoadmapDiscovery initialRoadmaps={featuredRoadmaps} />

        <ProductEcosystem />

        <TestimonialSection />

        <PricingSection />

        {/* FAQ Section */}
        <section className="py-12 md:py-32 px-6 bg-background border-t border-border/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[11px] font-bold text-accent tracking-[0.2em] uppercase mb-12 md:mb-16 manrope-body text-center">FAQ(Frequently Asked Questions)</h2>
            
            <FAQAccordion 
              items={faqItems}
            />
          </div>
        </section>

        {/* Articles & Readings Section */}
        <section className="py-12 md:py-32 px-6 bg-background border-t border-border/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div className="max-w-2xl">
                <h2 className="text-[11px] font-bold text-accent tracking-[0.2em] uppercase mb-4 manrope-body">Articles & Readings</h2>
              </div>
              <Link 
                href="/articles" 
                className="inline-flex items-center gap-2 text-accent font-bold text-[14px] hover:underline underline-offset-4 group"
              >
                Browse all articles <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <LatestArticlesCarousel articles={Object.values(articles).slice(0, 18)} />          </div>
        </section>

        <SocialFeed />

        {/* Final CTA Section */}
        <section className="py-12 md:py-32 px-4 md:px-6 relative overflow-hidden">
          <div className="lg:max-w-[60%] mx-auto relative rounded-[32px] md:rounded-[40px] overflow-hidden border border-border bg-sidebar/50 min-h-[400px] md:min-h-[450px] flex items-center justify-center shadow-xl">
            <div className="max-w-3xl mx-auto text-center relative z-10 px-6 py-12 md:py-0">
              <h2 className="font-inter text-2xl md:text-4xl font-bold text-text-heading mb-4 tracking-tight">
                Build your first roadmap.
              </h2>
              <p className="manrope-body text-[15px] md:text-[17px] text-text-primary mb-10 max-w-lg mx-auto leading-relaxed font-medium">
                Start learning with a structured plan today. No credit card required.
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
