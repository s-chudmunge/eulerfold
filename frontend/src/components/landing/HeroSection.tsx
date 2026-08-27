"use client";

import React, { useEffect, useState } from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { roadmapsAPI } from '@/lib/api';
import HeroPromptInput from '@/components/landing/HeroPromptInput';
import { TrustedSourcesTicker } from '@/app/HomeClientComponents';

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
    <div className="relative w-full">
      <section className="relative pt-24 pb-8 sm:pt-28 md:pt-36 md:pb-16 px-6 min-h-[600px] md:min-h-[750px] flex flex-col items-center justify-between w-full">
        <div className="max-w-3xl mx-auto w-full relative z-10 flex-1 flex flex-col justify-center">
          <div className="text-center">

            <h1 className="text-3xl sm:text-4xl md:text-[48px] font-semibold text-text-heading mb-10 md:mb-12 leading-[1.1] tracking-tight">
              Describe What You Want to Learn.{' '}
              <br className="hidden md:block" />
              Get a{' '}
              <span className="text-accent">Structured Course</span>
              {' '}in Seconds.
            </h1>



            {/* Interactive prompt input */}
            <div id="hero-prompt-input" className="scroll-mt-32">
              <HeroPromptInput />
            </div>

            {/* Secondary CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              {lastRoadmap && (
                <Link
                  href={`/roadmap/${lastRoadmap.slug}/learn`}
                  className="inline-flex items-center gap-2 bg-text-heading text-background px-5 py-2.5 rounded-md text-[13px] font-bold hover:opacity-80 transition-opacity"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[150px] sm:max-w-[180px]">Continue: {lastRoadmap.title}</span>
                </Link>
              )}
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 border border-border text-text-primary px-5 py-2.5 rounded-md text-[13px] font-bold hover:border-accent/40 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" /> Browse Courses
              </Link>
            </div>

            {/* Sign in link */}
            <div className="flex items-center justify-center gap-2 mt-5 h-[20px]">
              {!user && (
                <>
                  <span className="text-[12px] text-text-muted">Already a member?</span>
                  <Link href="/login" className="text-[12px] font-bold text-accent hover:underline">
                    Sign in to your account
                  </Link>
                </>
              )}
            </div>

          </div>
        </div>

        {/* Trusted sources ticker */}
        <div className="w-full relative z-10 mt-10 md:mt-16">
          <TrustedSourcesTicker />
        </div>
      </section>
    </div>
  );
}
