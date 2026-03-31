"use client";

import React, { useState, useEffect } from 'react';
import { RoadmapData, saveRoadmap, roadmapsAPI, submissionsAPI } from '../../lib/api';
import { Download, CheckCircle, ChevronDown, ChevronUp, Play, BookOpen, X, Trophy, Plus, FileText, Copy, Target, MonitorPlay, BookText, Hash, Scroll } from 'lucide-react';
import SubmissionModal from '@/components/SubmissionModal';
import { supabase } from '../../lib/supabase/client';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

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
  hideHeader?: boolean;
}

const RoadmapDisplay: React.FC<RoadmapDisplayProps> = ({ 
  roadmapData, 
  initialFormData, 
  justGenerated,
  isOwner = true,
  onClone,
  hideHeader = false
}) => {
  const currentModule = (roadmapData as any).current_module || 1;
  const [expandedModules, setExpandedModules] = useState<number[]>([currentModule - 1]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  const [submissionsByModule, setSubmissionsByModule] = useState<Record<number, any[]>>({});

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

  const [showModalFor, setShowModalFor] = useState<number | null>(null);
  const handleModalClose = () => setShowModalFor(null);
  const handleCompleted = (result?: any) => {
    setShowModalFor(null);
    window.location.reload();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 transition-colors duration-300 manrope-body">
      {!hideHeader && (
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mt-3">
          <div className="flex-1 min-w-0">
            <h2 className="inconsolata-ui text-2xl font-semibold text-text-heading leading-tight   mb-4">
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
            
            return (
              <div
                key={index}
                className={`transition-colors duration-300 ${isCurrent ? 'bg-accent/[0.03]' : 'bg-background hover:bg-callout-bg/50'}`}
              >
                <button
                  onClick={() => toggleModule(index)}
                  className="w-full px-6 py-6 flex items-center justify-between text-left focus:outline-none"
                >
                  <div className="flex items-center gap-4 md:gap-6 min-w-0">
                    <div className={`inconsolata-ui w-9 h-9 rounded-lg flex items-center justify-center text-[14px] font-bold shrink-0 transition-all border ${
                      isCurrent 
                        ? 'bg-background border-border text-text-heading shadow-sm' 
                        : 'bg-callout-bg border-border text-text-muted'
                    }`}>
                      W{index + 1}
                    </div>
                    <div className="min-w-0">
                      <h3 className="inconsolata-ui text-[18px] font-bold text-text-heading truncate pr-4  ">{module.title}</h3>
                      <p className="text-[13px] text-text-muted line-clamp-1 mt-1 font-medium italic">{module.outcome}</p>
                      
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">
                        {videoCount > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="bg-blue-500/10 p-1.5 rounded-full border border-blue-500/5">
                              <MonitorPlay className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <span className="manrope-body text-[13px] font-semibold text-text-primary">
                              {videoCount} {videoCount === 1 ? 'video' : 'videos'}
                              {totalDuration > 0 && <span className="mx-1.5 opacity-30">•</span>}
                              {totalDuration > 0 && `${totalDuration} minutes`}
                            </span>
                          </div>
                        )}
                        {resourceCount > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="bg-indigo-500/10 p-1.5 rounded-full border border-indigo-500/5">
                              <BookText className="w-3.5 h-3.5 text-indigo-600" />
                            </div>
                            <span className="manrope-body text-[13px] font-semibold text-text-primary">{resourceCount} {resourceCount === 1 ? 'reading' : 'readings'}</span>
                          </div>
                        )}
                        {topicCount > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="bg-slate-500/10 p-1.5 rounded-full border border-slate-500/5">
                              <Hash className="w-3.5 h-3.5 text-slate-600" />
                            </div>
                            <span className="manrope-body text-[13px] font-semibold text-text-primary">{topicCount} {topicCount === 1 ? 'topic' : 'topics'}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <div className="bg-emerald-500/10 p-1.5 rounded-full border border-emerald-500/5">
                            <Scroll className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          <span className="manrope-body text-[13px] font-semibold text-text-primary">1 task</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    {submissionsByModule[index+1] && submissionsByModule[index+1].length > 0 && (
                      <CheckCircle className="h-5 w-5 text-green-500 hidden sm:block" />
                    )}
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-text-muted" /> : <ChevronDown className="h-5 w-5 text-text-muted" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 py-4 pl-20 animate-in fade-in slide-in-from-top-2 duration-300">
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
                                  {duration && (
                                    <span className="manrope-body text-[12px] text-text-muted opacity-40 shrink-0 tabular-nums italic">
                                      {duration} minutes
                                    </span>
                                  )}
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

                      <div className="pt-2 flex items-center gap-4 flex-wrap">
                        {submissionsByModule[index+1] && submissionsByModule[index+1].length > 0 ? (
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
                        ) : (
                          isOwner && (
                            <button
                              onClick={() => setShowModalFor(index + 1)}
                              className="inconsolata-ui flex items-center gap-2 px-5 py-2.5 bg-teal-700/5 border border-teal-700/20 text-teal-700 rounded-lg text-[10px] font-bold  tracking-wide hover:bg-teal-700/10 transition-all active:scale-95 group"
                            >
                              <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" /> 
                              Submit Proof of Work
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
        })}
      </div>

      {showModalFor && (
        <SubmissionModal
          roadmapId={(roadmapData as any).id}
          moduleNumber={showModalFor}
          onClose={handleModalClose}
          onCompleted={handleCompleted}
          instructions={(roadmapData.roadmap_plan as any).modules[showModalFor - 1]?.proof_of_work_instructions}
        />
      )}
    </div>
  );
};

export default RoadmapDisplay;
