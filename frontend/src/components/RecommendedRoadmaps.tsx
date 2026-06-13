"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { exploreAPI, ExploreRoadmap } from '@/lib/api';

interface RecommendedRoadmapsProps {
  query: string;
  limit?: number;
  className?: string;
}

export default function RecommendedRoadmaps({ query, limit = 3, className = "" }: RecommendedRoadmapsProps) {
  const [roadmaps, setRoadmaps] = useState<ExploreRoadmap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoadmaps() {
      try {
        // Use sort_by="most_cloned" to get popular ones
        const data = await exploreAPI.getExploreRoadmaps(query, 0, limit, 'most_cloned');
        setRoadmaps(data);
      } catch (err) {
        console.error('Failed to fetch recommended roadmaps:', err);
      } finally {
        setLoading(false);
      }
    }

    if (query) {
      fetchRoadmaps();
    } else {
      setLoading(false);
    }
  }, [query, limit]);

  if (loading) return (
    <div className={`mt-10 animate-pulse ${className}`}>
      <div className="h-4 w-32 bg-border rounded mb-6 opacity-60"></div>
      <div className="space-y-4">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="h-12 bg-border/40 rounded-lg"></div>
        ))}
      </div>
    </div>
  );
  
  if (roadmaps.length === 0) return null;

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
            className="group flex items-start justify-between py-2 border-b border-border/40 hover:border-accent/40 transition-colors"
          >
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[17px] md:text-[19px] font-semibold text-text-heading group-hover:text-accent transition-colors leading-snug truncate">
                {roadmap.title}
              </span>
              <span className="text-[13px] text-text-muted font-medium italic opacity-70">
                {roadmap.subject} {roadmap.time_value && `• ${roadmap.roadmap_plan?.modules?.length || roadmap.time_value} ${roadmap.roadmap_plan?.modules?.length ? (roadmap.roadmap_plan.modules.length === 1 ? 'week' : 'weeks') : roadmap.time_unit}`}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-accent opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0 mt-1" />
          </Link>
        ))}
      </div>
    </div>
  );
}
