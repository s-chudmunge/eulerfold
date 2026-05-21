'use client';

import React from 'react';
import { X, Plus, Calendar, BookOpen, Target, CheckCircle2, Video, Clock, FileText, Book } from 'lucide-react';
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
    if (completed) return 'bg-sidebar/50 text-text-muted border-border';
    switch (type) {
      case 'module': return 'bg-teal-500/10 text-teal-700 border-teal-500/20';
      case 'practice': return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
      case 'pow': return 'bg-rose-500/10 text-rose-700 border-rose-500/20';
      case 'video': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'research': return 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20';
      case 'article': return 'bg-sky-500/10 text-sky-700 border-sky-500/20';
      default: return 'bg-sidebar text-text-primary border-border';
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200 manrope-body">
      <div className="bg-sidebar w-full max-w-[450px] border border-border rounded-xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-sidebar/50">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-accent" />
            <h3 className="text-[14px] font-bold text-text-heading tracking-tight">
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
              <button
                key={task.id}
                onClick={() => onEditTask(task)}
                className={`w-full text-left p-4 rounded-lg border transition-all hover:brightness-95 active:scale-[0.99] flex flex-col gap-2 ${getTaskColor(task.task_type, task.is_completed)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTaskIcon(task.task_type)}
                    <span className="text-[13px] font-bold tracking-tight">{task.title}</span>
                  </div>
                  {task.is_completed && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                </div>
                {task.metadata?.roadmap_title && (
                  <span className="text-[10px] opacity-60 uppercase tracking-widest font-bold">
                    {task.metadata.roadmap_title}
                  </span>
                )}
              </button>
            ))
          ) : (
            <div className="py-12 text-center">
              <p className="text-[13px] text-text-muted italic">No tasks scheduled for this day.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-sidebar/50">
          <button 
            onClick={onAddTask}
            className="w-full flex items-center justify-center gap-2 py-3 bg-text-heading text-background text-[12px] font-bold uppercase tracking-widest hover:opacity-90 transition-all rounded-lg active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add New Task
          </button>
        </div>
      </div>
    </div>
  );
}
