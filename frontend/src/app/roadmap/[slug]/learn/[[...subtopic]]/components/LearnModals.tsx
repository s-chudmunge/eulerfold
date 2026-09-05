"use client";

import React from 'react';
import GoldfishAssistant from '@/components/goldfish/GoldfishAssistant';
import TaskModal from '@/components/planner/TaskModal';
import HomeworkSubmissionModal from '@/components/roadmap/HomeworkSubmissionModal';
import SkillExtractor from '@/components/roadmap/SkillExtractor';
import SyllabusModal from '../SyllabusModal';
import { Zap } from 'lucide-react';

import UnlockModuleModal from '@/components/roadmap/learn/UnlockModuleModal';

interface LearnModalsProps {
  roadmap: any;
  currentModuleIndex: number;
  currentTopicIndex: number;
  currentTopic: any;
  currentModule: any;
  activeVideoId: string | null;
  isGoldfishOpen: boolean;
  setIsGoldfishOpen: (open: boolean) => void;
  goldfishTab: 'chat' | 'reading' | 'video' | 'calendar';
  onResourceAdded: (resources: any[]) => void;
  onVideoReplaced: (videoId: string, videoTitle: string, duration?: number) => void;
  onTimerStateChange: (state: any) => void;
  isSyllabusOpen: boolean;
  setIsSyllabusOpen: (open: boolean) => void;
  completedTopics: Set<string>;
  onTopicChange: (mIdx: number, tIdx: number) => void;
  isTaskModalOpen: boolean;
  setIsTaskModalOpen: (open: boolean) => void;
  isHomeworkModalOpen: boolean;
  setIsHomeworkModalOpen: (open: boolean) => void;
  isUnlockModalOpen: boolean;
  setIsUnlockModalOpen: (open: boolean) => void;
  unlockTargetModuleNumber: number;
  onModuleUnlocked: (updatedPlan: any) => void;
  submissions: any[];
  setSubmissions: (subs: any[]) => void;
  coinToast?: any;
  profile: any;
  isFreshRoadmapLoaded: boolean;
  setRoadmap: React.Dispatch<React.SetStateAction<any>>;
}

export default function LearnModals({
  roadmap,
  currentModuleIndex,
  currentTopicIndex,
  currentTopic,
  currentModule,
  activeVideoId,
  isGoldfishOpen,
  setIsGoldfishOpen,
  goldfishTab,
  onResourceAdded,
  onVideoReplaced,
  onTimerStateChange,
  isSyllabusOpen,
  setIsSyllabusOpen,
  completedTopics,
  onTopicChange,
  isTaskModalOpen,
  setIsTaskModalOpen,
  isHomeworkModalOpen,
  setIsHomeworkModalOpen,
  isUnlockModalOpen,
  setIsUnlockModalOpen,
  unlockTargetModuleNumber,
  onModuleUnlocked,
  submissions,
  setSubmissions,
  profile,
  isFreshRoadmapLoaded,
  setRoadmap
}: LearnModalsProps) {
  if (!roadmap) return null;

  const modules = roadmap.roadmap_plan?.modules || [];

  return (
    <>
      {/* Goldfish Co-Pilot Modal */}
      <GoldfishAssistant
        isOpen={isGoldfishOpen}
        onClose={() => setIsGoldfishOpen(false)}
        roadmapId={roadmap.id}
        roadmapSlug={roadmap.slug}
        roadmapTitle={roadmap.subject || roadmap.title}
        currentModuleIndex={currentModuleIndex}
        currentTopicIndex={currentTopicIndex}
        currentTopicTitle={currentTopic?.title}
        currentModuleTitle={currentModule?.title}
        currentVideoTitle={currentTopic?.youtube_video_title}
        currentVideoId={activeVideoId || undefined}
        initialTab={goldfishTab}
        onResourceAdded={onResourceAdded}
        onVideoReplaced={onVideoReplaced}
        onTimerStateChange={onTimerStateChange}
      />

      {/* Syllabus Modal */}
      <SyllabusModal
        isOpen={isSyllabusOpen}
        onClose={() => setIsSyllabusOpen(false)}
        roadmap={roadmap}
        currentModuleIndex={currentModuleIndex}
        completedTopics={completedTopics}
        onTopicChange={onTopicChange}
      />

      {/* Task Modal */}
      {isTaskModalOpen && (
        <TaskModal
          task={null}
          initialDate={new Date()}
          onClose={() => setIsTaskModalOpen(false)}
          onRefresh={() => {}}
          initialRoadmapId={roadmap.id}
          initialModuleNumber={currentModuleIndex + 1}
        />
      )}

      {/* Homework Submission Modal */}
      <HomeworkSubmissionModal
        isOpen={isHomeworkModalOpen}
        onClose={() => setIsHomeworkModalOpen(false)}
        roadmapId={roadmap.id}
        moduleNumber={currentModuleIndex + 1}
        moduleTitle={modules[currentModuleIndex]?.title}
        instructions={modules[currentModuleIndex]?.proof_of_work_instructions}
        initialResult={(() => {
          const submission = submissions.find((s: any) => s.module_number === currentModuleIndex + 1);
          if (!submission) return null;
          return {
            level: submission.evaluation_level,
            summary: submission.evaluation || submission.senate_summary,
            link: submission.link,
            evidence:
              submission.user_skill_evidence?.map((ev: any) => ({
                skill: ev.skill_name,
                strength: ev.evidence_strength,
                reason: ev.reason
              })) || []
          };
        })()}
        onSuccess={() => {
          if (roadmap?.id) {
            import('@/lib/api').then(({ submissionsAPI }) => {
              submissionsAPI.listSubmissions(roadmap.id).then((res) => {
                if (res.submissions) setSubmissions(res.submissions);
              }).catch(console.error);
            });
          }
        }}
        isPro={profile?.is_pro || false}
      />

      {/* Skill Extractor */}
      {isFreshRoadmapLoaded && roadmap.skills_extracted === false && (
        <SkillExtractor
          roadmap={roadmap}
          onComplete={() => {
            setRoadmap((prev: any) => (prev ? { ...prev, skills_extracted: true } : null));
          }}
        />
      )}

      {/* Unlock Module Modal */}
      <UnlockModuleModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        roadmapId={roadmap.id}
        targetModuleNumber={unlockTargetModuleNumber}
        targetModuleTitle={
          modules[unlockTargetModuleNumber - 1]?.title || `Module ${unlockTargetModuleNumber}`
        }
        onModuleUnlocked={onModuleUnlocked}
      />
    </>
  );
}
