'use client';

import React from 'react';
import { X, Plus, Calendar, BookOpen, Target, CheckCircle2, Check, Video, Clock, FileText, Book } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  date: Date;
  tasks: any[];
  onClose: () => void;
  onEditTask: (task: any) => void;
  onAddTask: () => void;
}

export default function DayDetailModal({ date, tasks, onClose, onEditTask, onAddTask }: Props) {
  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'module': return <span className="text-[12px]">🧊</span>;
      case 'practice': return <span className="text-[12px]">🛠️</span>;
      case 'pow': return <span className="text-[12px]">⛩️</span>;
      case 'video': return <span className="text-[12px]">🎞️</span>;
      case 'research': return <span className="text-[12px]">🧬</span>;
      case 'article': return <span className="text-[12px]">🖋️</span>;
      default: return <span className="text-[12px]">💠</span>;
    }
  };

  const getTaskColor = (type: string, completed: boolean) => {
    const base = "bg-sidebar/40 border-border/40";
    if (completed) return `${base} text-text-muted opacity-50`;
    switch (type) {
      case 'module': return `${base} text-emerald-400`;
      case 'practice': return `${base} text-orange-400`;
      case 'pow': return `${base} text-violet-400`;
      case 'video': return `${base} text-cyan-400`;
      case 'research': return `${base} text-indigo-400`;
      case 'article': return `${base} text-fuchsia-400`;
      default: return `${base} text-text-primary`;
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200 manrope-body">
      <div className="bg-sidebar w-full max-w-[420px] border border-border rounded-lg shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-sidebar/50">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-accent" />
            <h3 className="text-[16px] font-bold text-text-heading tracking-tight">
              {format(date, 'MMMM d, yyyy')}
            </h3>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-heading transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 no-scrollbar">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`w-full text-left p-4 rounded-lg border transition-all flex flex-col gap-2.5 relative group/task shadow-sm ${getTaskColor(task.task_type, task.is_completed)}`}
              >
                <div className="flex items-center justify-between pr-2">
                  <button 
                    onClick={() => onEditTask(task)}
                    className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                  >
                    {getTaskIcon(task.task_type)}
                    <span className="text-[14.5px] font-bold tracking-tight leading-tight text-left">{task.title?.replace("Proof of Work", "Homework")}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between mt-1 pt-3 border-t border-white/10">
                  <button 
                    onClick={async (e) => {
                        e.stopPropagation();
                        try {
                            const { plannerAPI } = await import('@/lib/api');
                            await plannerAPI.updateTask(task.id, { is_completed: !task.is_completed });
                            onClose(); 
                        } catch (err) {
                            console.error(err);
                        }
                    }}
                    className="flex items-center gap-2.5 group/check"
                  >
                    <div className={`w-4.5 h-4.5 rounded-[4px] border transition-all flex items-center justify-center ${
                      task.is_completed 
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                      : "border-white/30 group-hover/check:border-white/60"
                    }`}>
                      {task.is_completed && <Check className="w-3 h-3 stroke-[4px]" />}
                    </div>
                    <span className={`text-[11px] uppercase tracking-widest font-black transition-colors ${task.is_completed ? "text-emerald-400" : "text-white/70 group-hover/check:text-white"}`}>
                      {task.is_completed ? "Marked as completed" : "Mark as completed"}
                    </span>
                  </button>

                  {task.metadata?.roadmap_title && (
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">
                      {task.metadata.roadmap_title}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <p className="text-[14px] text-text-muted italic">No tasks scheduled for this day.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-border bg-sidebar/50">
          <button 
            onClick={onAddTask}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-text-heading text-background text-[11px] font-bold uppercase tracking-widest hover:opacity-90 transition-all rounded-lg active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Task
          </button>
        </div>
      </div>
    </div>
  );
}
