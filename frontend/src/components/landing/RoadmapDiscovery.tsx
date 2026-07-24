"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { articles } from '@/app/articles/generatedArticles';
import { papers } from '@/app/research-decoded/generatedData';
import { ArrowRight, Loader, TrendingUp, Clock, Cpu, Calculator, Code, BookOpen, FlaskConical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExploreRoadmap, api } from '@/lib/api';
import VerifiedBadge from '@/components/VerifiedBadge';

interface RoadmapDiscoveryProps {
  initialRoadmaps: ExploreRoadmap[];
}

export default function RoadmapDiscovery({ initialRoadmaps }: RoadmapDiscoveryProps) {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      try {
        // Try to fetch personalized recommendations
        const res = await api.get('/explore/recommendations/personalized');
        if (res.data && res.data.length > 0) {
          // The backend returns uniform objects with content_type
          setItems(res.data.map((item: any) => {
            let heroImage = undefined;
            if (item.content_type === 'article' && articles[item.slug]) {
              heroImage = articles[item.slug].heroImage;
            } else if ((item.content_type === 'research' || item.content_type === 'research_decoded') && papers[item.slug]) {
              heroImage = papers[item.slug].heroImage;
            }
            return {
              ...item,
              type: item.content_type,
              heroImage
            };
          }));
          setIsLoading(false);
          return;
        }
      } catch (err) {
        // Fallback silently
      }
      
      // Fallback: Mix items together
      const mixedItems = [
        ...initialRoadmaps.slice(0, 4).map(r => ({ ...r, type: 'roadmap' })),
        ...Object.values(articles).slice(0, 2).map(a => ({ ...a, type: 'article' })),
        ...Object.values(papers).slice(0, 2).map(p => ({ ...p, type: 'research' }))
      ].sort(() => Math.random() - 0.5);
      
      setItems(mixedItems);
      setIsLoading(false);
    }
    loadContent();
  }, [initialRoadmaps]);

  return (
    <section className="py-12 md:py-24 px-6 bg-background border-t border-border/30">
      <div className="lg:max-w-[60%] mx-auto text-center mb-12">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inconsolata-ui text-[18px] font-bold text-text-heading tracking-widest uppercase mb-4"
        >
          Discovery
        </motion.h2>
      </div>

      <div className="lg:max-w-[60%] mx-auto min-h-[400px] relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-[2px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader className="w-5 h-5 animate-spin text-accent" />
              <span className="inconsolata-ui text-[10px] font-bold uppercase tracking-widest text-accent">Updating...</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {items.map((item, idx) => (
              <motion.div
                key={item.id || item.slug}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
              >
                <Link 
                  href={item.type === 'article' ? `/articles/${item.slug}` : item.type === 'research' || item.type === 'research_decoded' ? `/research-decoded/${item.slug}` : `/roadmap/${item.slug}`}
                  className="group flex items-center justify-between py-3 px-4 border border-border/40 hover:border-accent/40 bg-sidebar/20 hover:bg-sidebar/40 transition-colors rounded-lg"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {item.type === 'roadmap' ? (
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-md flex items-center justify-center bg-sidebar border border-border/50 shrink-0 text-accent/60 group-hover:text-accent group-hover:border-accent/30 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-md overflow-hidden shrink-0 border border-border/50 relative bg-sidebar">
                        {item.heroImage ? (
                          <img src={item.heroImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {item.type === 'article' ? <BookOpen className="w-5 h-5 text-text-muted opacity-50" /> : <FlaskConical className="w-5 h-5 text-text-muted opacity-50" />}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-[16px] md:text-[18px] font-semibold text-text-heading group-hover:text-accent transition-colors leading-snug truncate">
                        {item.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-text-muted inconsolata-ui uppercase tracking-wider px-2 py-0.5 rounded border border-border/60 bg-sidebar/50">
                          {item.type === 'article' ? 'Article' : item.type === 'research' || item.type === 'research_decoded' ? 'Research' : 'Course'}
                        </span>
                        <span className="text-[13px] text-text-muted font-medium italic opacity-70 truncate">
                          {item.type === 'article' || item.type === 'research' || item.type === 'research_decoded'
                            ? (item.subject || item.excerpt || item.description || 'Technical Guide')
                            : (item.subject || 'Course')
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 pl-4">
                    <ArrowRight className="w-5 h-5 text-accent opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-12 text-center">
          <Link 
            href="/explore"
            className="inline-flex items-center gap-2 text-accent font-bold text-[13px] uppercase tracking-widest hover:underline underline-offset-4 group inconsolata-ui"
          >
            Explore all content <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
