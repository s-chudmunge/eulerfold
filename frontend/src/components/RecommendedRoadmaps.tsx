"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ExploreRoadmap } from '@/lib/api';

interface RecommendedRoadmapsProps {
  roadmaps: any[]; // Using any[] for the mapped format, or we could match ExploreRoadmap partially
  className?: string;
}

export default function RecommendedRoadmaps({ roadmaps, className = "" }: RecommendedRoadmapsProps) {
  if (!roadmaps || roadmaps.length === 0) return null;

  return (
    <div className={className}>
      <span className="text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] inconsolata-ui mb-4 block opacity-60">
        Suggested Roadmaps
      </span>
      <div className="flex flex-col gap-4">
        {roadmaps.map((roadmap) => (
          <Link 
            key={roadmap.id} 
            href={`/roadmap/${roadmap.slug}`} 
            className="group flex items-center justify-between py-3 border-b border-border/40 hover:border-accent/40 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-md flex items-center justify-center bg-sidebar border border-border/50 shrink-0 text-accent/60 group-hover:text-accent group-hover:border-accent/30 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[16px] md:text-[18px] font-semibold text-text-heading group-hover:text-accent transition-colors leading-snug line-clamp-1">
                  {roadmap.title}
                </span>
                <span className="text-[13px] text-text-muted font-medium italic opacity-70">
                  {roadmap.subject} {roadmap.time_value && `• ${roadmap.roadmap_plan?.modules?.length || roadmap.time_value} ${roadmap.roadmap_plan?.modules?.length ? (roadmap.roadmap_plan.modules.length === 1 ? 'week' : 'weeks') : roadmap.time_unit}`}
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-accent opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0 ml-4" />
          </Link>
        ))}
      </div>
    </div>
  );
}
