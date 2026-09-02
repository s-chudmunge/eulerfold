'use client';

import React from 'react';
import { TreePine, Clock } from 'lucide-react';
import { useGroveStats } from '../grove/useGroveStats';
import { GroveDisplay } from '../grove/GroveDisplay';

interface GlobalStudyForestCardProps {
  completedRoadmapsCount?: number;
}

export function GlobalStudyForestCard({ completedRoadmapsCount = 0 }: GlobalStudyForestCardProps) {
  const { globalTotalMinutes, totalTreesPlanted, loading } = useGroveStats(0);

  if (loading && totalTreesPlanted === 0) {
    return null;
  }

  return (
    <div className="bg-background border border-border rounded-md p-5 shadow-xs mb-8 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <TreePine className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-text-heading">Study Forest</h3>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono">
          <div className="px-2.5 py-1 bg-sidebar border border-border rounded-md flex items-center gap-1.5 text-text-heading">
            <TreePine className="w-3.5 h-3.5 text-accent" />
            <span>{totalTreesPlanted} Trees</span>
          </div>
          <div className="px-2.5 py-1 bg-sidebar border border-border rounded-md flex items-center gap-1.5 text-text-heading">
            <Clock className="w-3.5 h-3.5 text-text-muted" />
            <span>{globalTotalMinutes}m</span>
          </div>
        </div>
      </div>

      <GroveDisplay 
        totalTreesPlanted={totalTreesPlanted}
        completedTopicsCount={completedRoadmapsCount}
        totalTopics={Math.max(10, completedRoadmapsCount + 2)}
      />
    </div>
  );
}
