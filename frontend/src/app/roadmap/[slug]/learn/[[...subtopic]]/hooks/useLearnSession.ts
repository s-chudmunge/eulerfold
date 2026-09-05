import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { RoadmapData, roadmapsAPI, submissionsAPI } from '@/lib/api';

/**
 * Helper to find the first topic that is NOT completed.
 * If all are completed, falls back to the saved last_position or (0, 0).
 */
export function findFirstUncompletedTopic(
  modules: any[],
  completedSet: Set<string>,
  fallbackLastPos?: { mIdx: number; tIdx: number }
): { mIdx: number; tIdx: number } | null {
  if (!modules || modules.length === 0) {
    return null;
  }

  for (let m = 0; m < modules.length; m++) {
    const topics = modules[m]?.topics || [];
    for (let t = 0; t < topics.length; t++) {
      const key = `${m + 1}-${t}`;
      if (!completedSet.has(key)) {
        return { mIdx: m, tIdx: t };
      }
    }
  }

  return fallbackLastPos || null;
}

interface UseLearnSessionProps {
  id: string;
  initialRoadmap?: RoadmapData | null;
}

export function useLearnSession({ id, initialRoadmap }: UseLearnSessionProps) {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(initialRoadmap || null);
  const [loading, setLoading] = useState(!initialRoadmap);
  const [isFreshRoadmapLoaded, setIsFreshRoadmapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  // Position & completion states
  const [currentModuleIndex, setCurrentModuleIndex] = useState(initialRoadmap?.last_position?.mIdx || 0);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(initialRoadmap?.last_position?.tIdx || 0);
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(
    new Set(initialRoadmap?.completed_topic_ids || [])
  );
  const [completedPracticeModules, setCompletedPracticeModules] = useState<Set<number>>(new Set());
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

  // Modal & UI states
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [certificateId, setCertificateId] = useState<string | null>(null);
  const [coinToast, setCoinToast] = useState<{ show: boolean; amount?: number; message?: string; type?: 'coin' | 'encouragement' | 'info' } | null>(null);
  const [viewMode, setViewMode] = useState<'video' | 'practice'>('video');
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [resourceCardIdx, setResourceCardIdx] = useState(0);

  const refreshProfile = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('*')
          .eq('supabase_uid', session.user.id)
          .single();
        if (userData) setProfile(userData);
      }
    } catch (e) {
      console.error('Error refreshing profile:', e);
    }
  }, []);

  const fetchCompletedPractices = useCallback(async () => {
    if (!roadmap?.id) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: mcqData } = await supabase
        .from('mcq_sessions')
        .select('subtopic_id')
        .eq('roadmap_id', roadmap.id)
        .eq('user_id', session.user.id)
        .eq('status', 'completed');

      if (mcqData) {
        const subtopicIds = new Set(mcqData.map((d: any) => d.subtopic_id));
        const completedMods = new Set<number>();

        roadmap.roadmap_plan?.modules?.forEach((module: any, idx: number) => {
          let hasCompleted = false;
          module.topics?.forEach((topic: any) => {
            if (topic.uuid && subtopicIds.has(topic.uuid)) {
              hasCompleted = true;
            }
          });
          if (hasCompleted) {
            completedMods.add(idx);
          }
        });
        setCompletedPracticeModules(completedMods);
      }
    } catch (err) {
      console.error('Error fetching completed practices:', err);
    }
  }, [roadmap]);

  // Load authenticated roadmap data & position
  const loadAuthenticatedRoadmap = useCallback(async () => {
    if (!id) return;
    try {
      const data = await roadmapsAPI.getRoadmapBySlug(id);
      setRoadmap(data);
      setIsFreshRoadmapLoaded(true);

      const completedSet = new Set<string>(data.completed_topic_ids || []);
      setCompletedTopics(completedSet);

      // Auto-navigate to first uncompleted topic if available
      const modules = data.roadmap_plan?.modules || [];
      const nextUncompleted = findFirstUncompletedTopic(modules, completedSet, data.last_position);
      if (nextUncompleted) {
        setCurrentModuleIndex(nextUncompleted.mIdx);
        setCurrentTopicIndex(nextUncompleted.tIdx);
      } else if (data.last_position) {
        setCurrentModuleIndex(data.last_position.mIdx || 0);
        setCurrentTopicIndex(data.last_position.tIdx || 0);
      }

      // Submissions
      if (data.id) {
        const subs = await submissionsAPI.listSubmissions(data.id);
        if (subs?.submissions) setSubmissions(subs.submissions);
      }
    } catch (err: any) {
      console.error('Failed to load authenticated roadmap session:', err);
      if (!initialRoadmap) {
        setError(err.message || 'Failed to load course session');
      }
    } finally {
      setLoading(false);
    }
  }, [id, initialRoadmap]);

  useEffect(() => {
    loadAuthenticatedRoadmap();
    refreshProfile();
  }, [loadAuthenticatedRoadmap, refreshProfile]);

  useEffect(() => {
    if (roadmap?.id) {
      fetchCompletedPractices();
    }
  }, [fetchCompletedPractices, roadmap?.id]);

  // Sync active video when module/topic changes
  useEffect(() => {
    if (!roadmap || !roadmap.roadmap_plan?.modules) return;
    const currentModule = roadmap.roadmap_plan.modules[currentModuleIndex];
    const currentTopic = currentModule?.topics?.[currentTopicIndex];
    setResourceCardIdx(0);
    setActiveVideoId(currentTopic?.youtube_video_id || null);
  }, [currentModuleIndex, currentTopicIndex, roadmap]);

  const updateProgressOnServer = async (mIdx: number, tIdx: number, isCompleted: boolean = false) => {
    if (!roadmap || !roadmap.id) return;
    if (isCompleted) {
      const key = `${mIdx + 1}-${tIdx}`;
      setCompletedTopics(prev => new Set(prev).add(key));
    }

    try {
      const response = await roadmapsAPI.updateProgress(roadmap.id, {
        module_number: mIdx + 1,
        topic_index: tIdx,
        completed: isCompleted
      });

      if (isCompleted && response.coins_earned && response.coins_earned > 0) {
        setCoinToast({ show: true, amount: response.coins_earned });
        setTimeout(() => setCoinToast(null), 4000);
      }
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  const handleTopicChange = (mIdx: number, tIdx: number) => {
    setCurrentModuleIndex(mIdx);
    setCurrentTopicIndex(tIdx);
    const nextTopic = roadmap?.roadmap_plan?.modules?.[mIdx]?.topics?.[tIdx];
    setActiveVideoId(nextTopic?.youtube_video_id || null);
    setViewMode('video');
    const isCurrentlyCompleted = completedTopics.has(`${mIdx + 1}-${tIdx}`);
    updateProgressOnServer(mIdx, tIdx, isCurrentlyCompleted);
  };

  const handleTopicMastered = async (coins: number) => {
    const cheers = [
      `Spot on! +${coins} EulerCoin.`,
      `Nice catch! +${coins} EulerCoin.`,
      `Nailed it! +${coins} EulerCoin.`,
      `Boom! +${coins} EulerCoin.`
    ];
    const picked = cheers[Math.floor(Math.random() * cheers.length)];

    setCoinToast({ 
      show: true, 
      amount: coins, 
      type: 'coin', 
      message: picked 
    });
    setTimeout(() => setCoinToast(null), 4000);

    const key = `${currentModuleIndex + 1}-${currentTopicIndex}`;
    const newCompleted = new Set(completedTopics).add(key);
    setCompletedTopics(newCompleted);

    // Save progress to server
    await updateProgressOnServer(currentModuleIndex, currentTopicIndex, true);

    const modules = roadmap?.roadmap_plan?.modules || [];
    const currentModTopics = modules[currentModuleIndex]?.topics || [];
    const isModuleFinished = currentModTopics.every((_: any, tIdx: number) => newCompleted.has(`${currentModuleIndex + 1}-${tIdx}`));

    if (isModuleFinished) {
      setCoinToast({
        show: true,
        amount: coins,
        type: 'coin',
        message: `Module ${currentModuleIndex + 1} complete! Incredible work locking in all lessons.`
      });
      setTimeout(() => setCoinToast(null), 6000);
      return;
    }

    // Automatically navigate to next uncompleted topic
    const nextUncompleted = findFirstUncompletedTopic(modules, newCompleted);
    if (nextUncompleted && (nextUncompleted.mIdx !== currentModuleIndex || nextUncompleted.tIdx !== currentTopicIndex)) {
      handleTopicChange(nextUncompleted.mIdx, nextUncompleted.tIdx);
    }
  };

  const handleMarkAsCompleted = async () => {
    setIsUpdatingProgress(true);
    await updateProgressOnServer(currentModuleIndex, currentTopicIndex, true);
    setIsUpdatingProgress(false);
  };

  // Certificate check
  const displayPercent = useMemo(() => {
    const serverPercent = roadmap?.progress?.percent || 0;
    const serverCompletedTopics = roadmap?.progress?.completed_topics || 0;
    const totalTopics = roadmap?.progress?.total_topics || 1;
    const serverCompletedPracticeModules = roadmap?.progress?.completed_practice_sessions || 0;
    const totalModules = roadmap?.progress?.required_practice_sessions || roadmap?.roadmap_plan?.modules?.length || 1;

    const localTopicDelta = Math.max(0, completedTopics.size - serverCompletedTopics);
    const topicDeltaPercent = (localTopicDelta / totalTopics) * 30;

    const localPracticeDelta = Math.max(0, completedPracticeModules.size - serverCompletedPracticeModules);
    const practiceDeltaPercent = (localPracticeDelta / totalModules) * 30;

    return Math.min(100, Math.round(serverPercent + topicDeltaPercent + practiceDeltaPercent));
  }, [roadmap?.progress, roadmap?.roadmap_plan?.modules?.length, completedTopics.size, completedPracticeModules.size]);

  useEffect(() => {
    if (displayPercent >= 98 && roadmap?.id) {
      let timeoutId: NodeJS.Timeout;
      roadmapsAPI.getRoadmapById(roadmap.id).catch(console.error);

      const checkCert = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data } = await supabase
          .from('certificates')
          .select('credential_id')
          .eq('roadmap_id', roadmap.id)
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (data && data.credential_id) {
          setCertificateId(data.credential_id);
        } else {
          timeoutId = setTimeout(checkCert, 3000);
        }
      };
      checkCert();
      return () => clearTimeout(timeoutId);
    }
  }, [displayPercent, roadmap?.id]);

  return {
    roadmap,
    setRoadmap,
    loading,
    error,
    profile,
    refreshProfile,
    currentModuleIndex,
    setCurrentModuleIndex,
    currentTopicIndex,
    setCurrentTopicIndex,
    completedTopics,
    completedPracticeModules,
    isUpdatingProgress,
    submissions,
    setSubmissions,
    certificateId,
    coinToast,
    setCoinToast,
    viewMode,
    setViewMode,
    activeVideoId,
    setActiveVideoId,
    resourceCardIdx,
    setResourceCardIdx,
    displayPercent,
    handleTopicChange,
    handleTopicMastered,
    handleMarkAsCompleted,
    fetchCompletedPractices,
    isFreshRoadmapLoaded,
  };
}
