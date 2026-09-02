'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { sessionsAPI, getDeduplicatedSession } from '@/lib/api';
import { dispatchTreeHarvest } from './harvestUtils';
import { TreeStage } from './types';

interface PersistentTimerState {
  targetEndTime: number | null;
  durationMins: number;
  roadmapId: number | string;
  roadmapSlug?: string;
  isActive: boolean;
}

const TIMER_STORAGE_KEY = 'eulerfold_active_focus_timer';

export function usePersistentGroveTimer(
  roadmapId: number | string, 
  roadmapSlug?: string, 
  onSessionComplete?: (mins: number) => void
) {
  const [durationMins, setDurationMins] = useState(25);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isCompletedSession, setIsCompletedSession] = useState(false);

  // 1. Recover active timer from localStorage across route changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(TIMER_STORAGE_KEY);
      if (saved) {
        const state: PersistentTimerState = JSON.parse(saved);
        if (state.isActive && state.targetEndTime) {
          const now = Date.now();
          const remainingSecs = Math.max(0, Math.round((state.targetEndTime - now) / 1000));
          if (remainingSecs > 0) {
            setDurationMins(state.durationMins);
            setSecondsRemaining(remainingSecs);
            setIsActive(true);
          } else {
            // Timer expired while page was closed / reloaded
            localStorage.removeItem(TIMER_STORAGE_KEY);
            handleFinishSession(state.durationMins, state.roadmapId);
          }
        }
      }
    } catch {}
  }, []);

  const handleFinishSession = (mins: number, targetRoadmapId?: number | string) => {
    setIsActive(false);
    setIsCompletedSession(true);
    localStorage.removeItem(TIMER_STORAGE_KEY);

    const focusMinutes = mins;
    const durationSeconds = focusMinutes * 60;
    const rId = targetRoadmapId || roadmapId;

    // Direct course storage record write to guarantee local roadmap grove increments
    if (rId) {
      try {
        const courseKey = `eulerfold_grove_course_${rId}`;
        const saved = localStorage.getItem(courseKey);
        const parsed = saved ? JSON.parse(saved) : { totalMinutes: 0 };
        const updatedMinutes = (parsed.totalMinutes || 0) + focusMinutes;
        localStorage.setItem(courseKey, JSON.stringify({ totalMinutes: updatedMinutes }));
      } catch (err) {
        console.error('[FocusGrove] Error saving course minutes:', err);
      }
    }

    // 1. Log directly to database
    getDeduplicatedSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        try {
          sessionsAPI.logSession(durationSeconds, session.access_token);
          console.log(`[FocusGrove] Session logged successfully: ${durationSeconds}s`);
        } catch (err) {
          console.error('[FocusGrove] Error logging session:', err);
        }
      }
    });

    // 2. Dispatch global harvest event with roadmapId and duration
    dispatchTreeHarvest({
      type: 'focus_session',
      title: `${focusMinutes}m Deep Focus Session`,
      treesEarned: 1,
      coinsEarned: 5,
      roadmapId: rId,
      durationMins: focusMinutes
    } as any);

    if (onSessionComplete) {
      onSessionComplete(focusMinutes);
    }
  };

  // 2. Timer tick loop
  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (isActive && secondsRemaining === 0) {
      handleFinishSession(durationMins, roadmapId);
    }

    return () => clearInterval(interval);
  }, [isActive, secondsRemaining, durationMins, roadmapId]);

  const startTimer = (mins: number) => {
    const targetEnd = Date.now() + mins * 60 * 1000;
    setDurationMins(mins);
    setSecondsRemaining(mins * 60);
    setIsActive(true);
    setIsCompletedSession(false);

    try {
      const state: PersistentTimerState = {
        targetEndTime: targetEnd,
        durationMins: mins,
        roadmapId,
        roadmapSlug: roadmapSlug || (typeof roadmapId === 'string' ? roadmapId : undefined),
        isActive: true
      };
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
    } catch {}
  };

  const pauseTimer = () => {
    setIsActive(false);
    try {
      localStorage.removeItem(TIMER_STORAGE_KEY);
    } catch {}
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsRemaining(durationMins * 60);
    setIsCompletedSession(false);
    try {
      localStorage.removeItem(TIMER_STORAGE_KEY);
    } catch {}
  };

  const progressPercent = useMemo(() => {
    const totalSecs = durationMins * 60;
    return Math.min(100, Math.max(0, Math.round(((totalSecs - secondsRemaining) / totalSecs) * 100)));
  }, [durationMins, secondsRemaining]);

  const treeStage: TreeStage = useMemo(() => {
    if (!isActive && !isCompletedSession) return 'seed';
    if (isCompletedSession || progressPercent >= 100) return 'blooming';
    if (progressPercent >= 75) return 'mature';
    if (progressPercent >= 40) return 'sapling';
    if (progressPercent >= 10) return 'sprout';
    return 'seed';
  }, [isActive, isCompletedSession, progressPercent]);

  const stageLabel = useMemo(() => {
    switch(treeStage) {
      case 'seed': return 'Planted Seed';
      case 'sprout': return 'Sprouting (10%+)';
      case 'sapling': return 'Growing Sapling (40%+)';
      case 'mature': return 'Mature Pine (75%+)';
      case 'blooming': return 'Golden Harvest Blooming (100%)';
    }
  }, [treeStage]);

  const formattedTime = useMemo(() => {
    const m = Math.floor(secondsRemaining / 60);
    const s = secondsRemaining % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, [secondsRemaining]);

  return {
    durationMins,
    secondsRemaining,
    progressPercent,
    treeStage,
    stageLabel,
    formattedTime,
    isActive,
    isCompletedSession,
    startTimer,
    pauseTimer,
    resetTimer
  };
}
