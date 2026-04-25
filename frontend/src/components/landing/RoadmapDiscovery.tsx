"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { ExploreRoadmap } from '@/lib/api';
import VerifiedBadge from '@/components/VerifiedBadge';
import { getCategory } from '@/lib/roadmapUtils';

interface RoadmapDiscoveryProps {
  roadmaps: ExploreRoadmap[];
}

const FALLBACK_ROADMAPS: Partial<ExploreRoadmap>[] = [
  { id: '1', title: "Finance for Investing and Trading", slug: "finance-investing-trading", subject: "Business", username: "dennis" },
  { id: '2', title: "Linux & Terminal for Developers", slug: "linux-terminal-developers", subject: "Design", username: "sankalp" },
  { id: '3', title: "Bioinformatics Learning Roadmap", slug: "bioinformatics-sequences-structures", subject: "Science", username: "eulerfold" },
  { id: '4', title: "Data Engineering Fundamentals", slug: "data-engineering-fundamentals", subject: "Data Engineering", username: "eulerfold" },
  { id: '5', title: "Backend Development Roadmap", slug: "backend-development", subject: "Backend", username: "eulerfold" },
  { id: '6', title: "Climate Science & Energy Systems", slug: "climate-science-energy", subject: "Science", username: "eulerfold" }
];

export default function RoadmapDiscovery({ roadmaps }: RoadmapDiscoveryProps) {
  // Use provided roadmaps or fallbacks if empty
  const displayRoadmaps = roadmaps && roadmaps.length > 0 ? roadmaps : FALLBACK_ROADMAPS as ExploreRoadmap[];

  return (
    <section className="py-24 px-6 bg-background border-t border-border/30">
      <div className="lg:max-w-[60%] mx-auto text-center mb-16">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inconsolata-ui text-[18px] font-bold text-accent tracking-widest uppercase mb-4"
        >
          Discovery
        </motion.h2>
        <motion.h3 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-inter text-2xl md:text-3xl font-bold text-text-heading leading-tight tracking-tight mb-4"
        >
          Explore community roadmaps
        </motion.h3>
        <Link 
          href="/explore" 
          className="inline-flex items-center gap-2 text-accent font-bold text-[13px] uppercase tracking-widest hover:underline underline-offset-4 group inconsolata-ui"
        >
          View all roadmaps <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="lg:max-w-[60%] mx-auto divide-y divide-border/40 border-y border-border/40">
        {displayRoadmaps.map((roadmap, idx) => (
          <motion.div
            key={roadmap.id}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
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
                  <span className="text-[11px] font-medium text-text-muted inconsolata-ui uppercase tracking-tight">
                    by @{roadmap.username || roadmap.author || 'anonymous'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-3 sm:mt-0 shrink-0">
                <span className="text-[10px] font-bold text-text-muted bg-sidebar/50 px-3 py-1.5 rounded-none uppercase tracking-widest inconsolata-ui border border-border/50 group-hover:border-accent/30 transition-colors">
                  {getCategory(roadmap.subject || '')}
                </span>
                <ArrowRight className="w-5 h-5 text-accent opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
