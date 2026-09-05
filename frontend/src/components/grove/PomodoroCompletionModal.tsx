'use client';

import React, { useState, useEffect } from 'react';
import { TreeIllustration } from '@/components/grove/TreeIllustration';
import { TreeHarvestEvent } from '@/components/grove/types';
import { Sparkles, X, Heart, ArrowRight } from 'lucide-react';

export default function PomodoroCompletionModal() {
  const [activeHarvest, setActiveHarvest] = useState<TreeHarvestEvent | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleTreePlanted = (e: CustomEvent<TreeHarvestEvent>) => {
      const detail = e.detail;
      // Trigger modal for completed pomodoro focus sessions
      if (detail && detail.type === 'focus_session') {
        setActiveHarvest(detail);
        setIsOpen(true);
      }
    };

    window.addEventListener('eulerfold_tree_planted' as any, handleTreePlanted);
    return () => {
      window.removeEventListener('eulerfold_tree_planted' as any, handleTreePlanted);
    };
  }, []);

  if (!isOpen || !activeHarvest) return null;

  const durationMins = activeHarvest.durationMins || 25;
  const coinsEarned = activeHarvest.coinsEarned || 5;

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="w-full max-w-md bg-sidebar border border-border rounded-md shadow-2xl p-6 relative overflow-hidden flex flex-col items-center text-center space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-md text-text-muted hover:text-text-heading hover:bg-background/80 transition-colors border border-transparent hover:border-border"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tree Centerpiece with Warm Badge */}
        <div className="relative mt-2">
          <div className="w-20 h-20 rounded-md bg-background border border-border/80 flex items-center justify-center shadow-sm relative z-10">
            <TreeIllustration stage="blooming" size={54} />
          </div>
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-md bg-accent text-background flex items-center justify-center shadow-xs text-[11px] font-bold z-20">
            🌱
          </span>
        </div>

        {/* Greeting Header */}
        <div className="space-y-1.5 max-w-xs">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-accent/10 border border-accent/20 text-accent text-[11px] font-mono font-semibold uppercase tracking-wider">
            <Heart className="w-3 h-3 fill-accent text-accent" />
            <span>Well Done</span>
          </div>
          <h3 className="text-xl font-bold text-text-heading tracking-tight">
            Focus Tree Planted!
          </h3>
          <p className="text-[13px] text-text-muted leading-relaxed">
            You stayed locked in for a full {durationMins}-minute focus session. Your study tree has grown and taken root in your grove.
          </p>
        </div>

        {/* Reward Pills */}
        <div className="flex items-center justify-center gap-3 w-full max-w-xs">
          <div className="flex-1 py-2 px-3 bg-background border border-border rounded-md flex items-center justify-center gap-2">
            <span className="text-base">🌲</span>
            <div className="text-left">
              <span className="block text-[11px] font-mono text-text-muted leading-none">Tree</span>
              <span className="text-[13px] font-bold text-text-heading leading-tight">+1 Planted</span>
            </div>
          </div>

          <div className="flex-1 py-2 px-3 bg-background border border-border rounded-md flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <div className="text-left">
              <span className="block text-[11px] font-mono text-text-muted leading-none">EulerCoins</span>
              <span className="text-[13px] font-bold text-text-heading leading-tight">+{coinsEarned} Earned</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full pt-1">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full py-2.5 px-4 bg-accent text-background rounded-md text-[13px] font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <span>Keep Up The Momentum</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
