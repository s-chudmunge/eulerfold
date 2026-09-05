'use client';

import React from 'react';
import Link from 'next/link';
import { 
  PlayCircle, 
  CheckCircle2, 
  Library, 
  Target, 
  CheckCircle, 
  Send, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  Calendar, 
  LayoutDashboard,
  Lock
} from 'lucide-react';
import { GoldfishIcon } from '@/components/goldfish/GoldfishAssistant';

interface LearnSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  modules: any[];
  currentModuleIndex: number;
  currentTopicIndex: number;
  completedTopics: Set<string>;
  completedPracticeModules: Set<number>;
  viewMode: 'video' | 'practice';
  setViewMode: (mode: 'video' | 'practice') => void;
  onTopicChange: (mIdx: number, tIdx: number) => void;
  onOpenHomework: () => void;
  onOpenPlanner: () => void;
  onOpenGoldfish: (tab: 'reading' | 'video' | 'calendar') => void;
  submissions: any[];
  displayPercent: number;
  roadmapSlug?: string;
  roadmapId: string | number;
  onUnlockModule?: (moduleNumber: number) => void;
}

export default function LearnSidebar({
  isOpen,
  onClose,
  modules,
  currentModuleIndex,
  currentTopicIndex,
  completedTopics,
  completedPracticeModules,
  viewMode,
  setViewMode,
  onTopicChange,
  onOpenHomework,
  onOpenPlanner,
  onOpenGoldfish,
  submissions,
  displayPercent,
  roadmapSlug,
  roadmapId,
  onUnlockModule
}: LearnSidebarProps) {
  const currentModule = modules[currentModuleIndex];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden" 
          onClick={onClose} 
        />
      )}

      <aside className={`${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-40 w-[280px] bg-sidebar border-r border-border transition-all duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col`}>
        <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
          <div className="mb-5 flex items-start justify-between">
            <h2 className="text-[13px] font-bold text-text-heading leading-tight">
              {currentModule?.title?.toLowerCase().startsWith('module') 
                ? currentModule.title 
                : `Module ${currentModuleIndex + 1}: ${currentModule?.title}`}
            </h2>
          </div>
          
          {/* Topic List */}
          <div className="space-y-1">
            {currentModule?.topics?.map((topic: any, tIdx: number) => {
              const isCompleted = completedTopics.has(`${currentModuleIndex + 1}-${tIdx}`);
              const isActive = tIdx === currentTopicIndex && viewMode === 'video';
              const hasVideo = !!topic.youtube_video_id;
              
              return (
                <button
                  key={tIdx}
                  onClick={() => onTopicChange(currentModuleIndex, tIdx)}
                  className={`w-full flex items-start text-left px-3 py-2.5 rounded-md text-[13px] transition-all group ${
                    isActive 
                      ? 'bg-accent/10 text-accent font-semibold shadow-xs' 
                      : 'hover:bg-callout-bg text-text-primary hover:text-text-heading'
                  }`}
                >
                  <div className="mr-3 mt-0.5 shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                    ) : hasVideo ? (
                      <PlayCircle className={`h-4.5 w-4.5 ${isActive ? 'text-accent' : 'opacity-60 group-hover:opacity-100'}`} />
                    ) : (
                      <Library className={`h-4.5 w-4.5 ${isActive ? 'text-accent' : 'opacity-60 group-hover:opacity-100'}`} />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="line-clamp-2 leading-snug font-medium text-[12px]">{topic.title}</span>
                    <span className="text-[10px] mt-0.5 opacity-70">
                      {hasVideo ? (
                        `Video • ${typeof topic.duration === 'string' ? topic.duration.replace('m', ' min') : (topic.duration ? `${topic.duration} min` : '8 min')}`
                      ) : (
                        'Resources available'
                      )}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Practice & Homework Buttons */}
            <div className="pt-2 space-y-1.5">
              <button 
                onClick={() => setViewMode('practice')}
                className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-md text-[12px] transition-all group ${
                  viewMode === 'practice' 
                    ? "bg-accent/10 text-accent font-semibold shadow-xs" 
                    : "text-text-primary hover:text-text-heading hover:bg-callout-bg"
                }`}
              >
                {completedPracticeModules.has(currentModuleIndex) ? (
                  <CheckCircle className="h-4.5 w-4.5 mt-0.5 text-accent opacity-80 group-hover:opacity-100" />
                ) : (
                  <Target className={`h-4.5 w-4.5 mt-0.5 ${viewMode === 'practice' ? 'text-accent' : 'opacity-60 group-hover:opacity-100'}`} />
                )}
                <div className="flex flex-col text-left">
                  <span className="font-medium">Practice & Quiz</span>
                  <span className="text-[10px] opacity-70">
                    {completedPracticeModules.has(currentModuleIndex) ? 'Practice completed' : 'Test your knowledge'}
                  </span>
                </div>
              </button>

              <button 
                onClick={onOpenHomework}
                className="w-full flex items-start gap-3 px-3 py-2.5 rounded-md text-[12px] text-text-primary hover:text-text-heading hover:bg-callout-bg transition-all group"
              >
                {submissions.some(s => s.module_number === currentModuleIndex + 1) ? (
                  <>
                    <CheckCircle className="h-4.5 w-4.5 mt-0.5 text-accent opacity-80 group-hover:opacity-100" />
                    <div className="flex flex-col text-left">
                      <span className="font-medium">View Submission</span>
                      <span className="text-[10px] opacity-70">See your evaluation</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Send className="h-4.5 w-4.5 mt-0.5 opacity-60 group-hover:opacity-100" />
                    <div className="flex flex-col text-left">
                      <span className="font-medium">Submit Homework</span>
                      <span className="text-[10px] opacity-70">Verify your skills</span>
                    </div>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Module Navigation */}
          <div className="mt-6 pt-5 border-t border-border/50 space-y-3">
            {currentModuleIndex > 0 && (
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 px-1">Previous Module</p>
                <button 
                  onClick={() => onTopicChange(currentModuleIndex - 1, 0)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-semibold text-text-heading hover:bg-callout-bg transition-all group"
                >
                  <ChevronLeft className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:-translate-x-0.5" />
                  <span className="truncate ml-2 text-right">
                    {modules[currentModuleIndex - 1].title?.toLowerCase().startsWith('module')
                      ? modules[currentModuleIndex - 1].title
                      : `Module ${currentModuleIndex}: ${modules[currentModuleIndex - 1].title}`}
                  </span>
                </button>
              </div>
            )}

            {currentModuleIndex < modules.length - 1 && (() => {
              const nextModule = modules[currentModuleIndex + 1];
              const isNextLocked = nextModule?.locked === true || (!nextModule?.topics || nextModule.topics.length === 0);
              const currentModTopics = currentModule?.topics || [];
              const isCurrentModComplete = currentModTopics.length > 0 && currentModTopics.every((_: any, idx: number) =>
                completedTopics.has(`${currentModuleIndex + 1}-${idx}`)
              );

              return (
                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 px-1">Next Module</p>
                  {isNextLocked ? (
                    isCurrentModComplete && onUnlockModule ? (
                      <button
                        onClick={() => onUnlockModule(currentModuleIndex + 2)}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-md text-[11px] font-bold text-background bg-accent hover:opacity-90 transition-all shadow-xs group"
                      >
                        <span className="truncate mr-2 text-left flex items-center gap-1.5">
                          <Lock className="h-3 w-3 shrink-0" />
                          <span>Unlock Module {currentModuleIndex + 2}</span>
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ) : (
                      <div className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-medium text-text-muted/60 bg-background/30 border border-border/40 cursor-not-allowed">
                        <span className="truncate mr-2 text-left flex items-center gap-1.5">
                          <Lock className="h-3 w-3 shrink-0 text-text-muted/50" />
                          <span>
                            {nextModule.title?.toLowerCase().startsWith('module')
                              ? nextModule.title
                              : `Module ${currentModuleIndex + 2}: ${nextModule.title}`}
                          </span>
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-text-muted/50 shrink-0 font-bold">Locked</span>
                      </div>
                    )
                  ) : (
                    <button 
                      onClick={() => onTopicChange(currentModuleIndex + 1, 0)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-semibold text-text-heading hover:bg-callout-bg transition-all group"
                    >
                      <span className="truncate mr-2 text-left">
                        {nextModule.title?.toLowerCase().startsWith('module')
                          ? nextModule.title
                          : `Module ${currentModuleIndex + 2}: ${nextModule.title}`}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Sidebar Footer with Progress & Assistant */}
        <div className="p-4 border-t border-border bg-sidebar/50">
          <div className="mb-3">
            <div className="flex items-center justify-between text-[11px] font-bold mb-1.5 px-1">
              <span className="text-text-primary uppercase tracking-wider">Progress</span>
              <span className="text-text-heading">{displayPercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent transition-all duration-500 ease-out rounded-full"
                style={{ width: `${displayPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <button 
                onClick={onOpenPlanner}
                className="text-text-muted hover:text-text-heading transition-colors" 
                title="Planner"
              >
                <Calendar className="h-4 w-4" />
              </button>
            </div>
            <Link 
              href={`/course/${roadmapSlug || roadmapId}`} 
              className="text-text-muted hover:text-text-heading transition-colors"
              title="Overview"
            >
              <LayoutDashboard className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
