"use client";

import React, { useEffect, useState } from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { roadmapsAPI } from '@/lib/api';
import HeroPromptInput from '@/components/landing/HeroPromptInput';
import CurvedFlowShowcase from '@/components/landing/CurvedFlowShowcase';

function ForwardBinLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <g stroke="#D97757" strokeWidth="11.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 72.82 76.00 A 33 33 0 1 1 72.82 24.00" />
        <path d="M 44.5 34 L 60.5 50 L 44.5 66" />
        <path d="M 64.5 34 L 80.5 50 L 64.5 66" />
      </g>
    </svg>
  );
}

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
            {/* ForwardBin Brand Card */}
            <a
              href="https://github.com/s-chudmunge/forwardbin"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3.5 py-2 mb-6 rounded-xl border border-border/80 bg-sidebar/60 hover:bg-sidebar hover:border-[#D97757]/50 transition-all group shadow-xs"
            >
              <ForwardBinLogo className="w-7 h-7 shrink-0 transition-transform group-hover:scale-105" />
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-bold text-text-heading group-hover:text-[#D97757] transition-colors">
                    ForwardBin
                  </span>
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-[#D97757]/10 text-[#D97757] border border-[#D97757]/20">
                    Desktop
                  </span>
                </div>
                <span className="text-[11px] text-text-muted">
                  Desktop drop-bin & AI calendar scheduler for researchers
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-[#D97757] group-hover:translate-x-0.5 transition-all ml-1 shrink-0" />
            </a>

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
              <a
                href="https://github.com/s-chudmunge/forwardbin"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-3.5 py-2 bg-sidebar/60 hover:bg-sidebar border border-border/80 hover:border-[#D97757]/40 rounded-md text-[12px] font-medium text-text-heading transition-all group"
              >
                <ForwardBinLogo className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
                <span>Get ForwardBin for Desktop</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#D97757]/10 text-[#D97757] font-semibold border border-[#D97757]/20">Free</span>
              </a>
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
