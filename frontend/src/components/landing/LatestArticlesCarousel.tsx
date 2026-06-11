"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Article } from '@/app/articles/generatedArticles';
import ArticleCard from '@/components/ArticleCard';

interface LatestArticlesCarouselProps {
  articles: Article[];
}

const AUTO_SCROLL_INTERVAL = 4000; // 4 seconds

export default function LatestArticlesCarousel({ articles }: LatestArticlesCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
        
        // If we're near the end, scroll back to start
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        } else {
          scrollRef.current.scrollTo({
            left: scrollLeft + clientWidth / 2,
            behavior: 'smooth'
          });
        }
      }
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(interval);
  }, [isPaused, articles.length]);

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
    <div 
      className="relative group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Navigation Arrows */}
      <button 
        onClick={() => scroll('left')}
        className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-md border border-border p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-accent hover:text-white"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button 
        onClick={() => scroll('right')}
        className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-md border border-border p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-accent hover:text-white"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Scrolling Container */}
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-8 pt-4 scroll-smooth no-scrollbar"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {articles.map((article, index) => (
          <motion.div 
            key={article.slug} 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="min-w-[260px] md:min-w-[300px] lg:min-w-[340px] shrink-0 scroll-snap-align-start"
            style={{ scrollSnapAlign: 'start' }}
          >
            <ArticleCard article={article} variant="vertical" />
          </motion.div>
        ))}
      </div>

      {/* Progress Indicator (Optional) */}
      <div className="flex justify-center gap-1.5 mt-2">
        {Array.from({ length: Math.ceil(articles.length / 2) }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-border transition-all" />
        ))}
      </div>
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
