"use client";

import React, { useEffect, useState } from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
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
            <div className="flex items-center gap-1.5 mb-5 text-[11px] font-mono font-medium tracking-[0.14em] text-accent uppercase">
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
            {lastRoadmap && (
              <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                <Link
                  href={`/roadmap/${lastRoadmap.slug}`}
                  className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-sidebar/80 hover:bg-sidebar border border-[rgba(20,29,25,0.08)] dark:border-white/10 rounded-md text-[12.5px] text-text-heading transition-all shadow-[0_2px_8px_-2px_rgba(20,60,52,0.06)] hover:shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="tracking-[-0.01em]">
                    <span className="text-text-muted font-normal text-[11.5px] uppercase tracking-wider mr-1.5">Resume</span>
                    <span className="font-semibold text-text-heading">{lastRoadmap.title}</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted/70 group-hover:text-text-heading transition-colors" />
                </Link>
              </div>
            )}
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
