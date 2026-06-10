"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Briefcase, Calendar, Microscope, Terminal, ArrowRight, Zap, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const products = [
  {
    title: "Decode",
    description: "On-demand technical breakdown of academic papers. Convert complex research into precise technical blueprints.",
    icon: Microscope,
    href: "/research-lab",
    isNew: true,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10"
  },
  {
    title: "Job Decoded",
    description: "Turn any job description into a learning path. See exactly what skills you are missing for a specific role.",
    icon: Briefcase,
    href: "/generate?mode=job",
    isNew: true,
    color: "text-teal-700",
    bgColor: "bg-teal-700/10"
  },
  {
    title: "Study Planner",
    description: "Create a daily schedule from your roadmaps. Pick your intensity and get a list of tasks to complete.",
    icon: Calendar,
    href: "/planner",
    isNew: true,
    color: "text-accent",
    bgColor: "bg-accent/10"
  },

  {
    title: "Practice",
    description: "Test your knowledge with AI-generated assessments and practice problems across 20+ domains.",
    icon: Target,
    href: "/practice",
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10"
  },
  {
    title: "Roadmap Generator",
    description: "Generate personalized, step-by-step learning paths for any subject or skill in seconds.",
    icon: Zap,
    href: "/generate",
    color: "text-amber-600",
    bgColor: "bg-amber-500/10"
  }
];

export default function ProductEcosystem() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
        
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollTo({ left: scrollLeft + clientWidth / 2, behavior: 'smooth' });
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth / 2 
        : scrollLeft + clientWidth / 2;
      
      scrollRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-10 md:py-20 px-6 bg-sidebar/30 border-y border-border/30 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="inconsolata-ui text-[11px] font-bold text-accent tracking-[0.2em] uppercase mb-3">New Tools</h2>
            <h3 className="text-2xl md:text-3xl font-bold text-text-heading tracking-tight leading-tight">Tools to help you learn and build.</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => scroll('left')}
              className="p-2 border border-border rounded-full text-text-muted hover:border-accent hover:text-accent transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-2 border border-border rounded-full text-text-muted hover:border-accent hover:text-accent transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div 
          className="relative group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-8 pt-4 scroll-smooth no-scrollbar"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {products.map((p, index) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="min-w-[280px] sm:min-w-[320px] md:min-w-[380px] scroll-snap-align-start h-full"
                style={{ scrollSnapAlign: 'start' }}
              >
                <Link href={p.href} className="group bg-sidebar border border-border/50 hover:border-accent/30 transition-all duration-300 rounded-2xl p-8 h-full flex flex-col relative overflow-hidden backdrop-blur-sm shadow-sm hover:shadow-md">
                  {/* Hover glow background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-accent/[0.03] group-hover:to-transparent transition-all duration-500 z-0"></div>

                  <div className="relative z-10 flex flex-col h-full">
                    <div className={`w-12 h-12 ${p.bgColor} ${p.color} border border-border/50 rounded-xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-[1.05] group-hover:-rotate-3 transition-transform duration-300`}>
                      <p.icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <h4 className="text-xl font-bold text-text-heading tracking-tight leading-none">{p.title}</h4>
                      {p.isNew && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-accent px-2.5 py-1 rounded-full border border-accent/20 bg-accent/5">
                          New
                        </span>
                      )}
                    </div>
                    
                    <p className="text-[13px] text-text-muted font-medium leading-relaxed mb-8 flex-1">
                      {p.description}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] font-bold text-accent uppercase tracking-widest group-hover:gap-3 transition-all mt-auto">
                      Explore Tool <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
