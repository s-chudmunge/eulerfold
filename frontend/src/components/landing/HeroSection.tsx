"use client";

import React, { useEffect, useState } from 'react';
import { BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { roadmapsAPI } from '@/lib/api';
import HeroPromptInput from '@/components/landing/HeroPromptInput';
import CurvedFlowShowcase from '@/components/landing/CurvedFlowShowcase';

export default function HeroSection() {
  const { user } = useAuth();
  const [lastRoadmap, setLastRoadmap] = useState<{ title: string; slug: string } | null>(null);

  useEffect(() => {
    if (user) {
      roadmapsAPI.getMyRoadmaps()
        .then(data => {
          if (data && data.length > 0) {
            const latest = data[0];
            setLastRoadmap({
              title: latest.roadmap_plan?.title || latest.subject || 'Your Course',
              slug: latest.slug || String(latest.id),
            });
          }
        })
        .catch(err => console.error("Failed to fetch last roadmap:", err));
    }
  }, [user]);

  return (
    <div className="relative w-full overflow-hidden">
      <section className="relative pt-24 pb-4 sm:pt-28 md:pt-36 md:pb-8 px-6 min-h-[600px] md:min-h-[720px] flex flex-col items-center justify-between w-full">
        <div className="max-w-3xl mx-auto w-full relative z-10 flex-1 flex flex-col justify-center">
          <div className="text-center flex flex-col items-center">
            {/* Simple Clean Overline */}
            <div className="flex items-center gap-1.5 mb-5 text-[11px] font-mono font-bold tracking-wider text-accent uppercase">
              <span>EulerFold Agentic Learning</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-[54px] font-bold text-text-heading mb-4 md:mb-5 leading-[1.1] tracking-tight max-w-2xl">
              Learning for the AI era.{' '}
              <br className="hidden sm:block" />
              <span className="font-serif italic font-normal text-text-heading/90">Agentic and personalized.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-[15px] md:text-[16px] text-text-muted max-w-xl mb-8 md:mb-10 leading-relaxed font-normal">
              A free agentic system that creates your learning path and guides you 24/7 toward your goal.
            </p>

            {/* Interactive prompt input */}
            <div id="hero-prompt-input" className="w-full scroll-mt-32">
              <HeroPromptInput />
            </div>

            {/* Secondary CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              {lastRoadmap && (
                <Link
                  href={`/roadmap/${lastRoadmap.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-sidebar hover:bg-callout-bg border border-border rounded-md text-[13px] font-medium text-text-heading transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-accent" />
                  <span>Resume: {lastRoadmap.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Visual Course Graph Showcase */}
        <div className="w-full mt-4 md:mt-8">
          <CurvedFlowShowcase />
        </div>
      </section>
    </div>
  );
}
