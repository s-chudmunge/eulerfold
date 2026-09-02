'use client';

import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { TreeIllustration } from '@/components/roadmap/FocusGrove';

interface FocusTimerBannerProps {
  isTimerActive: boolean;
  secondsRemaining: number;
  timerDurationMins: number;
  timerProgressPercent: number;
  currentTimerTreeStage: any;
  tabDistracted: boolean;
  formatTime: (secs: number) => string;
  onStartTimer: (mins: number) => void;
  onPauseTimer: () => void;
  onResetTimer: () => void;
}

export function FocusTimerBanner({
  isTimerActive,
  secondsRemaining,
  timerDurationMins,
  timerProgressPercent,
  currentTimerTreeStage,
  tabDistracted,
  formatTime,
  onStartTimer,
  onPauseTimer,
  onResetTimer
}: FocusTimerBannerProps) {
  return (
    <div className="p-3 bg-sidebar border-b border-border flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <TreeIllustration stage={currentTimerTreeStage} size={40} />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[14px] font-bold text-text-heading">
              {formatTime(secondsRemaining)}
            </span>
            <span className="text-[10px] text-text-muted">
              ({timerDurationMins}m session)
            </span>
          </div>
          <div className="w-32 h-1.5 bg-background rounded-full overflow-hidden mt-1">
            <div 
              className="h-full bg-accent transition-all duration-500 rounded-full"
              style={{ width: `${timerProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {tabDistracted && isTimerActive && (
        <span className="text-[10px] text-amber-600 font-bold animate-pulse hidden sm:inline">
          ⚠️ Stay on tab to grow tree!
        </span>
      )}

      <div className="flex items-center gap-1.5">
        {!isTimerActive ? (
          <>
            <button
              onClick={() => onStartTimer(25)}
              className="px-3 py-1.5 bg-accent text-background rounded-md text-[11px] font-bold hover:opacity-90 transition-opacity"
            >
              Start (25m)
            </button>
            <button
              onClick={() => onStartTimer(40)}
              className="px-2.5 py-1.5 bg-background hover:bg-callout-bg border border-border rounded-md text-[11px] font-bold text-text-heading transition-colors"
            >
              40m
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onPauseTimer}
              className="px-3 py-1.5 bg-background border border-border rounded-md text-[11px] font-bold text-text-heading hover:bg-callout-bg transition-colors flex items-center gap-1"
            >
              <Pause className="w-3 h-3" />
              <span>Pause</span>
            </button>
            <button
              onClick={onResetTimer}
              className="p-1.5 rounded-md text-text-muted hover:text-red-500 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
