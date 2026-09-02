'use client';

import { useState, useEffect } from 'react';
import { sessionsAPI, getDeduplicatedSession } from '@/lib/api';

export function useGroveStats(completedTopicsCount: number, roadmapId?: number | string) {
  const [courseSessionMinutes, setCourseSessionMinutes] = useState(0);
  const [globalTotalSeconds, setGlobalTotalSeconds] = useState(0);
  const [loading, setLoading] = useState(true);

  const courseStorageKey = roadmapId ? `eulerfold_grove_course_${roadmapId}` : null;

  useEffect(() => {
    const loadStats = () => {
      // 1. Local course stats
      if (courseStorageKey) {
        try {
          const saved = localStorage.getItem(courseStorageKey);
          if (saved) {
            const parsed = JSON.parse(saved);
            setCourseSessionMinutes(parsed.totalMinutes || 0);
          }
        } catch {}
      }

      // 2. Global stats from DB
      getDeduplicatedSession().then(({ data: { session } }) => {
        if (session?.access_token) {
          sessionsAPI.getTotalTime(session.access_token)
            .then((res) => {
              if (res && typeof res.total_seconds === 'number') {
                setGlobalTotalSeconds(res.total_seconds);
              }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      });
    };

    loadStats();

    // Re-fetch when a tree is planted
    const handleHarvest = (e: any) => {
      const harvestRoadmapId = e.detail?.roadmapId;
      const match = !roadmapId || String(harvestRoadmapId) === String(roadmapId);

      if (match) {
        loadStats();
      }
    };

    window.addEventListener('eulerfold_tree_planted' as any, handleHarvest);
    return () => window.removeEventListener('eulerfold_tree_planted' as any, handleHarvest);
  }, [roadmapId, courseStorageKey]);

  const isCourseScoped = Boolean(roadmapId);

  const totalMinutes = isCourseScoped 
    ? courseSessionMinutes 
    : Math.round(globalTotalSeconds / 60);

  const sessionTrees = Math.floor(totalMinutes / 25);
  const totalTreesPlanted = isCourseScoped
    ? (completedTopicsCount + sessionTrees)
    : (Math.floor(Math.round(globalTotalSeconds / 60) / 25) + completedTopicsCount);

  return {
    totalSeconds: isCourseScoped ? totalMinutes * 60 : globalTotalSeconds,
    totalMinutes,
    totalTreesPlanted,
    globalTotalSeconds,
    globalTotalMinutes: Math.round(globalTotalSeconds / 60),
    loading
  };
}
