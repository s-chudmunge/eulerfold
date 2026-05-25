"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, BookOpen } from 'lucide-react';
import Link from 'next/link';
import HeroBackground from '@/components/HeroBackground';
import AnimatedEfficient from '@/components/landing/AnimatedEfficient';
import { GoogleTrustBadge, TrustedSourcesTicker } from '@/app/HomeClientComponents';
import SummerSaleHero from './SummerSaleHero';

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = [
    {
      id: 'original',
      content: (
        <section className="relative pt-16 pb-20 md:pt-32 md:pb-48 px-6 min-h-[500px] md:min-h-[850px] flex items-center overflow-hidden w-full">
          <HeroBackground />
          <div className="max-w-7xl mx-auto w-full relative z-10">
            <div className="max-w-3xl">
              <h1 className="font-inter text-3xl sm:text-4xl md:text-5xl font-semibold text-text-heading mb-6 leading-[1.15] md:leading-[1.1] tracking-tight">
                Infrastructure for <AnimatedEfficient />,<br className="hidden md:block" /> structured learning
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

              <div className="flex items-center gap-2 mb-10">
                <span className="manrope-body text-[13px] text-text-muted">Already a member?</span>
                <Link href="/login" className="manrope-body text-[13px] font-bold text-accent hover:underline">
                  Sign in to your account
                </Link>
              </div>

              <GoogleTrustBadge />

              <div className="mt-8">
                <TrustedSourcesTicker />
              </div>
            </div>
          </div>
        </section>
      )
    },
    {
      id: 'summer-sale',
      content: <SummerSaleHero />
    }
  ];

  useEffect(() => {
    if (isPaused) return;
    
    // Original hero stays for 8s, Summer Sale stays for 15s
    const interval = slides[currentSlide].id === 'summer-sale' ? 15000 : 8000;
    
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, interval);
    
    return () => clearTimeout(timer);
  }, [isPaused, currentSlide, slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div 
      className="relative w-full group overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-full"
        >
          {slides[currentSlide].content}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/5 hover:bg-black/10 backdrop-blur-sm text-black/50 hover:text-black transition-all opacity-0 group-hover:opacity-100"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/5 hover:bg-black/10 backdrop-blur-sm text-black/50 hover:text-black transition-all opacity-0 group-hover:opacity-100"
        aria-label="Next slide"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              currentSlide === index ? 'w-8 h-2 bg-accent' : 'w-2 h-2 bg-accent/20 hover:bg-accent/40'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
