"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Video, 
  Link as LinkIcon, 
  ChevronRight, 
  ChevronDown, 
  Settings2,
  BookOpen,
  Layout,
  Clock,
  CheckCircle2,
  X,
  Target
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api, RoadmapRead } from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';

interface Resource {
  id: string;
  title: string;
  url: string;
}

interface Topic {
  id: string;
  uuid: string;
  title: string;
  youtube_video_id?: string;
  duration?: number;
}

interface Module {
  id: string;
  title: string;
  outcome: string;
  topics: Topic[];
  resources: Resource[];
}

export default function ManualRoadmapBuilder() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [modules, setModules] = useState<Module[]>([
    {
      id: "module_1",
      title: "Module 1",
      outcome: "Describe what will be achieved in this module",
      topics: [
        { id: "topic_1_1", uuid: uuidv4(), title: "First Topic" }
      ],
      resources: []
    }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addModule = () => {
    const newId = `module_${modules.length + 1}`;
    setModules([...modules, {
      id: newId,
      title: `Module ${modules.length + 1}`,
      outcome: "",
      topics: [{ id: `topic_${modules.length + 1}_1`, uuid: uuidv4(), title: "New Topic" }],
      resources: []
    }]);
  };

  const removeModule = (index: number) => {
    if (modules.length === 1) return;
    const newModules = [...modules];
    newModules.splice(index, 1);
    setModules(newModules);
  };

  const updateModule = (index: number, field: keyof Module, value: any) => {
    const newModules = [...modules];
    newModules[index] = { ...newModules[index], [field]: value };
    setModules(newModules);
  };

  const addTopic = (moduleIndex: number) => {
    const newModules = [...modules];
    const m = newModules[moduleIndex];
    m.topics.push({
      id: `topic_${moduleIndex + 1}_${m.topics.length + 1}`,
      uuid: uuidv4(),
      title: "New Topic"
    });
    setModules(newModules);
  };

  const removeTopic = (moduleIndex: number, topicIndex: number) => {
    const newModules = [...modules];
    if (newModules[moduleIndex].topics.length === 1) return;
    newModules[moduleIndex].topics.splice(topicIndex, 1);
    setModules(newModules);
  };

  const updateTopic = (moduleIndex: number, topicIndex: number, field: keyof Topic, value: any) => {
    const newModules = [...modules];
    newModules[moduleIndex].topics[topicIndex] = { 
      ...newModules[moduleIndex].topics[topicIndex], 
      [field]: value 
    };
    setModules(newModules);
  };

  const addResource = (moduleIndex: number) => {
    const newModules = [...modules];
    newModules[moduleIndex].resources.push({
      id: uuidv4(),
      title: "",
      url: ""
    });
    setModules(newModules);
  };

  const removeResource = (moduleIndex: number, resourceIndex: number) => {
    const newModules = [...modules];
    newModules[moduleIndex].resources.splice(resourceIndex, 1);
    setModules(newModules);
  };

  const updateResource = (moduleIndex: number, resourceIndex: number, field: keyof Resource, value: any) => {
    const newModules = [...modules];
    newModules[moduleIndex].resources[resourceIndex] = {
      ...newModules[moduleIndex].resources[resourceIndex],
      [field]: value
    };
    setModules(newModules);
  };

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : undefined;
  };

  const handleSubmit = async () => {
    if (!title || !goal) {
      setError("Please provide a title and goal.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Structure exactly as expected by the frontend display components
      const roadmapPlan = {
        title: title,
        description: goal,
        modules: modules.map(m => ({
          ...m,
          topics: m.topics.map(t => ({
            ...t,
            // Pre-process video ID if they pasted a link
            youtube_video_id: t.youtube_video_id ? extractYoutubeId(t.youtube_video_id) : undefined
          }))
        }))
      };

      // We need a new endpoint or update saveRoadmap to handle this.
      // For now, let's use the manual-build endpoint logic but send the full plan if we can
      // Or just save it normally if we are logged in.
      
      const response = await api.post('/roadmaps/save', {
        title: title,
        description: goal,
        subject: title,
        goal: goal,
        time_value: modules.length, // weeks
        time_unit: "weeks",
        roadmap_plan: roadmapPlan,
        model: "manual-build",
        email: "" // Handled by backend for auth'd users
      });

      if (response.data?.slug) {
        router.push(`/roadmap/${response.data.slug}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to save roadmap.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      {/* Title & Goal */}
      <div className="bg-card border border-border rounded-lg p-4 md:p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-1.5 bg-teal-500/10 rounded-lg text-teal-600">
            <Settings2 className="w-4 h-4" />
          </div>
          <h2 className="inconsolata-ui text-[16px] font-bold text-text-heading uppercase tracking-widest">Base Configuration</h2>
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1.5 inconsolata-ui">Project Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master React Query & Advanced Patterns"
              className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-[14px] font-medium focus:outline-none focus:border-accent transition-all manrope-body"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1.5 inconsolata-ui">Learning Goal</label>
            <textarea 
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="What specifically do you want to achieve?"
              rows={2}
              className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-[14px] font-medium focus:outline-none focus:border-accent transition-all manrope-body resize-none"
            />
          </div>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-600">
              <Layout className="w-4 h-4" />
            </div>
            <h2 className="inconsolata-ui text-[16px] font-bold text-text-heading uppercase tracking-widest">Learning Modules</h2>
          </div>
          <button 
            onClick={addModule}
            className="flex items-center gap-2 px-3 py-1.5 bg-accent text-white rounded-md text-[11px] font-bold tracking-widest uppercase hover:bg-accent/90 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> Add Module
          </button>
        </div>

        {modules.map((module, mIdx) => (
          <div key={module.id} className="bg-card border border-border rounded-lg overflow-hidden shadow-sm group/module">
            {/* Module Header */}
            <div className="bg-sidebar/50 border-b border-border px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="inconsolata-ui w-7 h-7 bg-background border border-border rounded-lg flex items-center justify-center text-[12px] font-bold text-text-heading shrink-0">
                  W{mIdx + 1}
                </div>
                <input 
                  type="text" 
                  value={module.title}
                  onChange={(e) => updateModule(mIdx, 'title', e.target.value)}
                  className="bg-transparent border-none focus:outline-none text-[15px] font-bold text-text-heading w-full placeholder:opacity-30"
                  placeholder="Module Title"
                />
              </div>
              <button 
                onClick={() => removeModule(mIdx)}
                className="p-1.5 text-text-muted hover:text-red-500 transition-colors opacity-0 group-hover/module:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Module Outcome */}
              <div>
                <label className="block text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1.5 inconsolata-ui flex items-center gap-1.5">
                  <Target className="w-3 h-3" /> Target Outcome
                </label>
                <input 
                  type="text" 
                  value={module.outcome}
                  onChange={(e) => updateModule(mIdx, 'outcome', e.target.value)}
                  placeholder="e.g. Building a production-ready dashboard"
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-[12px] font-medium focus:outline-none focus:border-accent transition-all manrope-body"
                />
              </div>

              {/* Topics */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
                  <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest inconsolata-ui flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3" /> Topics & Lessons
                  </label>
                  <button 
                    onClick={() => addTopic(mIdx)}
                    className="text-[9px] font-bold text-accent hover:underline uppercase tracking-widest flex items-center gap-1"
                  >
                    <Plus className="w-2.5 h-2.5" /> Add Topic
                  </button>
                </div>
                
                <div className="grid gap-2">
                  {module.topics.map((topic, tIdx) => (
                    <div key={topic.id} className="bg-background border border-border rounded-md p-3 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="inconsolata-ui text-[10px] font-bold opacity-30 w-5 shrink-0">{mIdx + 1}.{tIdx + 1}</span>
                        <input 
                          type="text" 
                          value={topic.title}
                          onChange={(e) => updateTopic(mIdx, tIdx, 'title', e.target.value)}
                          placeholder="Topic Title"
                          className="bg-transparent border-none focus:outline-none text-[13px] font-semibold text-text-heading flex-1"
                        />
                        <button 
                          onClick={() => removeTopic(mIdx, tIdx)}
                          className="p-1 text-text-muted hover:text-red-500 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2.5 pl-7">
                        <div className="relative flex-1 group/input">
                          <Video className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted group-focus-within/input:text-red-500 transition-colors" />
                          <input 
                            type="text" 
                            value={topic.youtube_video_id || ""}
                            onChange={(e) => updateTopic(mIdx, tIdx, 'youtube_video_id', e.target.value)}
                            placeholder="YouTube Video URL"
                            className="w-full bg-sidebar/30 border border-border rounded-lg pl-8 pr-3 py-1.5 text-[11px] focus:outline-none focus:border-red-500/30 transition-all"
                          />
                        </div>
                        <div className="relative w-full sm:w-[100px] group/input">
                          <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted group-focus-within/input:text-accent transition-colors" />
                          <input 
                            type="number" 
                            value={topic.duration || ""}
                            onChange={(e) => updateTopic(mIdx, tIdx, 'duration', parseInt(e.target.value) || 0)}
                            placeholder="Mins"
                            className="w-full bg-sidebar/30 border border-border rounded-lg pl-8 pr-3 py-1.5 text-[11px] focus:outline-none focus:border-accent/30 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resources */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
                  <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest inconsolata-ui flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3" /> Reading Materials
                  </label>
                  <button 
                    onClick={() => addResource(mIdx)}
                    className="text-[9px] font-bold text-accent hover:underline uppercase tracking-widest flex items-center gap-1"
                  >
                    <Plus className="w-2.5 h-2.5" /> Add Link
                  </button>
                </div>

                <div className="grid gap-2">
                  {module.resources.map((res, rIdx) => (
                    <div key={res.id} className="flex flex-col sm:flex-row gap-2">
                      <input 
                        type="text" 
                        value={res.title}
                        onChange={(e) => updateResource(mIdx, rIdx, 'title', e.target.value)}
                        placeholder="Link Label"
                        className="flex-1 bg-background border border-border rounded-lg px-2.5 py-1.5 text-[11px] font-medium focus:outline-none focus:border-accent"
                      />
                      <div className="flex gap-2 flex-[2]">
                        <input 
                          type="text" 
                          value={res.url}
                          onChange={(e) => updateResource(mIdx, rIdx, 'url', e.target.value)}
                          placeholder="https://..."
                          className="flex-1 bg-background border border-border rounded-lg px-2.5 py-1.5 text-[11px] font-medium focus:outline-none focus:border-accent"
                        />
                        <button 
                          onClick={() => removeResource(mIdx, rIdx)}
                          className="p-1 text-text-muted hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {module.resources.length === 0 && (
                    <p className="text-[10px] text-text-muted italic opacity-50 pl-1">No reading materials added yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex flex-col gap-5 pt-8">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-600 text-[12px] font-bold flex items-center gap-3">
              <X className="w-4 h-4" /> {error}
            </div>
          )}
          
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-max mx-auto px-10 bg-text-heading text-background py-2.5 rounded-lg text-[11px] font-bold tracking-[0.1em] uppercase hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-3 h-3 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                Constructing Project...
              </>
            ) : (
              <>
                <ChevronRight className="w-3.5 h-3.5" /> Launch Manual Build
              </>
            )}
          </button>
          
          <p className="text-center text-[10px] font-medium text-text-muted opacity-50 manrope-body">
            Launch cost: 0.5 Euler Credits. Fully tracked, fully customizable.
          </p>
        </div>
      </div>
    </div>
  );
}
