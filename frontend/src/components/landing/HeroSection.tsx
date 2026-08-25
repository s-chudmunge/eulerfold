"use client";

import React, { useEffect, useState } from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { roadmapsAPI } from '@/lib/api';
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

const rotatingPhrases = [
  "Completely Free.",
  "Get Job Ready.",
  "Build and Learn."
];

export default function HeroSection() {
  const { user } = useAuth();
  const [lastRoadmap, setLastRoadmap] = useState<{ title: string; slug: string } | null>(null);
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % rotatingPhrases.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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
      <section className="relative pt-24 pb-8 sm:pt-28 md:pt-36 md:pb-16 px-4 sm:px-6 min-h-[600px] md:min-h-[750px] flex flex-col items-center justify-between w-full">
        

        <div className="max-w-3xl mx-auto w-full relative z-10 flex-1 flex flex-col justify-center">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            {/* Main heading */}
            <h1 className="font-inter text-3xl sm:text-4xl md:text-[46px] font-semibold text-text-heading mb-5 leading-[1.12] tracking-tight">
              Describe What You Want to Learn.{' '}
              <br className="hidden md:block" />
              Get a{' '}
              <span className="relative inline-block text-accent drop-shadow-sm pb-1">
                Structured Course
              </span>
              {' '}in Seconds.{' '}
              <span className="font-serif italic text-accent opacity-90 text-[32px] sm:text-[38px] md:text-[44px] tracking-normal font-medium inline-block min-w-[280px] sm:min-w-[320px]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={phraseIndex}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.3 }}
                    className="inline-block"
                  >
                    {rotatingPhrases[phraseIndex]}
                    <span className="inline-block ml-[2px] w-[5px] h-[0.75em] bg-accent align-baseline animate-pulse" />
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>

            {/* Interactive prompt input */}
            <div className="mt-8">
              <HeroPromptInput />
            </div>

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
                <BookOpen className="w-3.5 h-3.5" /> Browse Courses
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

          </motion.div>
        </div>

        {/* Consolidated Social Proof */}
        <motion.div 
          variants={fadeUp} 
          initial="hidden"
          animate="visible"
          className="w-full relative z-10 mt-10 md:mt-16"
        >
          <TrustedSourcesTicker />
        </motion.div>
      </section>
    </div>
  );
}
