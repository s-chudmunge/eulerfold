"use client";

import React, { useState, useEffect } from 'react';
import { RoadmapData, saveRoadmap, roadmapsAPI, submissionsAPI } from '../../lib/api';
import { Download, CheckCircle, ChevronDown, ChevronUp, Play, BookOpen, X, Trophy, Plus, FileText, Copy, Target, MonitorPlay, BookText, Hash, Scroll, ChevronRight, Trash2, Hammer, Edit3, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import Link from 'next/link';

interface RoadmapDisplayProps {
  roadmapData: RoadmapData;
  initialFormData: {
    time_value: number;
    time_unit: string;
    subject: string;
    goal: string;
    model?: string;
  };
  justGenerated?: boolean;
  isOwner?: boolean;
  onClone?: () => void;
  onCloneRequired?: () => void;
  onSignInRequired?: () => void;
  onExtend?: () => void;
  onDeleteExtension?: () => void;
  onPractice?: (topic: any, moduleIndex: number) => void;
  onOpenHomework?: (moduleNumber: number, moduleTitle: string, instructions: string) => void;
  externalSubmissions?: any[];
  onViewSubmissionResult?: (submission: any) => void;
  }

  const RoadmapDisplay: React.FC<RoadmapDisplayProps> = ({ 
  roadmapData, 
  initialFormData, 
  justGenerated, 
  isOwner, 
  onClone,
  onCloneRequired,
  onSignInRequired,
  onExtend,
  onDeleteExtension,
  onPractice,
  onOpenHomework,
  hideHeader,
  externalSubmissions,
  onViewSubmissionResult
  }) => {
  const currentModule = (roadmapData as any).current_module || 1;
  const [expandedModules, setExpandedModules] = useState<number[]>([currentModule - 1]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  const [submissionsByModule, setSubmissionsByModule] = useState<Record<number, any[]>>({});

  useEffect(() => {
    if (externalSubmissions) {
        const grouped: Record<number, any[]> = {};
        for (const s of externalSubmissions) {
            const mod = Number(s.module_number || 0);
            if (!grouped[mod]) grouped[mod] = [];
            grouped[mod].push(s);
        }
        setSubmissionsByModule(grouped);
    }
  }, [externalSubmissions]);

  useEffect(() => {
    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (session) {
        if ((roadmapData as any).id && (roadmapData as any).id !== 0) {
            loadSubmissionsForRoadmap();
            fetchLearningProgress(session.access_token);
        }

        if (justGenerated && !isSaved && !isSaving && (!(roadmapData as any).id || (roadmapData as any).id === 0)) {
          handleSave(session);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [justGenerated, isSaved, isSaving, (roadmapData as any).id]);

  const fetchLearningProgress = async (token: string) => {
    try {
      const rid = (roadmapData as any).id;
      if (!rid) return;
      const res = await roadmapsAPI.getProgress(rid);
      if (res.completed_topics) {
        const set = new Set<string>();
        res.completed_topics.forEach((t: any) => {
          set.add(`${t.module_number}-${t.topic_index}`);
        });
        setCompletedTopics(set);
      }
    } catch (e) {
      console.error("Failed to fetch learning progress:", e);
    }
  };

  const handleSave = async (session: any) => {
    if (isSaved || isSaving) return;
    setIsSaving(true);
    try {
      const { data: { session: freshSession } } = await supabase.auth.getSession();
      const currentSession = freshSession || session;
      if (!currentSession?.user?.email) return;

      const payload = {
        ...initialFormData,
        roadmap_plan: roadmapData.roadmap_plan,
        title: roadmapData.title,
        description: roadmapData.description,
        email: currentSession.user.email
      };
      const res = await saveRoadmap(payload, currentSession.access_token);
      if (res.id) {
        setIsSaved(true);
        window.location.href = `/roadmap/${res.slug || res.id}`;
      }
    } catch (error) {
      console.error('Error saving roadmap:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleModule = (index: number) => {
    setExpandedModules(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const ResourceList: React.FC<{ resources: any[] }> = ({ resources }) => {
    if (!resources || resources.length === 0) return null;

    return (
      <div className="mt-4">
        <h4 className="inconsolata-ui text-[10px] font-bold text-text-muted  tracking-wide mb-2">Study Resources</h4>
        <div className="flex flex-col gap-2">
          {resources.map((r: any, ri: number) => (
            <a
              key={ri}
              href={r.link || r.url || '#'}
              target="_blank"
              rel="noreferrer"
              className="manrope-body text-[13px] text-accent hover:underline flex items-center gap-2 group w-fit"
            >
              <span className="opacity-50 group-hover:opacity-100 transition-opacity">→</span>
              <span className="truncate font-medium">{r.title || r.name || r.url}</span>
            </a>
          ))}
        </div>
      </div>
    );
  };

  const getLatestLevelForModule = (modNumber: number) => {
    const list = submissionsByModule[modNumber] || [];
    if (!list.length) return null;
    const latest = list[0];
    return latest.evaluation_level || null;
  };

  const loadSubmissionsForRoadmap = async () => {
    try {
      const rid = (roadmapData as any).id;
      if (!rid) return;
      const body = await submissionsAPI.listSubmissions(rid);
      const list = body.submissions || [];
      const grouped: Record<number, any[]> = {};
      for (const s of list) {
        const mod = Number(s.module_number || 0);
        if (!grouped[mod]) grouped[mod] = [];
        grouped[mod].push(s);
      }
      setSubmissionsByModule(grouped);
    } catch (e) {}
  };

  const handleDownload = () => {
    let markdownContent = `# ${roadmapData.title}\n\n`;
    markdownContent += `${roadmapData.description}\n\n`;

    roadmapData.roadmap_plan?.modules?.forEach((module: any, moduleIndex: number) => {
      markdownContent += `## Module ${moduleIndex + 1}: ${module.title}\n\n`;
      markdownContent += `**Goal:** ${module.outcome}\n\n`;
      markdownContent += `### Topics\n`;
      module.topics?.forEach((topic: any) => {
        markdownContent += `- ${typeof topic === 'string' ? topic : topic.title}\n`;
      });
      markdownContent += `\n### Resources\n`;
      module.resources?.forEach((resource: any) => {
        markdownContent += `- [${resource.title || resource.name}](${resource.link || resource.url})\n`;
      });
      markdownContent += `\n---\n\n`;
    });

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${roadmapData.title.toLowerCase().replace(/\s+/g, '-')}-roadmap.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 transition-colors duration-300 manrope-body">
      {!hideHeader && (
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mt-3">
          <div className="flex-1 min-w-0">
            <h2 className="inconsolata-ui text-xl font-semibold text-text-heading leading-tight   mb-4">
              {roadmapData.title}
            </h2>
            <p className="text-[16px] text-text-muted leading-relaxed italic max-w-3xl font-medium">
              {roadmapData.description}
            </p>
            
            {submissionsByModule && Object.keys(submissionsByModule).length > 0 && (
              <div className="mt-8 flex items-center gap-4">
                <span className="inconsolata-ui text-[11px] font-bold text-text-muted  tracking-wide">Goal Progress:</span>
                <div className="flex items-center space-x-2">
                  {(roadmapData.roadmap_plan?.modules || []).map((m: any, idx: number) => {
                    const lvl = getLatestLevelForModule(idx + 1);
                    const colorClass = lvl === 'Solid' ? 'bg-emerald-500' : lvl === 'Developing' ? 'bg-blue-500' : 'bg-[var(--border)] opacity-30';
                    return (
                      <div key={idx} className={`w-2.5 h-2.5 rounded-full ${colorClass}`} title={`Week ${idx+1}: ${lvl || 'Pending'}`} />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4 pt-6">
        {(roadmapData.roadmap_plan?.modules || []).map((module: any, index: number) => {
            const isCurrent = currentModule === (index + 1);
            const isExpanded = expandedModules.includes(index);
            const videos = module.topics?.filter((t: any) => typeof t !== 'string' && t.youtube_video_id) || [];
            const videoCount = videos.length;
            const totalDuration = videos.reduce((acc: number, v: any) => acc + (v.duration || 0), 0);
            const resourceCount = module.resources?.length || 0;
            const topicCount = module.topics?.length || 0;
            
            const isLast = index === (roadmapData.roadmap_plan?.modules || []).length - 1;
            const isExtension = module.is_extension;

            return (
              <div
                key={index}
                className={`transition-colors duration-300 relative group/module ${isCurrent ? 'bg-accent/[0.03]' : 'bg-background hover:bg-callout-bg/50'}`}
              >
                {/* Module Header */}
                <div
                  onClick={() => toggleModule(index)}
                  className="w-full px-4 md:px-6 py-5 md:py-6 flex items-center justify-between text-left cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleModule(index);
                    }
                  }}
                >
                  <div className="flex items-center gap-3 md:gap-6 min-w-0">
                    <div className={`inconsolata-ui w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center text-[12px] md:text-[14px] font-bold shrink-0 transition-all border ${
                      isCurrent 
                        ? 'bg-background border-border text-text-heading shadow-sm' 
                        : 'bg-callout-bg border-border text-text-muted'
                    }`}>
                      W{index + 1}
                    </div>
                    <div className="min-w-0">
                      <h3 className="inconsolata-ui text-[18px] font-bold text-text-heading truncate pr-4  ">{module.title}</h3>
                      <p className="text-[13px] text-text-muted line-clamp-5 leading-relaxed mt-1 font-medium italic pr-8">{module.outcome}</p>
                      
                      <div className="flex flex-wrap items-center gap-x-3 md:gap-x-6 gap-y-2 mt-4">
                        {videoCount > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="bg-blue-500/10 p-1.5 rounded-full border border-blue-500/5">
                              <MonitorPlay className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <span className="manrope-body text-[12px] md:text-[13px] font-semibold text-text-primary">
                              {videoCount} {videoCount === 1 ? 'video' : 'videos'}
                              {totalDuration > 0 && <span className="mx-1.5 opacity-30">•</span>}
                              {totalDuration > 0 && `${totalDuration}m`}
                            </span>
                          </div>
                        )}
                        {resourceCount > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="bg-indigo-500/10 p-1.5 rounded-full border border-indigo-500/5">
                              <BookText className="w-3.5 h-3.5 text-indigo-600" />
                            </div>
                            <span className="manrope-body text-[12px] md:text-[13px] font-semibold text-text-primary">{resourceCount} {resourceCount === 1 ? 'reading' : 'readings'}</span>
                          </div>
                        )}
                        {topicCount > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="bg-slate-500/10 p-1.5 rounded-full border border-slate-500/5">
                              <Hash className="w-3.5 h-3.5 text-slate-600" />
                            </div>
                            <span className="manrope-body text-[12px] md:text-[13px] font-semibold text-text-primary">{topicCount} {topicCount === 1 ? 'topic' : 'topics'}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <div className="bg-emerald-500/10 p-1.5 rounded-full border border-emerald-500/5">
                            <Scroll className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          <span className="manrope-body text-[12px] md:text-[13px] font-semibold text-text-primary">1 homework</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-4 shrink-0">
                    {(isOwner || roadmapData.is_public) && (
                    <div className="flex flex-col gap-1.5 min-w-[70px] md:min-w-[90px]">
                        <Link 
                          href={`/roadmap/${roadmapData.cloned_id || roadmapData.slug || roadmapData.id}/learn?module=${index + 1}&topic=1`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!user && onSignInRequired) {
                              e.preventDefault();
                              onSignInRequired();
                              return;
                            }
                            if (!isOwner && user && onCloneRequired) {
                              e.preventDefault();
                              onCloneRequired();
                            }
                          }}
                          className="flex items-center justify-center gap-1.5 px-3 md:px-5 py-1.5 bg-blue-600/90 text-white rounded-lg text-[8px] md:text-[9px] font-bold tracking-widest uppercase hover:bg-blue-600 transition-all active:scale-95"
                        >
                          <Play className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" />
                          <span>Learn</span>
                        </Link>

                        {!submissionsByModule[index+1]?.length && (
                          <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!user && onSignInRequired) {
                                  onSignInRequired();
                                  return;
                                }
                                if (!isOwner && user && onCloneRequired) {
                                    onCloneRequired();
                                    return;
                                }
                                if (onOpenHomework) {
                                    onOpenHomework(index + 1, module.title, module.proof_of_work_instructions);
                                } else {
                                    // Fallback for cases where modal isn't available
                                    window.location.href = `/roadmap/${roadmapData.slug || roadmapData.id}/build/${index + 1}`;
                                }
                            }}
                            className="flex items-center justify-center gap-1.5 px-3 md:px-5 py-1.5 bg-emerald-600/90 text-white rounded-lg text-[8px] md:text-[9px] font-bold tracking-widest uppercase hover:bg-emerald-600 transition-all active:scale-95"
                          >
                            <Scroll className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            <span>Homework</span>                          </button>
                        )}
                      </div>
                    )}
                    {isOwner && isLast && isExtension && onDeleteExtension && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this extension?')) {
                            onDeleteExtension();
                          }
                        }}
                        className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-100 md:opacity-0 group-hover/module:opacity-100"
                        title="Delete last extension"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {submissionsByModule[index+1] && submissionsByModule[index+1].length > 0 && (
                      <CheckCircle className="h-5 w-5 text-green-500 hidden sm:block" />
                    )}
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-text-muted" /> : <ChevronDown className="h-5 w-5 text-text-muted" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 py-4 pl-6 md:pl-20 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-4">
                      <div>
                        <h4 className="inconsolata-ui text-[10px] font-bold text-text-muted  tracking-wide mb-2">Topics</h4>
                        <div className="flex flex-col gap-1.5">
                          {module.topics?.map((topic: any, tIndex: number) => {
                            const isTopicDone = completedTopics.has(`${index + 1}-${tIndex}`);
                            const hasVideo = typeof topic !== 'string' && topic.youtube_video_id;
                            const duration = (typeof topic !== 'string' && topic.duration) ? topic.duration : null;
                            
                            const TopicContent = (
                              <div className="flex items-start py-1 group/topic w-full">
                                <span className="inconsolata-ui text-[10px] font-bold opacity-30 mr-3 w-7 shrink-0 mt-1">
                                  {index + 1}.{tIndex + 1}
                                </span>
                                <div className="mr-3 mt-1 shrink-0">
                                  {isTopicDone ? (
                                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                  ) : (
                                    <div className="h-3.5 w-3.5 border border-border rounded-full opacity-20" />
                                  )}
                                </div>
                                <div className="flex flex-1 items-baseline justify-between gap-4 min-w-0">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className={`manrope-body text-[14px] leading-snug truncate ${isTopicDone ? 'text-green-600 font-semibold' : 'text-text-primary font-medium'} ${isOwner ? 'group-hover/topic:text-accent transition-colors' : ''}`}>
                                      {typeof topic === 'string' ? topic : topic.title}
                                    </span>
                                    {hasVideo && (
                                      <div title="Contains video" className="bg-accent/10 text-accent p-0.5 rounded shadow-sm shrink-0">
                                        <Play className="w-2.5 h-2.5 fill-current" />
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-3 shrink-0">
                                    {isOwner && onPractice && (
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          onPractice(topic, index);
                                        }}
                                        className="p-1.5 rounded-md bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/15 hover:border-emerald-500/40 hover:scale-105 transition-all shadow-sm flex items-center justify-center"
                                        title="Practice"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    {duration && (
                                      <span className="manrope-body text-[12px] text-text-muted opacity-40 shrink-0 tabular-nums italic">
                                        {duration} minutes
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );

                            if (isOwner) {
                              const targetId = roadmapData.cloned_id || (roadmapData as any).slug || (roadmapData as any).id;
                              return (
                                <Link 
                                  key={tIndex}
                                  href={`/roadmap/${targetId}/learn?module=${index + 1}&topic=${tIndex + 1}`}
                                  className="block w-full"
                                >
                                  {TopicContent}
                                </Link>
                              );
                            }

                            return <div key={tIndex}>{TopicContent}</div>;
                          })}
                        </div>
                      </div>

                      <ResourceList resources={module.resources || []} />

                      {submissionsByModule[index+1] && submissionsByModule[index+1].length > 0 && (
                        <div className="pt-4 flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-3">
                            <span className="inconsolata-ui flex items-center gap-2 text-[10px] font-bold text-green-600 bg-green-500/5 px-3 py-1.5 rounded-lg border border-green-500/20  tracking-wide">
                              <CheckCircle className="h-3.5 w-3.5" /> Verified
                            </span>
                            <span className={`inconsolata-ui px-2 py-1 rounded-md text-[10px] font-bold  tracking-wide border ${
                              submissionsByModule[index+1][0].evaluation_level === 'Solid' 
                                ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                                : submissionsByModule[index+1][0].evaluation_level === 'Developing' 
                                ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' 
                                : 'bg-red-500/10 text-red-600 border-red-500/20'
                            }`}>
                              {submissionsByModule[index+1][0].evaluation_level}
                            </span>
                          </div>
                          {onViewSubmissionResult && (
                            <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onViewSubmissionResult(submissionsByModule[index+1][0]);
                                }}
                                className="text-[10px] font-bold text-accent hover:underline flex items-center gap-1 bg-accent/5 px-2 py-1 rounded-md border border-accent/20 transition-all hover:bg-accent/10"
                            >
                                <Eye className="w-3.5 h-3.5" /> View Result
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
        })}

        {onExtend && (
          <div className="pt-12 pb-6 border-t border-border mt-12 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <button 
              onClick={onExtend}
              className="w-16 h-16 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-600 mb-6 flex items-center justify-center transition-all hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:scale-105 active:scale-95 group shadow-lg shadow-emerald-500/5"
            >
              <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-500" />
            </button>
            
            <div className="max-w-[400px]">
              <h3 className="inconsolata-ui text-lg font-bold text-text-heading tracking-tight mb-2">Continue Learning</h3>
              <p className="manrope-body text-[12px] text-text-muted leading-relaxed italic opacity-80 mb-6 px-4">
                You've completed the original curriculum. As a Pro user, you can extend this roadmap further based on your specific needs.
              </p>
              
              <div className="inline-flex items-center px-3 py-1 bg-emerald-500/5 rounded-full border border-emerald-500/10">
                <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-[0.1em]">Pro Exclusive Feature</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadmapDisplay;
