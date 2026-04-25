"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    title: "The Audit Senate",
    description: "Your work is reviewed by three specialized experts to ensure you truly master each topic.",
    image: "/assets/audit_senate.svg",
  },
  {
    title: "Proof of Work Logs",
    description: "Every module you finish is recorded in your personal history of real-world accomplishments.",
    image: "/assets/technical_peddigree.png",
  },
  {
    title: "Skill Verification",
    description: "A fair scoring system that values actual work and practice over just finishing a course.",
    image: "/assets/tracking_system.png",
  },
  {
    title: "The Learning Ecosystem",
    description: "Move from just watching videos to building real things in a complete learning environment.",
    image: "/assets/ecosystem_overview.svg",
  }
];

const SLIDE_DURATION = 7000; // 7 seconds

export default function AuditEcosystemCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const slideNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    setProgress(0);
  }, []);

  const slidePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
  }, []);

  // Timer logic for progress bar and auto-slide
  useEffect(() => {
    if (isPaused) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const startTime = Date.now() - (progress / 100) * SLIDE_DURATION;
    
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        slideNext();
      }
    }, 50);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPaused, slideNext, currentIndex, progress]);

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    setProgress(0);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0
    })
  };

  return (
    <section className="relative py-12 md:py-24 px-4 md:px-6 overflow-hidden">
      {/* Container */}
      <div 
        className="lg:max-w-[90%] xl:max-w-[85%] mx-auto relative min-h-[600px] md:min-h-[750px] flex flex-col items-center justify-center group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        
        {/* Navigation Dots - Story Style Progress Segments */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2 z-30 w-full max-w-md px-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className="flex-1 h-1 rounded-full bg-border/20 overflow-hidden relative transition-all duration-300 hover:h-1.5"
              aria-label={`Go to slide ${i + 1}`}
            >
              {/* Completed segments */}
              {i < currentIndex && <div className="absolute inset-0 bg-accent" />}
              {/* Active segment with progress */}
              {i === currentIndex && (
                <div 
                  className="absolute inset-y-0 left-0 bg-accent transition-all duration-50" 
                  style={{ width: `${progress}%` }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={slidePrev}
          className="absolute left-0 md:left-4 z-40 p-4 rounded-full border border-border/20 bg-background/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-background hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="w-6 h-6 text-text-primary" />
        </button>
        <button 
          onClick={slideNext}
          className="absolute right-0 md:right-4 z-40 p-4 rounded-full border border-border/20 bg-background/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-background hover:scale-110 active:scale-95"
        >
          <ChevronRight className="w-6 h-6 text-text-primary" />
        </button>

        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.4 }
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = offset.x;
                if (swipe < -100) slideNext();
                else if (swipe > 100) slidePrev();
              }}
              className="w-full h-full flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
            >
              {/* Visual Content */}
              <div className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center px-4">
                <img 
                  src={slides[currentIndex].image} 
                  alt={slides[currentIndex].title}
                  draggable={false}
                  className={`max-w-full max-h-full w-auto h-auto object-contain drop-shadow-2xl select-none transition-all duration-500 ${
                    slides[currentIndex].image.endsWith('.svg') 
                      ? 'dark:brightness-125 dark:contrast-110' 
                      : 'dark:invert dark:hue-rotate-180 dark:brightness-110 dark:contrast-110'
                  }`}
                />
                
                <div className="absolute inset-0 -z-10 bg-accent/5 rounded-full blur-[120px] opacity-40 transform scale-75" />
              </div>

              {/* Content Text */}
              <div className="mt-8 md:mt-16 text-center max-w-3xl px-6 pointer-events-none select-none">
                <h3 className="text-xl md:text-3xl font-bold text-text-heading mb-4 font-inter tracking-tight">
                  {slides[currentIndex].title}
                </h3>
                <p className="text-text-muted text-base md:text-2xl manrope-body font-medium leading-relaxed opacity-80">
                  {slides[currentIndex].description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
