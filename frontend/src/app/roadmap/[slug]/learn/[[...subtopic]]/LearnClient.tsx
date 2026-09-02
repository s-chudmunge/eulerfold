"use client"

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { RoadmapData, roadmapsAPI, authAPI, submissionsAPI } from '@/lib/api';
import { Loader, Zap } from 'lucide-react';
import Link from 'next/link';

import CourseHeader from '@/components/CourseHeader';
import MCQPractice from '@/components/roadmap/MCQPractice';
import SyllabusModal from './SyllabusModal';
import TaskModal from '@/components/planner/TaskModal';
import HomeworkSubmissionModal from '@/components/roadmap/HomeworkSubmissionModal';
import SkillExtractor from '@/components/roadmap/SkillExtractor';
import GoldfishAssistant, { GoldfishIcon } from '@/components/goldfish/GoldfishAssistant';

import LearnSidebar from '@/components/roadmap/learn/LearnSidebar';
import VideoReferenceArea from '@/components/roadmap/learn/VideoReferenceArea';
import TopicContentDetails from '@/components/roadmap/learn/TopicContentDetails';
import CourseCompletionBanner from '@/components/roadmap/learn/CourseCompletionBanner';

export default function LearnClient({ 
  id: propId, 
  slug: subtopicSlug, 
  initialRoadmap 
}: { 
  id?: string; 
  slug?: string[]; 
  initialRoadmap?: RoadmapData | null;
}) {
  const params = useParams();
  const id = propId || (params?.slug as string);
  const router = useRouter();
  
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(initialRoadmap || null);
  const [loading, setLoading] = useState(!initialRoadmap);
  const [isFreshRoadmapLoaded, setIsFreshRoadmapLoaded] = useState(false);
  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  
  // Navigation & Progress State
  const [currentModuleIndex, setCurrentModuleIndex] = useState(initialRoadmap?.last_position?.mIdx || 0);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(initialRoadmap?.last_position?.tIdx || 0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  const [completedPracticeModules, setCompletedPracticeModules] = useState<Set<number>>(new Set());
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  
  // Toast & Mode State
  const [coinToast, setCoinToast] = useState<{show: boolean, amount: number} | null>(null);
  const [viewMode, setViewMode] = useState<'video' | 'practice'>('video');
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [resourceCardIdx, setResourceCardIdx] = useState(0);

  // Goldfish Assistant State
  const [isGoldfishOpen, setIsGoldfishOpen] = useState(false);
  const [goldfishTab, setGoldfishTab] = useState<'chat' | 'reading' | 'video' | 'calendar' | 'focus'>('chat');
  const [timerState, setTimerState] = useState<{
    isActive: boolean;
    secondsRemaining: number;
    durationMins: number;
  }>({
    isActive: false,
    secondsRemaining: 25 * 60,
    durationMins: 25
  });

  const handleOpenGoldfish = (tab: 'chat' | 'reading' | 'video' | 'calendar' | 'focus' = 'chat') => {
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

  // Submissions & Certificates
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [certificateId, setCertificateId] = useState<string | null>(null);

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
        
        const { data } = await supabase.from('certificates')
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

  const refreshProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: userData } = await supabase.from('profiles').select('*').eq('supabase_uid', session.user.id).single();
      if (userData) setProfile(userData);
    }
  }, []);

  const fetchCompletedPractices = useCallback(async () => {
    if (!roadmap || !roadmap.id) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: mcqData } = await supabase.from('mcq_sessions')
        .select('subtopic_id')
        .eq('roadmap_id', roadmap.id)
        .eq('user_id', session.user.id)
        .eq('status', 'completed');
      
      if (mcqData) {
        const subtopicIds = new Set(mcqData.map(d => d.subtopic_id));
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

  useEffect(() => {
    if (roadmap?.id) {
      fetchCompletedPractices();
    }
  }, [fetchCompletedPractices, roadmap?.id]);

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

  // Initial Data Fetching
  useEffect(() => {
    async function loadRoadmap() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await roadmapsAPI.getRoadmapBySlug(id);
        setRoadmap(data);
        setIsFreshRoadmapLoaded(true);
        
        if (data.last_position) {
          setCurrentModuleIndex(data.last_position.mIdx || 0);
          setCurrentTopicIndex(data.last_position.tIdx || 0);
        }

        // Load completed topics
        if (data.completed_topic_ids) {
          setCompletedTopics(new Set(data.completed_topic_ids));
        }

        // Submissions
        if (data.id) {
          const subs = await submissionsAPI.listSubmissions(data.id);
          if (subs?.submissions) setSubmissions(subs.submissions);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load course session');
      } finally {
        setLoading(false);
      }
    }

    if (!initialRoadmap) {
      loadRoadmap();
    }
    refreshProfile();
  }, [id, initialRoadmap, refreshProfile]);

  // Sync active video
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
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleMarkAsCompleted = async () => {
    setIsUpdatingProgress(true);
    await updateProgressOnServer(currentModuleIndex, currentTopicIndex, true);
    setIsUpdatingProgress(false);
  };

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

  return (
    <div className="fixed inset-0 z-[100] flex flex-col text-text-primary overflow-hidden">
      {/* Course Header */}
      <CourseHeader 
        roadmapId={id}
        roadmapSlug={roadmap?.slug}
        roadmapTitle={roadmap?.subject}
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
          onTopicChange={handleTopicChange}
          onOpenHomework={() => setIsHomeworkModalOpen(true)}
          onOpenPlanner={() => setIsTaskModalOpen(true)}
          onOpenGoldfish={handleOpenGoldfish}
          submissions={submissions}
          displayPercent={displayPercent}
          roadmapSlug={roadmap?.slug}
          roadmapId={id}
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

                  {/* Modular Topic Details & Reading Resources */}
                  <TopicContentDetails 
                    currentTopic={currentTopic}
                    currentModule={currentModule}
                    onOpenGoldfishReading={() => handleOpenGoldfish('reading')}
                  />
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
                      setCoinToast({ show: true, amount });
                      setTimeout(() => setCoinToast(null), 4000);
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

      {/* Floating Goldfish Always-Accessible Circular Button */}
      <button
        onClick={() => handleOpenGoldfish(timerState.isActive ? 'focus' : 'reading')}
        className="fixed bottom-6 right-6 z-[110] w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-sidebar/95 border-2 border-orange-500/40 hover:border-orange-500 shadow-xl hover:shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 group cursor-pointer backdrop-blur-xs"
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
        onResourceAdded={handleGoldfishResourceAdded}
        onVideoReplaced={handleGoldfishVideoReplaced}
        onTimerStateChange={setTimerState}
      />

      {/* System Points Toast */}
      {coinToast && (
        <div className="fixed bottom-8 right-8 z-[200] animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-text-heading text-background px-5 py-3 rounded-md shadow-md flex items-center gap-3">
            <Zap className="h-4 w-4 fill-current text-amber-400" />
            <p className="text-[13px] font-bold">+{coinToast.amount} System Points</p>
          </div>
        </div>
      )}

      {/* Syllabus Modal */}
      <SyllabusModal 
        isOpen={isSyllabusOpen}
        onClose={() => setIsSyllabusOpen(false)}
        roadmap={roadmap}
        currentModuleIndex={currentModuleIndex}
        completedTopics={completedTopics}
        onTopicChange={handleTopicChange}
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
      {roadmap && (
        <HomeworkSubmissionModal 
          isOpen={isHomeworkModalOpen}
          onClose={() => setIsHomeworkModalOpen(false)}
          roadmapId={roadmap.id}
          moduleNumber={currentModuleIndex + 1}
          moduleTitle={modules[currentModuleIndex]?.title}
          instructions={modules[currentModuleIndex]?.proof_of_work_instructions}
          initialResult={
            (() => {
              const submission = submissions.find(s => s.module_number === currentModuleIndex + 1);
              if (!submission) return null;
              return {
                level: submission.evaluation_level,
                summary: submission.evaluation || submission.senate_summary,
                link: submission.link,
                evidence: submission.user_skill_evidence?.map((ev: any) => ({
                  skill: ev.skill_name,
                  strength: ev.evidence_strength,
                  reason: ev.reason
                })) || []
              };
            })()
          }
          onSuccess={(evaluation) => {
            if (roadmap?.id) {
              submissionsAPI.listSubmissions(roadmap.id).then((res) => {
                if (res.submissions) setSubmissions(res.submissions);
              }).catch(console.error);
            }
          }}
          isPro={profile?.is_pro || false}
        />
      )}

      {/* Skill Extractor */}
      {roadmap && isFreshRoadmapLoaded && roadmap.skills_extracted === false && (
        <SkillExtractor 
          roadmap={roadmap} 
          onComplete={() => {
            setRoadmap(prev => prev ? { ...prev, skills_extracted: true } : null);
          }} 
        />
      )}
    </div>
  );
}
