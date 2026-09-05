"use client";

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { RoadmapData } from '@/lib/api';
import Link from 'next/link';

import CourseHeader from '@/components/CourseHeader';
import MCQPractice from '@/components/roadmap/MCQPractice';
import { GoldfishIcon } from '@/components/goldfish/GoldfishAssistant';
import { Sparkles, X } from 'lucide-react';

import LearnSidebar from '@/components/roadmap/learn/LearnSidebar';
import VideoReferenceArea from '@/components/roadmap/learn/VideoReferenceArea';
import TopicContentDetails from '@/components/roadmap/learn/TopicContentDetails';
import TopicCheckpoint from '@/components/roadmap/learn/TopicCheckpoint';
import CourseCompletionBanner from '@/components/roadmap/learn/CourseCompletionBanner';
import { GroveTimerCard } from '@/components/grove/GroveTimerCard';

import { useLearnSession } from './hooks/useLearnSession';
import LearnModals from './components/LearnModals';

export default function LearnClient({
  id: propId,
  slug: _subtopicSlug,
  initialRoadmap
}: {
  id?: string;
  slug?: string[];
  initialRoadmap?: RoadmapData | null;
}) {
  const params = useParams();
  const id = propId || (params?.slug as string);

  // Core learning session hook
  const {
    roadmap,
    setRoadmap,
    loading,
    error,
    profile,
    refreshProfile,
    currentModuleIndex,
    currentTopicIndex,
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
    isFreshRoadmapLoaded
  } = useLearnSession({ id, initialRoadmap });

  // Local UI modal states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [unlockTargetModuleNumber, setUnlockTargetModuleNumber] = useState<number>(2);

  const handleOpenUnlockModal = (targetModNum?: number) => {
    const target = targetModNum || (currentModuleIndex + 2);
    setUnlockTargetModuleNumber(target);
    setIsUnlockModalOpen(true);
  };

  const handleModuleUnlocked = (updatedPlan: any) => {
    if (updatedPlan) {
      setRoadmap((prev: any) => prev ? { ...prev, roadmap_plan: updatedPlan } : null);
      // Automatically switch to the first topic of the newly unlocked module
      const targetMIdx = unlockTargetModuleNumber - 1;
      if (updatedPlan.modules?.[targetMIdx]?.topics?.length > 0) {
        handleTopicChange(targetMIdx, 0);
      }
    }
  };

  // Goldfish Assistant State
  const [isGoldfishOpen, setIsGoldfishOpen] = useState(false);
  const [goldfishTab, setGoldfishTab] = useState<'chat' | 'reading' | 'video' | 'calendar'>('chat');
  const [timerState, setTimerState] = useState<{
    isActive: boolean;
    secondsRemaining: number;
    durationMins: number;
  }>({
    isActive: false,
    secondsRemaining: 25 * 60,
    durationMins: 25
  });

  const handleOpenGoldfish = (tab: 'chat' | 'reading' | 'video' | 'calendar' = 'chat') => {
    setGoldfishTab(tab);
    setIsGoldfishOpen(true);
  };

  const handleGoldfishVideoReplaced = (newVideoId: string, newVideoTitle: string, duration?: number) => {
    setActiveVideoId(newVideoId);
    if (roadmap && roadmap.roadmap_plan?.modules) {
      const updatedRoadmap = { ...roadmap };
      const targetTopic = updatedRoadmap.roadmap_plan.modules[currentModuleIndex]?.topics[currentTopicIndex];
      if (targetTopic) {
        targetTopic.youtube_video_id = newVideoId;
        targetTopic.youtube_video_title = newVideoTitle;
        if (duration) targetTopic.duration = duration;
      }
      setRoadmap(updatedRoadmap);
    }
  };

  const handleGoldfishResourceAdded = (newResources: any[]) => {
    if (roadmap && roadmap.roadmap_plan?.modules) {
      const updatedRoadmap = { ...roadmap };
      const targetModule = updatedRoadmap.roadmap_plan.modules[currentModuleIndex];
      if (targetModule) {
        targetModule.resources = newResources;
      }
      setRoadmap(updatedRoadmap);
    }
  };

  const activeTopicResources = useMemo(() => {
    if (!roadmap || !roadmap.roadmap_plan?.modules?.[currentModuleIndex]) return [];
    const module = roadmap.roadmap_plan.modules[currentModuleIndex];
    const topic = module?.topics?.[currentTopicIndex];
    if (topic?.resources && Array.isArray(topic.resources) && topic.resources.length > 0) {
      return topic.resources;
    }
    if (module?.resources && Array.isArray(module.resources) && module.resources.length > 0) {
      return module.resources;
    }
    return [];
  }, [roadmap, currentModuleIndex, currentTopicIndex]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
        <div className="flex justify-center gap-1.5 mb-6">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        <p className="text-[11px] font-bold text-text-muted tracking-wider">Establishing learning session</p>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <h1 className="text-lg font-bold text-text-heading mb-2">Connection error</h1>
          <p className="text-[13px] text-text-muted mb-6">{error || 'Session failed'}</p>
          <Link href={`/roadmap/${roadmap?.slug || id}`} className="bg-text-heading text-background px-5 py-2 rounded-md font-bold text-[12px]">
            Back to Overview
          </Link>
        </div>
      </div>
    );
  }

  const modules = roadmap.roadmap_plan?.modules || [];
  const currentModule = modules[currentModuleIndex];
  const currentTopic = currentModule?.topics?.[currentTopicIndex];
  const isTopicCompleted = completedTopics.has(`${currentModuleIndex + 1}-${currentTopicIndex}`);

  let upNextTopic = null;
  let upNextModuleIdx = -1;
  let upNextTopicIdx = -1;

  if (currentTopicIndex < (currentModule?.topics?.length || 0) - 1) {
    upNextTopic = currentModule.topics[currentTopicIndex + 1];
    upNextModuleIdx = currentModuleIndex;
    upNextTopicIdx = currentTopicIndex + 1;
  } else if (currentModuleIndex < modules.length - 1) {
    upNextTopic = modules[currentModuleIndex + 1].topics?.[0];
    upNextModuleIdx = currentModuleIndex + 1;
    upNextTopicIdx = 0;
  }

  const handleNext = () => {
    if (upNextTopic) {
      handleTopicChange(upNextModuleIdx, upNextTopicIdx);
    }
  };

  const handlePrev = () => {
    if (currentTopicIndex > 0) {
      handleTopicChange(currentModuleIndex, currentTopicIndex - 1);
    } else if (currentModuleIndex > 0) {
      const prevModule = modules[currentModuleIndex - 1];
      handleTopicChange(currentModuleIndex - 1, (prevModule?.topics?.length || 1) - 1);
    }
  };

  const onSidebarTopicChange = (mIdx: number, tIdx: number) => {
    handleTopicChange(mIdx, tIdx);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col text-text-primary overflow-hidden">
      {/* Course Header */}
      <CourseHeader
        roadmapId={id}
        roadmapSlug={roadmap?.slug}
        roadmapTitle={roadmap?.slug || roadmap?.subject}
        unitInfo={`Unit ${currentTopicIndex + 1} of ${currentModule?.topics?.length || 1}`}
        unitTitle={currentTopic?.title}
        onPrev={handlePrev}
        onNext={handleNext}
        hasPrev={currentModuleIndex > 0 || currentTopicIndex > 0}
        hasNext={!!upNextTopic}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenSyllabus={() => setIsSyllabusOpen(true)}
        modules={modules}
        currentModuleIndex={currentModuleIndex}
        onModuleChange={(idx) => handleTopicChange(idx, 0)}
      />

      <div className="flex flex-1 relative overflow-hidden mt-14">
        {/* Modular Sidebar */}
        <LearnSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          modules={modules}
          currentModuleIndex={currentModuleIndex}
          currentTopicIndex={currentTopicIndex}
          completedTopics={completedTopics}
          completedPracticeModules={completedPracticeModules}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onTopicChange={onSidebarTopicChange}
          onOpenHomework={() => setIsHomeworkModalOpen(true)}
          onOpenPlanner={() => setIsTaskModalOpen(true)}
          onOpenGoldfish={handleOpenGoldfish}
          submissions={submissions}
          displayPercent={displayPercent}
          roadmapSlug={roadmap?.slug}
          roadmapId={id}
          onUnlockModule={handleOpenUnlockModal}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full relative overflow-hidden">
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <div className="max-w-[1100px] mx-auto w-full p-4 md:p-8">
              {/* Course Completion Celebration */}
              {displayPercent >= 98 && (
                <CourseCompletionBanner
                  isPro={profile?.is_pro || false}
                  certificateId={certificateId}
                />
              )}

              {viewMode === 'video' ? (
                <div className="animate-in fade-in duration-300">
                  {/* Modular Video & Reference Player */}
                  <VideoReferenceArea
                    activeVideoId={activeVideoId}
                    currentTopic={currentTopic}
                    isTopicCompleted={isTopicCompleted}
                    isUpdatingProgress={isUpdatingProgress}
                    activeTopicResources={activeTopicResources}
                    resourceCardIdx={resourceCardIdx}
                    setResourceCardIdx={setResourceCardIdx}
                    onMarkAsCompleted={handleMarkAsCompleted}
                    onNext={handleNext}
                    onOpenGoldfishVideo={() => handleOpenGoldfish('video')}
                  />

                  {/* Interactive Concept Checkpoint with Auto-Advance */}
                  <TopicCheckpoint
                    roadmapId={roadmap.id}
                    roadmapSlug={roadmap?.slug}
                    moduleNumber={currentModuleIndex + 1}
                    topicIndex={currentTopicIndex}
                    subject={roadmap.subject || roadmap.title || 'Course'}
                    topicTitle={currentTopic?.title || ''}
                    subtopics={(currentTopic?.subtopics || []).map((s: any) => (typeof s === 'string' ? s : (s?.title || s?.name || ''))).filter(Boolean)}
                    isCompleted={isTopicCompleted}
                    isModuleCompleted={
                      Array.isArray(currentModule?.topics) &&
                      currentModule.topics.length > 0 &&
                      currentModule.topics.every((_: any, idx: number) =>
                        completedTopics.has(`${currentModuleIndex + 1}-${idx}`)
                      )
                    }
                    nextModuleLocked={
                      currentModuleIndex < modules.length - 1 &&
                      (modules[currentModuleIndex + 1]?.locked === true ||
                        !modules[currentModuleIndex + 1]?.topics ||
                        modules[currentModuleIndex + 1].topics.length === 0)
                    }
                    onUnlockNextModule={() => handleOpenUnlockModal(currentModuleIndex + 2)}
                    onSuccess={handleTopicMastered}
                    onNext={handleNext}
                  />

                  {/* Modular Topic Details & Reading Resources */}
                  <TopicContentDetails
                    currentTopic={currentTopic}
                    currentModule={currentModule}
                    onOpenGoldfishReading={() => handleOpenGoldfish('reading')}
                  />

                  {/* Focus Pomodoro Timer Section */}
                  <div className="max-w-4xl pt-2 pb-16">
                    <GroveTimerCard
                      roadmapId={roadmap.id}
                      roadmapSlug={roadmap.slug}
                      onSessionComplete={() => {
                        refreshProfile();
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto w-full">
                  <MCQPractice
                    roadmapId={roadmap.id}
                    subtopicId={currentTopic?.uuid || ''}
                    topicName={currentTopic?.title || ''}
                    topics={(currentModule?.topics || []).map((t: any) => t.title || '')}
                    moduleTitle={currentModule?.title || ''}
                    subject={roadmap.subject || roadmap.title || ''}
                    weekNumber={currentModuleIndex + 1}
                    isPro={profile?.is_pro || false}
                    userCredits={profile?.roadmap_credits || 0}
                    onPointsEarned={(amount) => {
                      fetchCompletedPractices();
                    }}
                    onRefreshProfile={refreshProfile}
                    onClose={() => setViewMode('video')}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Floating Goldfish Button with Interactive Thought Bubble */}
      <div className="fixed bottom-6 right-6 z-[110] flex flex-col items-end pointer-events-none">
        {/* Thought Bubble / Co-Pilot Communication */}
        {coinToast && (
          <div className="pointer-events-auto mb-3.5 max-w-[280px] sm:max-w-[320px] animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="relative bg-sidebar border border-border shadow-xl rounded-md p-3.5 text-text-primary backdrop-blur-md">
              {/* Top Bar: Subdued Badge + Close */}
              <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-border/70">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  <span className="font-bold text-[10px] uppercase tracking-wider text-orange-600 dark:text-orange-400">
                    Goldfish
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCoinToast(null)}
                  className="text-text-muted hover:text-text-heading p-0.5 rounded-md hover:bg-background/80 transition-colors"
                  aria-label="Dismiss thought"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Message Content: High contrast text and clear iconography */}
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5 border border-orange-500/20">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <p className="font-medium text-[13px] text-text-heading leading-snug">
                  {coinToast.message || `+${coinToast.amount} EulerCoin.`}
                </p>
              </div>

              {/* Speech bubble pointer notch */}
              <div className="absolute -bottom-1.5 right-7 w-2.5 h-2.5 bg-sidebar border-r border-b border-border rotate-45" />
            </div>
          </div>
        )}

        <button
          onClick={() => handleOpenGoldfish('chat')}
          className="pointer-events-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-sidebar/95 border-2 border-orange-500/40 hover:border-orange-500 shadow-xl hover:shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 group cursor-pointer backdrop-blur-xs relative"
          title="Goldfish AI Co-Pilot"
          aria-label="Goldfish AI Assistant"
        >
          <GoldfishIcon variant="happy" className="w-9 h-9 sm:w-10 sm:h-10 group-hover:rotate-6 transition-transform drop-shadow-sm" />

          {/* Live Timer Countdown Badge on the Icon */}
          {timerState.isActive && (
            <div className="absolute -top-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-[10px] font-bold border-2 border-background shadow-md flex items-center gap-1 animate-in fade-in zoom-in-90 duration-150 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span>
                {Math.floor(timerState.secondsRemaining / 60)}:{(timerState.secondsRemaining % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Modals & Overlays */}
      <LearnModals
        roadmap={roadmap}
        currentModuleIndex={currentModuleIndex}
        currentTopicIndex={currentTopicIndex}
        currentTopic={currentTopic}
        currentModule={currentModule}
        activeVideoId={activeVideoId}
        isGoldfishOpen={isGoldfishOpen}
        setIsGoldfishOpen={setIsGoldfishOpen}
        goldfishTab={goldfishTab}
        onResourceAdded={handleGoldfishResourceAdded}
        onVideoReplaced={handleGoldfishVideoReplaced}
        onTimerStateChange={setTimerState}
        isSyllabusOpen={isSyllabusOpen}
        setIsSyllabusOpen={setIsSyllabusOpen}
        completedTopics={completedTopics}
        onTopicChange={onSidebarTopicChange}
        isTaskModalOpen={isTaskModalOpen}
        setIsTaskModalOpen={setIsTaskModalOpen}
        isHomeworkModalOpen={isHomeworkModalOpen}
        setIsHomeworkModalOpen={setIsHomeworkModalOpen}
        isUnlockModalOpen={isUnlockModalOpen}
        setIsUnlockModalOpen={setIsUnlockModalOpen}
        unlockTargetModuleNumber={unlockTargetModuleNumber}
        onModuleUnlocked={handleModuleUnlocked}
        submissions={submissions}
        setSubmissions={setSubmissions}
        coinToast={coinToast}
        profile={profile}
        isFreshRoadmapLoaded={isFreshRoadmapLoaded}
        setRoadmap={setRoadmap}
      />
    </div>
  );
}
