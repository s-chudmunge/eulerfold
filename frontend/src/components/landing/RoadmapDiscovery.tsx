"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader, TrendingUp, Clock, Cpu, Calculator, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExploreRoadmap, api } from '@/lib/api';
import VerifiedBadge from '@/components/VerifiedBadge';

interface RoadmapDiscoveryProps {
  initialRoadmaps: ExploreRoadmap[];
}

const CATEGORIES = [
  { id: 'trending', label: 'Trending', icon: TrendingUp, sort: 'most_cloned' },
  { id: 'newest', label: 'Newest', icon: Clock, sort: 'newest' },
  { id: 'ai', label: 'AI/ML', icon: Cpu, search: 'AI' },
  { id: 'tech', label: 'Tech', icon: Code, search: 'Engineering' },
  { id: 'math', label: 'Science', icon: Calculator, search: 'Science' },
];

export default function RoadmapDiscovery({ initialRoadmaps }: RoadmapDiscoveryProps) {
  const [roadmaps, setRoadmaps] = useState<ExploreRoadmap[]>(initialRoadmaps);
  const [activeTab, setActiveTab] = useState('trending');
  const [isLoading, setIsLoading] = useState(false);

  const fetchRoadmaps = async (tabId: string) => {
    setIsLoading(true);
    setActiveTab(tabId);
    
    try {
      const tab = CATEGORIES.find(c => c.id === tabId);
      if (!tab) return;

      const params: any = { limit: 8 };
      if (tab.sort) params.sort_by = tab.sort;
      if (tab.search) params.search = tab.search;

      const res = await api.get('/explore', { params });
      setRoadmaps(res.data);
    } catch (error) {
      console.error("Error fetching roadmaps:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
        
        <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => fetchRoadmaps(cat.id)}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap
                ${activeTab === cat.id 
                  ? 'bg-text-heading text-background shadow-lg shadow-text-heading/10' 
                  : 'bg-sidebar text-text-muted hover:text-text-primary'
                }`}
            >
              <cat.icon className="w-3 h-3" />
              {cat.label}
            </button>
          ))}
        </div>
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

        <div className="divide-y divide-border/40 border-y border-border/40">
          <AnimatePresence mode="popLayout">
            {roadmaps.map((roadmap, idx) => (
              <motion.div
                key={roadmap.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
              >
                <Link 
                  href={`/roadmap/${roadmap.slug}`}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between py-6 px-4 hover:bg-sidebar/40 transition-all rounded-none"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[16px] md:text-[18px] font-bold text-text-heading group-hover:text-accent transition-colors truncate">
                          {roadmap.title}
                        </span>
                        {(roadmap.username === 'eulerfold' || roadmap.author === 'eulerfold') && <VerifiedBadge size={14} className="shrink-0" />}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-text-muted inconsolata-ui uppercase tracking-tight">
                          @{roadmap.username || roadmap.author || 'anonymous'}
                        </span>
                        <span className="w-1 h-1 bg-border rounded-full" />
                        <span className="text-[10px] font-bold text-accent inconsolata-ui uppercase tracking-tight">
                          {roadmap.clone_count} Clones
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-3 sm:mt-0 shrink-0">
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
            Explore all {activeTab !== 'trending' ? activeTab : ''} roadmaps <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
