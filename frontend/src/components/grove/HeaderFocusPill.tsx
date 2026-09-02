'use client';

import React, { useState, useEffect } from 'react';
import { TreePine } from 'lucide-react';
import Link from 'next/link';

interface PersistentTimerState {
  targetEndTime: number | null;
  durationMins: number;
  roadmapId: number | string;
  roadmapSlug?: string;
  isActive: boolean;
}

const TIMER_STORAGE_KEY = 'eulerfold_active_focus_timer';

export function HeaderFocusPill() {
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [targetSlug, setTargetSlug] = useState<string | null>(null);

  useEffect(() => {
    const checkTimer = () => {
      try {
        const saved = localStorage.getItem(TIMER_STORAGE_KEY);
        if (saved) {
          const state: PersistentTimerState = JSON.parse(saved);
          if (state.isActive && state.targetEndTime) {
            const now = Date.now();
            const remaining = Math.max(0, Math.round((state.targetEndTime - now) / 1000));
            if (remaining > 0) {
              setSecondsRemaining(remaining);
              // Prefer readable string slug over numeric internal id
              const slug = state.roadmapSlug || (state.roadmapId ? String(state.roadmapId) : null);
              setTargetSlug(slug);
              return;
            } else {
              localStorage.removeItem(TIMER_STORAGE_KEY);
            }
          }
        }
        setSecondsRemaining(null);
        setTargetSlug(null);
      } catch {
        setSecondsRemaining(null);
      }
    };

    checkTimer();
    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  if (secondsRemaining === null || secondsRemaining <= 0) {
    return null;
  }

  const m = Math.floor(secondsRemaining / 60);
  const s = secondsRemaining % 60;
  const formattedTime = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  const targetUrl = targetSlug ? `/roadmap/${targetSlug}` : '/dashboard';

  return (
    <Link
      href={targetUrl}
      title="Active Focus Session (Click to view course)"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/10 hover:bg-accent/15 border border-accent/25 text-accent text-[11px] font-mono font-bold transition-all animate-in fade-in zoom-in-95 duration-200"
    >
      <TreePine className="w-3.5 h-3.5 animate-pulse shrink-0" />
      <span>{formattedTime}</span>
    </Link>
  );
}
