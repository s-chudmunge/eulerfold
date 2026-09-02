'use client';

import React from 'react';
import { TreePine, Clock } from 'lucide-react';
import { FocusGroveProps } from '../grove/types';
import { useGroveStats } from '../grove/useGroveStats';
import { GroveDisplay } from '../grove/GroveDisplay';
import { GroveTimerCard } from '../grove/GroveTimerCard';

export { TreeIllustration } from '../grove/TreeIllustration';

export default function FocusGrove({
  roadmapId,
  roadmapSlug,
  totalTopics = 10,
  completedTopicsCount = 0,
  modules = [],
  onSessionComplete
}: FocusGroveProps) {
  const { totalMinutes, totalTreesPlanted } = useGroveStats(completedTopicsCount, roadmapId);

  return (
    <div className="bg-background border border-border rounded-md p-5 shadow-xs mb-8 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <TreePine className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-text-heading">Study Progress</h3>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <div className="px-2.5 py-1 bg-sidebar border border-border rounded-md flex items-center gap-1.5 text-text-heading">
            <TreePine className="w-3.5 h-3.5 text-accent" />
            <span>{totalTreesPlanted} Trees</span>
          </div>
          <div className="px-2.5 py-1 bg-sidebar border border-border rounded-md flex items-center gap-1.5 text-text-heading">
            <Clock className="w-3.5 h-3.5 text-text-muted" />
            <span>{totalMinutes}m</span>
          </div>
        </div>
      </div>

      {/* Forest & Timer: Stacks cleanly on medium screens and sits side-by-side on large screens */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <div className="md:col-span-2 h-full flex flex-col">
          <GroveDisplay 
            totalTreesPlanted={totalTreesPlanted}
            completedTopicsCount={completedTopicsCount}
            totalTopics={totalTopics}
          />
        </div>

        <div className="md:col-span-1 h-full flex flex-col">
          <GroveTimerCard 
            roadmapId={roadmapId}
            roadmapSlug={roadmapSlug}
            onSessionComplete={onSessionComplete}
          />
        </div>
      </div>
    </div>
  );
}
