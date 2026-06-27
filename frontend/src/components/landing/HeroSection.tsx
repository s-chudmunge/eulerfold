"use client";

import React, { useEffect, useState } from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { roadmapsAPI } from '@/lib/api';
import HeroBackground from '@/components/HeroBackground';
import HeroPromptInput from '@/components/landing/HeroPromptInput';
import { GoogleTrustBadge, TrustedSourcesTicker } from '@/app/HomeClientComponents';

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } 
  }
};

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
      <section className="relative pt-28 pb-16 md:pt-40 md:pb-32 px-6 min-h-[550px] md:min-h-[800px] flex items-center overflow-hidden w-full">
        <HeroBackground />
        <div className="max-w-3xl mx-auto w-full relative z-10">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            {/* Main heading */}
            <motion.h1 
              variants={fadeUp}
              className="font-inter text-3xl sm:text-4xl md:text-[46px] font-semibold text-text-heading mb-5 leading-[1.12] tracking-tight"
            >
              Describe What You Want to Learn.{' '}
              <br className="hidden md:block" />
              Get a <span className="text-accent">Structured Curriculum</span> in Seconds.
            </motion.h1>

            {/* Subheading */}
            <motion.p 
              variants={fadeUp}
              className="text-text-muted text-[15px] md:text-[17px] manrope-body font-medium mb-8 leading-relaxed max-w-2xl mx-auto"
            >
              Enter any topic, from transformer architectures to GATE prep, and get a complete learning path with verified papers, curated videos, and technical assessments. Then prove you learned it.
            </motion.p>

            {/* Interactive prompt input */}
            <HeroPromptInput />

            {/* Secondary CTAs */}
            <motion.div 
              variants={fadeUp} 
              className="flex flex-wrap items-center justify-center gap-3 mt-6"
            >
              {lastRoadmap && (
                <Link 
                  href={`/roadmap/${lastRoadmap.slug}/learn`}
                  className="inline-flex items-center gap-2 bg-accent text-white hover:bg-teal-700 px-5 py-2.5 rounded-md text-[13px] font-bold transition-all shadow-sm group"
                >
                  <ArrowRight className="w-3.5 h-3.5" /> 
                  <span className="truncate max-w-[150px] sm:max-w-[180px]">Continue: {lastRoadmap.title}</span>
                </Link>
              )}

              <Link 
                href="/explore"
                className="inline-flex items-center gap-2 bg-sidebar/80 backdrop-blur-sm border border-border text-text-primary px-5 py-2.5 rounded-md text-[13px] font-bold transition-all hover:bg-sidebar active:scale-[0.98]"
              >
                <BookOpen className="w-3.5 h-3.5" /> Browse Roadmaps
              </Link>
            </motion.div>

            {/* Sign in link */}
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-2 mt-5 h-[20px]">
              {!user && (
                <>
                  <span className="manrope-body text-[12px] text-text-muted">Already a member?</span>
                  <Link href="/login" className="manrope-body text-[12px] font-bold text-accent hover:underline">
                    Sign in to your account
                  </Link>
                </>
              )}
            </motion.div>

            {/* Google trust badge */}
            <motion.div variants={fadeUp} className="mt-8 flex justify-center">
              <GoogleTrustBadge />
            </motion.div>

            {/* Trusted sources ticker */}
            <motion.div variants={fadeUp} className="mt-6 flex justify-center">
              <TrustedSourcesTicker />
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
