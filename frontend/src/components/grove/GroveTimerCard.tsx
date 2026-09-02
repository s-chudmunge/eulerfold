'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { usePersistentGroveTimer } from './usePersistentGroveTimer';
import { TreeIllustration } from './TreeIllustration';

interface GroveTimerCardProps {
  roadmapId: number | string;
  roadmapSlug?: string;
  onSessionComplete?: (mins: number) => void;
}

export function GroveTimerCard({ roadmapId, roadmapSlug, onSessionComplete }: GroveTimerCardProps) {
  const {
    durationMins,
    formattedTime,
    progressPercent,
    treeStage,
    stageLabel,
    isActive,
    isCompletedSession,
    startTimer,
    pauseTimer,
    resetTimer
  } = usePersistentGroveTimer(roadmapId, roadmapSlug, onSessionComplete);

  return (
    <div className="bg-sidebar border border-border rounded-md p-4 flex flex-col items-center justify-between text-center h-full min-h-[220px]">
      <div className="w-full flex items-center justify-between text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">
        <span>Focus Timer</span>
        {isActive ? (
          <span className="flex items-center gap-1 text-emerald-600 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Active
          </span>
        ) : (
          <span className="text-[10px] text-text-muted font-normal">Idle</span>
        )}
      </div>

      {/* Growing Tree Centerpiece */}
      <div className="my-auto py-2 flex flex-col items-center justify-center">
        <div className="p-1 rounded-full bg-background/50 border border-border/40 shadow-xs mb-1">
          <TreeIllustration stage={treeStage} size={38} />
        </div>
        
        <div className="text-2xl font-bold font-mono text-text-heading tracking-tight">
          {formattedTime}
        </div>
        
        <span className="text-[10.5px] font-medium text-text-muted mt-0.5">
          {isActive ? `${stageLabel} (${progressPercent}%)` : 'Select duration to start growing'}
        </span>

        {/* Growth Progress Bar */}
        {isActive && (
          <div className="w-28 h-1 bg-background border border-border rounded-full overflow-hidden mt-1.5">
            <div 
              className="bg-accent h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Preset / Action Controls */}
      <div className="w-full pt-2 flex items-center justify-center gap-2">
        {!isActive ? (
          <>
            <button
              onClick={() => startTimer(15)}
              className="px-2.5 py-1 bg-background hover:bg-callout-bg border border-border rounded-md text-[10.5px] font-bold text-text-heading transition-colors"
            >
              15m
            </button>
            <button
              onClick={() => startTimer(25)}
              className="px-3 py-1 bg-accent text-background rounded-md text-[11px] font-bold hover:opacity-90 transition-opacity"
            >
              Start (25m)
            </button>
            <button
              onClick={() => startTimer(45)}
              className="px-2.5 py-1 bg-background hover:bg-callout-bg border border-border rounded-md text-[10.5px] font-bold text-text-heading transition-colors"
            >
              45m
            </button>
          </>
        ) : (
          <>
            <button
              onClick={pauseTimer}
              className="px-3 py-1 bg-background border border-border rounded-md text-[11px] font-bold text-text-heading hover:bg-callout-bg transition-colors"
            >
              Pause
            </button>
            <button
              onClick={resetTimer}
              className="p-1 rounded-md text-text-muted hover:text-red-500 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {isCompletedSession && (
        <p className="text-[10.5px] text-emerald-600 font-bold mt-1.5 animate-in fade-in duration-200">
          🌸 Harvest complete! Blooming tree planted in grove.
        </p>
      )}
    </div>
  );
}
