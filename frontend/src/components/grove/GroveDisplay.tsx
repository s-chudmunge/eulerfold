'use client';

import React, { useMemo } from 'react';
import { TreeIllustration } from './TreeIllustration';
import { TreeVariety, ActivityTreeBreakdown } from './types';
import { Coins, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

interface GroveDisplayProps {
  totalTreesPlanted: number;
  completedTopicsCount: number;
  totalTopics: number;
  breakdown?: Partial<ActivityTreeBreakdown>;
}

function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

export function GroveDisplay({ 
  totalTreesPlanted, 
  completedTopicsCount, 
  totalTopics,
  breakdown
}: GroveDisplayProps) {
  const visualCount = Math.min(60, totalTreesPlanted);
  const extraCount = Math.max(0, totalTreesPlanted - 60);

  const forestPlacements = useMemo(() => {
    const treePool: { 
      variety: TreeVariety; 
      title: string; 
      actionType: string;
      coins: number;
      sessionTime?: string;
    }[] = [];

    // Milestone Blossom Trees (1 for every 4 focus sessions)
    const totalBlossoms = Math.floor(totalTreesPlanted / 4);
    for (let i = 0; i < totalBlossoms; i++) {
      treePool.push({ 
        variety: 'blossom_oak', 
        title: 'Milestone Harvest', 
        actionType: '4 Focus Sessions Milestone',
        coins: 25,
        sessionTime: '100m+ Focused'
      });
    }

    // Lessons Mastered (Broadleaf Oaks)
    for (let i = 0; i < completedTopicsCount; i++) {
      treePool.push({ 
        variety: 'oak', 
        title: `Topic ${i + 1} Mastered`, 
        actionType: 'Curriculum Lesson Completed',
        coins: 10,
        sessionTime: 'Lesson Verified'
      });
    }

    // Fill remaining with Pines & Spruces
    while (treePool.length < visualCount) {
      const idx = treePool.length;
      if (idx % 3 === 0) {
        treePool.push({ 
          variety: 'spruce', 
          title: 'Practice Cleared', 
          actionType: 'Quiz Review Passed',
          coins: 5,
          sessionTime: 'Score Verified'
        });
      } else {
        treePool.push({ 
          variety: 'pine', 
          title: 'Deep Focus Session', 
          actionType: '25m Focus Session Done',
          coins: 5,
          sessionTime: '25m Focused'
        });
      }
    }

    const placed = [];
    for (let i = 0; i < visualCount; i++) {
      const item = treePool[i] || { 
        variety: 'pine' as TreeVariety, 
        title: 'Focus Session', 
        actionType: '25m Focus Session Done', 
        coins: 5, 
        sessionTime: '25m Focused' 
      };

      const rX = pseudoRandom(i * 19 + 3);
      const rY = pseudoRandom(i * 37 + 11);
      const rScale = pseudoRandom(i * 47 + 17);

      const leftPct = 4 + rX * 88;
      const topPct = 8 + rY * 68;

      const scaleFactor = 0.75 + (topPct / 80) * 0.4 + (rScale * 0.15);
      const size = Math.round(30 * scaleFactor);

      placed.push({
        id: i,
        variety: item.variety,
        title: item.title,
        actionType: item.actionType,
        coins: item.coins,
        sessionTime: item.sessionTime,
        left: leftPct,
        top: topPct,
        size,
        zIndex: Math.round(topPct * 10)
      });
    }

    placed.sort((a, b) => a.zIndex - b.zIndex);
    return placed;
  }, [visualCount, totalTreesPlanted, completedTopicsCount]);

  const progressPct = totalTopics > 0 ? Math.round((completedTopicsCount / totalTopics) * 100) : 0;

  return (
    <div className="bg-sidebar border border-border rounded-md p-4 min-h-[220px] flex flex-col justify-between">
      {/* Clean Header */}
      <div className="flex items-center justify-between mb-2 text-[11px] text-text-muted">
        <span className="font-bold uppercase tracking-wider text-text-heading">Your Forest</span>
        <span className="font-mono font-bold text-accent">
          {totalTreesPlanted} 🌲 {extraCount > 0 && `(+${extraCount})`}
        </span>
      </div>

      {/* Landscape Meadow */}
      <div className="relative w-full h-44 sm:h-52 bg-background/60 rounded-md border border-border/70 overflow-visible select-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.02] to-accent/[0.06] pointer-events-none rounded-md" />
        <div className="absolute bottom-0 inset-x-0 h-10 bg-accent/[0.04] rounded-t-[50%] pointer-events-none opacity-40" />
        <div className="absolute bottom-3 inset-x-4 h-16 bg-accent/[0.03] rounded-t-[40%] pointer-events-none opacity-30" />

        {forestPlacements.length > 0 ? (
          forestPlacements.map((tree) => (
            <div
              key={tree.id}
              className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{
                left: `${tree.left}%`,
                top: `${tree.top}%`,
                zIndex: tree.zIndex
              }}
            >
              <div className="transition-transform group-hover:scale-125 duration-150">
                <TreeIllustration variety={tree.variety} size={tree.size} />
              </div>

              {/* Rich Floating Tooltip on Hover */}
              <div 
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-background border border-border shadow-xl rounded-md p-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-[999] text-left animate-in fade-in zoom-in-95"
              >
                <div className="flex items-center justify-between gap-1 pb-1 mb-1 border-b border-border/50">
                  <span className="font-bold text-[11.5px] text-text-heading truncate">
                    {tree.title}
                  </span>
                  <span className="text-[10px] font-mono text-accent font-bold shrink-0">
                    +{tree.coins}c
                  </span>
                </div>

                <div className="space-y-0.5 text-[10px] text-text-muted">
                  <div className="text-text-primary font-medium truncate">
                    {tree.actionType}
                  </div>
                  {tree.sessionTime && (
                    <div className="flex items-center gap-1 opacity-80">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{tree.sessionTime}</span>
                    </div>
                  )}
                </div>

                {/* Micro tooltip arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-background" />
              </div>
            </div>
          ))
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-text-muted text-[11.5px] p-4 text-center">
            <TreeIllustration stage="sprout" size={30} />
            <span className="mt-2 font-medium">Your forest is ready for its first tree.</span>
          </div>
        )}
      </div>

      {/* Clean Topic Progress Footer */}
      {totalTopics > 0 && (
        <div className="mt-3 pt-2.5 border-t border-border/60 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-text-muted">
            <span>Curriculum Mastery</span>
            <span className="font-mono text-text-heading font-semibold">
              {completedTopicsCount} / {totalTopics} Topics ({progressPct}%)
            </span>
          </div>
          <div className="w-full bg-background border border-border h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-accent h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
