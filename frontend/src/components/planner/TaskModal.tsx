'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, BookOpen, Target, CheckCircle2, Video, Clock, Trash2, Link as LinkIcon, ExternalLink, Play } from 'lucide-react';
import { roadmapsAPI, plannerAPI, RoadmapMe } from '@/lib/api';
import { format, parseISO } from 'date-fns';
import { papers } from '@/app/research-decoded/generatedData';
import { articles } from '@/app/articles/generatedArticles';
import Link from 'next/link';

interface Props {
  task: any;
  initialDate: Date | null;
  onClose: () => void;
  onRefresh: () => void;
  initialRoadmapId?: number;
  initialModuleNumber?: number;
}

export default function TaskModal({ task, initialDate, onClose, onRefresh, initialRoadmapId, initialModuleNumber }: Props) {
  const [loading, setLoading] = useState(false);
  const [roadmaps, setRoadmaps] = useState<RoadmapMe[]>([]);
  
  // Form State
  const [title, setTitle] = useState(task?.title?.replace("Proof of Work", "Homework") || '');
  const [type, setType] = useState<any>(task?.task_type || (initialRoadmapId ? 'module' : 'custom'));
  const [date, setDate] = useState(task ? task.scheduled_date : (initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')));
  const [roadmapId, setRoadmapId] = useState<number | undefined>(task?.roadmap_id || initialRoadmapId);
  const [moduleNumber, setModuleNumber] = useState<number | undefined>(task?.module_number || initialModuleNumber);
  const [isCompleted, setIsCompleted] = useState(task?.is_completed || false);
  const [videoUrl, setVideoUrl] = useState(task?.metadata?.video_url || '');
  const [contentSlug, setContentSlug] = useState(task?.metadata?.slug || '');

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  useEffect(() => {
    if (initialRoadmapId && initialModuleNumber && roadmaps.length > 0 && !title) {
      const selectedRoadmap = roadmaps.find(r => r.id === initialRoadmapId);
      const modules = selectedRoadmap?.roadmap_plan?.modules || [];
      const module = modules[initialModuleNumber - 1];
      if (module) {
        setTitle(`Study: ${module.title}`);
      }
    }
  }, [roadmaps, initialRoadmapId, initialModuleNumber, title]);

  const fetchRoadmaps = async () => {
    try {
      const data = await roadmapsAPI.getMyRoadmaps();
      setRoadmaps(data);
    } catch (err) {
      console.error("Failed to fetch roadmaps", err);
    }
  };

  const handleSave = async () => {
    if (!title) return;
    setLoading(true);
    
    // Find roadmap title if roadmapId is selected
    const selectedRoadmap = roadmaps.find(r => r.id === roadmapId);
    const roadmapTitle = selectedRoadmap?.title;

    try {
      if (task) {
        await plannerAPI.updateTask(task.id, {
          title,
          scheduled_date: date,
          is_completed: isCompleted,
          metadata: { 
            ...task.metadata, 
            video_url: videoUrl,
            slug: contentSlug,
            roadmap_title: roadmapTitle || task.metadata?.roadmap_title 
          }
        });
      } else {
        await plannerAPI.createTask({
          title,
          task_type: type,
          scheduled_date: date,
          roadmap_id: roadmapId,
          module_number: moduleNumber,
          metadata: { 
            video_url: videoUrl,
            slug: contentSlug,
            roadmap_title: roadmapTitle
          }
        });
      }
      onRefresh();
      onClose();
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    if (!confirm("Are you sure you want to delete this task?")) return;
    setLoading(true);
    try {
      await plannerAPI.deleteTask(task.id);
      onRefresh();
      onClose();
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setLoading(false);
    }
  };

  const getTaskLink = () => {
    if (!task) return null;
    if (task.task_type === 'research' && task.metadata?.slug) return `/research-decoded/${task.metadata.slug}`;
    if (task.task_type === 'article' && task.metadata?.slug) return `/articles/${task.metadata.slug}`;
    
    if ((task.task_type === 'module' || task.task_type === 'pow' || task.task_type === 'practice') && task.roadmap_id) {
      const roadmap = roadmaps.find(r => r.id === task.roadmap_id);
      const slug = task.metadata?.roadmap_slug || roadmap?.slug;
      
      if (slug) {
        return `/roadmap/${slug}`;
      }
    }
    
    if (task.task_type === 'video' && task.metadata?.video_url) return task.metadata.video_url;
    return null;
  };

  const taskLink = getTaskLink();

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200 manrope-body">
      <div className="bg-sidebar w-full max-w-[420px] border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-sidebar/50">
          <div className="flex items-center gap-2.5">
            <h3 className="text-[13px] font-bold text-text-heading tracking-tight">
              {task ? 'Edit Task' : 'New Study Task'}
            </h3>
            {taskLink && (
              <Link 
                href={taskLink}
                target={taskLink.startsWith('http') ? "_blank" : "_self"}
                onClick={(e) => {
                  if (taskLink.includes('/roadmap/') && (task.task_type === 'practice' || task.task_type === 'pow')) {
                    if (!confirm("This feature has moved to the Roadmap page. Redirect there now?")) {
                      e.preventDefault();
                    }
                  }
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-accent text-white rounded-lg text-[9px] font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-sm hover:shadow-md"
              >
                Open Roadmap
                <Play className="w-2.5 h-2.5 fill-current" />
              </Link>
            )}
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-heading transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Title */}
          <div>
            <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-1.5 ml-1">Task Title</label>
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Study Neural Networks"
              className="w-full bg-background/50 border border-border px-3.5 py-2 text-[12.5px] font-bold text-text-heading outline-none focus:border-accent transition-all rounded-lg"
            />
          </div>

          {/* Type & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-1.5 ml-1">Type</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled={!!task}
                className="w-full bg-background/50 border border-border px-2.5 py-2 text-[11px] font-bold text-text-primary outline-none focus:border-accent transition-all rounded-lg"
              >
                <option value="custom">Custom</option>
                <option value="module">Module</option>
                <option value="practice">Practice</option>
                <option value="pow">Homework</option>
                <option value="video">Video</option>
                <option value="research">Research Decoded</option>
                <option value="article">Article</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-1.5 ml-1">Date</label>
              <div className="relative">
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-background/50 border border-border px-2.5 py-2 text-[11px] font-bold text-text-primary outline-none focus:border-accent transition-all rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Roadmap Selection (only for non-custom/non-video if new) */}
          {!task && (type === 'module' || type === 'practice' || type === 'pow') && (
            <div className="animate-in slide-in-from-top-1 duration-300 space-y-4">
              <div>
                <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-1.5 ml-1">Associate Roadmap</label>
                <select 
                  value={roadmapId}
                  onChange={(e) => {
                    const rId = Number(e.target.value);
                    setRoadmapId(rId);
                    setModuleNumber(undefined); // Reset module when roadmap changes
                  }}
                  className="w-full bg-background/50 border border-border px-2.5 py-2 text-[11px] font-bold text-text-primary outline-none focus:border-accent transition-all rounded-lg"
                >
                  <option value="">Select a roadmap...</option>
                  {roadmaps.map(r => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              </div>

              {roadmapId && (
                <div>
                  <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-1.5 ml-1">Select Module</label>
                  <select 
                    value={moduleNumber}
                    onChange={(e) => {
                      const mNum = Number(e.target.value);
                      setModuleNumber(mNum);
                      
                      // Auto-populate title if not set or just default
                      const selectedRoadmap = roadmaps.find(r => r.id === roadmapId);
                      const modules = selectedRoadmap?.roadmap_plan?.modules || [];
                      const module = modules[mNum - 1];
                      if (module) {
                        const prefix = type === 'module' ? 'Study' : type === 'practice' ? 'Practice' : 'Homework';
                        setTitle(`${prefix}: ${module.title}`);
                      }
                    }}
                    className="w-full bg-background/50 border border-border px-2.5 py-2 text-[11px] font-bold text-text-primary outline-none focus:border-accent transition-all rounded-lg"
                  >
                    <option value="">Select a module...</option>
                    {(roadmaps.find(r => r.id === roadmapId)?.roadmap_plan?.modules || []).map((mod: any, i: number) => (
                      <option key={i} value={i + 1}>
                        {mod.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Video URL */}
          {type === 'video' && (
            <div className="animate-in slide-in-from-top-1 duration-300">
              <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-1.5 ml-1">Video URL</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted" />
                <input 
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full bg-background/50 border border-border pl-8.5 pr-3 py-2 text-[11px] font-medium text-text-primary outline-none focus:border-accent transition-all rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Research Decoded Selection */}
          {type === 'research' && (
            <div className="animate-in slide-in-from-top-1 duration-300">
              <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-1.5 ml-1">Select Paper</label>
              <select 
                value={contentSlug}
                onChange={(e) => {
                  const slug = e.target.value;
                  setContentSlug(slug);
                  if (slug && papers[slug]) {
                    setTitle(`Research: ${papers[slug].title}`);
                  }
                }}
                className="w-full bg-background/50 border border-border px-2.5 py-2 text-[11px] font-bold text-text-primary outline-none focus:border-accent transition-all rounded-lg"
              >
                <option value="">Select a paper...</option>
                {Object.entries(papers).map(([slug, paper]) => (
                  <option key={slug} value={slug}>{paper.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Article Selection */}
          {type === 'article' && (
            <div className="animate-in slide-in-from-top-1 duration-300">
              <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-1.5 ml-1">Select Article</label>
              <select 
                value={contentSlug}
                onChange={(e) => {
                  const slug = e.target.value;
                  setContentSlug(slug);
                  if (slug && articles[slug]) {
                    setTitle(`Article: ${articles[slug].title}`);
                  }
                }}
                className="w-full bg-background/50 border border-border px-2.5 py-2 text-[11px] font-bold text-text-primary outline-none focus:border-accent transition-all rounded-lg"
              >
                <option value="">Select an article...</option>
                {Object.entries(articles).map(([slug, article]) => (
                  <option key={slug} value={slug}>{article.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Completion Toggle */}
          {task && (
            <div className="flex items-center gap-2.5 p-3 bg-sidebar/50 border border-border rounded-lg">
              <input 
                type="checkbox"
                checked={isCompleted}
                onChange={(e) => setIsCompleted(e.target.checked)}
                className="w-3.5 h-3.5 accent-accent"
              />
              <span className="text-[11px] font-bold text-text-heading">Mark as completed</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border flex items-center justify-between bg-sidebar/50">
          {task ? (
            <button 
              onClick={handleDelete}
              disabled={loading}
              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          ) : <div />}
          
          <div className="flex gap-2.5">
            <button onClick={onClose} className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-text-heading transition-all">
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={loading || !title}
              className="px-6 py-2.5 bg-text-heading text-background rounded-lg text-[11px] font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all shadow-lg active:scale-[0.98]"
            >
              {loading ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
