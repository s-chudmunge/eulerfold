import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Plus, GraduationCap, ArrowRight, BookOpen, Target, Zap, FileSearch, Link2, Sparkles } from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import { AlreadySignedInMessage, FAQAccordion, LandingOnboardingTrigger } from './HomeClientComponents';

import HeroSection from '@/components/landing/HeroSection';
import SocialFeed from '@/components/SocialFeed';
import TestimonialSection from '@/components/landing/TestimonialSection';
import PricingSection from '@/components/landing/PricingSection';
import ProductEcosystem from '@/components/landing/ProductEcosystem';
import GenerationSystems from '@/components/landing/GenerationSystems';
import RoadmapDiscovery from '@/components/landing/RoadmapDiscovery';
import CertificationSection from '@/components/landing/CertificationSection';
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
  title: 'EulerFold AI - Build and track your learning paths',
  description: 'Design dynamic, AI-generated curriculum aligned with the latest technology. Master deep technical skills with interactive roadmaps, curated resources, and comprehensive progress tracking.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.eulerfold.com/',
    title: 'EulerFold AI - Build and track your learning paths',
    description: 'Design dynamic, AI-generated curriculum aligned with the latest technology. Master deep technical skills with interactive roadmaps, curated resources, and comprehensive progress tracking.',
    siteName: 'EulerFold',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'EulerFold - Intelligent Learning Paths',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EulerFold AI - Build and track your learning paths',
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
          The <Link href="/archive/exams/previous-year-papers" className="text-accent hover:underline font-bold">Archive</Link> contains a massive directory of verified resources, past papers, and technical documents for various academic and technical fields.
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
      question: "Do I get a certificate upon completion?",
      answer: "Yes, you receive a verifiable digital certificate once you reach 98% completion on any roadmap. These certificates authenticate your study hours and average technical grade, and can be added directly to your LinkedIn profile with one click.",
      schemaAnswer: "Yes, you receive a verifiable digital certificate once you reach 98% completion on any roadmap. These certificates authenticate your study hours and average technical grade, and can be added directly to your LinkedIn profile with one click."
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
      <PublicHeader />
      
      <main className="flex-grow">
        <HeroSection />

        <GenerationSystems />

        <RoadmapDiscovery initialRoadmaps={featuredRoadmaps} />

        <ProductEcosystem />

        <TestimonialSection />

        <CertificationSection />

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

        <SocialFeed />

        {/* Final CTA Section */}
        <section className="w-full relative overflow-hidden h-[600px] md:h-[700px] flex items-center">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/cta-bg-norobot.jpg')" }}
          />
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none" />

          <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
            <div className="max-w-xl">
              <h3 className="text-teal-400 font-bold text-[18px] md:text-[22px] mb-2 tracking-tight">
                Meet EulerFold AI
              </h3>
              <h2 className="text-white font-bold text-4xl md:text-6xl mb-8 leading-[1.1] tracking-tight" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                Let the learning<br />adventure begin!
              </h2>

              {/* Glowing Prompt Box */}
              <div className="bg-white rounded-2xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)] border-[3px] border-white/60 backdrop-blur-md relative">
                {/* Glow ring */}
                <div className="absolute -inset-2 bg-white rounded-2xl blur-xl opacity-20 pointer-events-none" />
                
                <textarea 
                  className="w-full h-24 resize-none bg-transparent outline-none text-gray-800 placeholder-gray-400 text-[14px] md:text-[15px] font-medium p-2 relative z-10"
                  placeholder="e.g. I want to create an online learning platform with course creation and student progress tracking."
                />
                
                <div className="flex items-center justify-between mt-2 border-t border-gray-100 pt-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 text-[11px] md:text-[12px] font-bold transition-colors">
                      <FileSearch className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Upload</span>
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 text-[11px] md:text-[12px] font-bold transition-colors">
                      <Link2 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Add Link</span>
                    </button>
                  </div>
                  
                  <Link 
                    href="/generate"
                    className="flex items-center gap-2 bg-accent hover:bg-teal-700 text-white px-5 py-2.5 rounded-full font-bold text-[12px] md:text-[13px] shadow-sm transition-colors uppercase tracking-widest"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Generate
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
