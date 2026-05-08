"use client";

import React, { useState } from 'react';
import { X, ChevronDown, CheckCircle2, Trophy, PlayCircle, Library } from 'lucide-react';

interface SyllabusModalProps {
  isOpen: boolean;
  onClose: () => void;
  roadmap: any;
  currentModuleIndex: number;
  completedTopics: Set<string>;
  onTopicChange: (mIdx: number, tIdx: number) => void;
}

export default function SyllabusModal({ 
  isOpen, 
  onClose, 
  roadmap, 
  currentModuleIndex,
  completedTopics,
  onTopicChange
}: SyllabusModalProps) {
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([currentModuleIndex]));

  if (!isOpen) return null;

  const modules = roadmap?.roadmap_plan?.modules || [];
  const totalTopics = modules.reduce((acc: number, m: any) => acc + (m.topics?.length || 0), 0);
  const completedCount = Array.from(completedTopics).length;
  const progressPercent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  const toggleModule = (idx: number) => {
    const next = new Set(expandedModules);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.add(idx);
    }
    setExpandedModules(next);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-background border border-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-[16px] font-bold text-text-heading">Roadmap Syllabus</h2>
          <button onClick={onClose} className="p-1 hover:bg-callout-bg rounded-lg text-text-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
          {/* Roadmap Info */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-text-heading mb-4 tracking-tight">
              {roadmap?.subject || roadmap?.title}
            </h3>
            
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-bold text-text-muted uppercase tracking-wider">Roadmap Progress</span>
                  <span className="text-[12px] font-bold text-text-heading">{progressPercent}%</span>
                </div>
                <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modules List */}
          <div className="space-y-3">
            {modules.map((module: any, mIdx: number) => {
              const isExpanded = expandedModules.has(mIdx);
              const moduleCompletedCount = Array.from(completedTopics).filter(k => k.startsWith(`${mIdx + 1}-`)).length;
              const isFullyCompleted = moduleCompletedCount === (module.topics?.length || 0);

              return (
                <div key={mIdx} className="border border-border rounded-xl overflow-hidden bg-sidebar/30">
                  <button 
                    onClick={() => toggleModule(mIdx)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-callout-bg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] font-bold text-text-heading">
                        {module.title?.toLowerCase().startsWith('module')
                          ? module.title
                          : `Module ${mIdx + 1}: ${module.title}`}
                      </span>
                      {isFullyCompleted && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="px-2 pb-2 bg-background/50 border-t border-border/50">
                      <div className="space-y-1 pt-2">
                        {module.topics?.map((topic: any, tIdx: number) => {
                          const isCompleted = completedTopics.has(`${mIdx + 1}-${tIdx}`);
                          const hasVideo = !!topic.youtube_video_id;
                          
                          return (
                            <button
                              key={tIdx}
                              onClick={() => {
                                onTopicChange(mIdx, tIdx);
                                onClose();
                              }}
                              className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-[13px] hover:bg-callout-bg text-left group"
                            >
                              <div className="mt-0.5 shrink-0">
                                {isCompleted ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                ) : hasVideo ? (
                                  <PlayCircle className="w-5 h-5 text-text-muted opacity-40 group-hover:opacity-100" />
                                ) : (
                                  <Library className="w-5 h-5 text-text-muted opacity-40 group-hover:opacity-100" />
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-text-primary group-hover:text-text-heading transition-colors font-medium">
                                  {topic.title}
                                </span>
                                <span className="text-[10px] text-text-muted mt-0.5">
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
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
