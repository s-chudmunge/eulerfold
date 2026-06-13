"use client";

import React, { useEffect, useState } from 'react';
import { Plus, BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { roadmapsAPI } from '@/lib/api';
import HeroBackground from '@/components/HeroBackground';
import AnimatedEfficient from '@/components/landing/AnimatedEfficient';
import { GoogleTrustBadge, TrustedSourcesTicker } from '@/app/HomeClientComponents';

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
              title: latest.roadmap_plan?.title || latest.subject || 'Your Roadmap',
              slug: latest.slug
            });
          }
        })
        .catch(err => console.error("Failed to fetch last roadmap:", err));
    }
  }, [user]);

  return (
    <div className="relative w-full overflow-hidden">
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-48 px-6 min-h-[500px] md:min-h-[850px] flex items-center overflow-hidden w-full">
        <HeroBackground />
        <div className="max-w-7xl mx-auto w-full relative z-10 mt-8 md:mt-2">
          <div className="max-w-3xl">
            <h1 className="font-inter text-3xl sm:text-4xl md:text-5xl font-semibold text-text-heading mb-6 leading-[1.15] md:leading-[1.1] tracking-tight">
              Escape the stale curriculum with <br className="hidden md:block" /><AnimatedEfficient /> learning paths
            </h1>
            <p className="text-text-muted text-base md:text-lg manrope-body font-medium mb-10 leading-relaxed max-w-2xl">
              Education shouldn't lag years behind. EulerFold develops adaptive curriculum dynamically aligned with the latest technology and cutting-edge research.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 mb-8">
              <Link 
                href="/generate"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-gradient-to-b from-teal-400 to-teal-600 text-white px-7 py-3 rounded-2xl text-[14px] font-bold transition-all hover:brightness-110 active:border-b-0 active:translate-y-[4px] border-b-[4px] border-teal-800 gap-3 shadow-lg"
              >
                <Plus className="w-4 h-4" /> Start Your Learning
              </Link>
              
              {lastRoadmap && (
                <Link 
                  href={`/roadmap/${lastRoadmap.slug}/learn`}
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-gradient-to-b from-teal-400 to-teal-600 text-white px-7 py-3 rounded-2xl text-[14px] font-bold transition-all hover:brightness-110 active:border-b-0 active:translate-y-[4px] border-b-[4px] border-teal-800 gap-3 group overflow-hidden shadow-lg"
                >
                  <ArrowRight className="w-4 h-4" /> 
                  <span className="truncate max-w-[150px] sm:max-w-[200px] inline-block align-middle">Continue: {lastRoadmap.title}</span>
                </Link>
              )}

              <Link 
                href="/explore"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-sidebar/80 backdrop-blur-sm border border-border text-text-primary px-7 py-3.5 rounded-2xl text-[14px] font-bold transition-all hover:scale-[1.02] hover:bg-sidebar active:scale-[0.98] gap-3"
              >
                <BookOpen className="w-4 h-4" /> Browse Public Roadmaps
              </Link>
            </div>

            <div className="flex items-center gap-2 mb-10 h-[20px]">
              {!user && (
                <>
                  <span className="manrope-body text-[13px] text-text-muted">Already a member?</span>
                  <Link href="/login" className="manrope-body text-[13px] font-bold text-accent hover:underline">
                    Sign in to your account
                  </Link>
                </>
              )}
            </div>

            <GoogleTrustBadge />

            <div className="mt-8">
              <TrustedSourcesTicker />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
