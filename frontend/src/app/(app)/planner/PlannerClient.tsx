'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  Wand2,
  Settings,
  MoreVertical,
  CheckCircle2,
  Check,
  Clock,
  BookOpen,
  Target,
  Video,
  Menu,
  X,
  FileText,
  Book,
  Trash2,
  ArrowUpRight
} from 'lucide-react';
import { plannerAPI, sessionsAPI, User } from '@/lib/api';
import AppSidebar from '@/components/AppSidebar';
import { useAuth } from '@/components/AuthProvider';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addDays, parseISO } from 'date-fns';
import Link from 'next/link';
import TaskModal from '@/components/planner/TaskModal';
import GeneratePlanModal from '@/components/planner/GeneratePlanModal';
import DayDetailModal from '@/components/planner/DayDetailModal';

export default function PlannerClient() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<any[]>([]);
  const [sessions, setSessions] = useState<{ duration_seconds: number, created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [expandedDate, setExpandedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [currentDate]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const start = format(startOfWeek(startOfMonth(currentDate)), 'yyyy-MM-dd');
      const end = format(endOfWeek(endOfMonth(currentDate)), 'yyyy-MM-dd');
      
      const [taskData, sessionData] = await Promise.all([
        plannerAPI.getTasks(start, end),
        sessionsAPI.getSessionsRange(start, end)
      ]);
      
      setTasks(taskData);
      setSessions(sessionData);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (task: any, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await plannerAPI.updateTask(task.id, {
        is_completed: !task.is_completed
      });
      fetchTasks();
    } catch (err) {
      console.error("Failed to toggle completion", err);
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleClearMonth = async () => {
    const monthName = format(currentDate, 'MMMM');
    if (!confirm(`Are you sure you want to clear all tasks for ${monthName}? This cannot be undone.`)) return;
    
    try {
      const start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentDate), 'yyyy-MM-dd');
      await plannerAPI.deleteTasksRange(start, end);
      fetchTasks();
    } catch (err) {
      console.error("Failed to clear month", err);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'module': return <span className="text-[10px]">🧊</span>;
      case 'practice': return <span className="text-[10px]">🛠️</span>;
      case 'pow': return <span className="text-[10px]">⛩️</span>;
      case 'video': return <span className="text-[10px]">🎞️</span>;
      case 'research': return <span className="text-[10px]">🧬</span>;
      case 'article': return <span className="text-[10px]">🖋️</span>;
      default: return <span className="text-[10px]">💠</span>;
    }
  };

  const getTaskLink = (task: any) => {
    if (!task.roadmap_id) return null;
    const roadmap = tasks.find(t => t.roadmap_id === task.roadmap_id);
    const slug = task.metadata?.roadmap_slug || roadmap?.metadata?.roadmap_slug;
    
    if (slug) {
      return `/roadmap/${slug}`;
    }
    return null;
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
    <div className="fixed inset-0 z-[100] flex flex-col bg-background text-text-primary selection:bg-teal-500/30 selection:text-text-heading overflow-hidden">
      {/* Header */}
      <header className="inconsolata-ui border-b border-border bg-header h-[48px] shrink-0 z-50">
        <div className="w-full px-4 md:px-6 flex h-full items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 lg:hidden text-text-muted hover:text-text-heading transition-colors"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity active:scale-95 duration-200">
              <img src="/apple-touch-icon.png" alt="" className="w-5 h-5" />
              <span className="text-[14px] font-bold text-text-muted tracking-tight hidden sm:block">Euler<span className="text-teal-700/80">Fold</span></span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                const today = new Date();
                setCurrentDate(today);
                setExpandedDate(today);
              }}
              className="px-4 py-2 mr-2 text-[11px] font-bold uppercase tracking-widest text-text-heading border border-border rounded-md hover:bg-sidebar/50 transition-all shadow-sm active:scale-95"
            >
              Today
            </button>
            <div className="flex items-center bg-sidebar border border-border p-1 rounded-lg mr-4 shadow-sm">
              <button onClick={prevMonth} className="p-2 hover:bg-background rounded-md text-text-heading transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-6 text-[13px] font-black uppercase tracking-widest text-text-heading min-w-[180px] text-center">
                {format(currentDate, 'MMMM yyyy')}
              </span>
              <button onClick={nextMonth} className="p-2 hover:bg-background rounded-md text-text-heading transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <button 
              onClick={() => setIsGenerateModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2 bg-accent text-white rounded-md text-[11px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-md"
            >
              <Wand2 className="w-4 h-4" />
              <span className="hidden md:inline">Generate Plan</span>
            </button>

            {tasks.length > 0 && (
              <button 
                onClick={handleClearMonth}
                className="flex items-center gap-2 px-5 py-2 text-red-500 hover:bg-red-500/10 border border-red-500/20 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden md:inline">Clear Month</span>
              </button>
            )}

            <button 
              onClick={() => {
                setSelectedTask(null);
                setSelectedDate(new Date());
                setIsTaskModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2 bg-text-heading text-background rounded-md text-[11px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">Add Task</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        <AppSidebar 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 h-full flex flex-col bg-background overflow-hidden">
          {/* Calendar Grid Header */}
          <div className="grid grid-cols-7 border-b border-border bg-sidebar/30">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-3 text-center text-[11px] font-black uppercase tracking-[0.2em] text-text-heading border-r border-border last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 grid grid-cols-7 overflow-y-auto no-scrollbar auto-rows-fr">
            {calendarDays.map((day, idx) => {
              const dayTasks = tasks.filter(t => isSameDay(parseISO(t.scheduled_date), day));
              const daySessions = sessions.filter(s => isSameDay(parseISO(s.created_at), day));
              
              // Calculate activity count (completed tasks + sessions)
              const activityCount = dayTasks.filter(t => t.is_completed).length + daySessions.length;
              
              const totalSeconds = daySessions.reduce((acc, s) => acc + s.duration_seconds, 0);
              const hours = Math.floor(totalSeconds / 3600);
              const minutes = Math.floor((totalSeconds % 3600) / 60);

              const isCurrentMonth = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, new Date());

              // Calculate intensity based on activityCount (matches ActivityHeatmap logic)
              let intensityBarClass = '';
              if (isCurrentMonth) {
                if (activityCount > 0) intensityBarClass = 'bg-accent/30';
                if (activityCount > 2) intensityBarClass = 'bg-accent/50';
                if (activityCount > 5) intensityBarClass = 'bg-accent/80';
                if (activityCount > 10) intensityBarClass = 'bg-accent';
              }

              return (
                <div 
                  key={idx} 
                  onClick={() => setExpandedDate(day)}
                  className={`min-h-[140px] p-3 border-r border-b border-border transition-colors group relative cursor-pointer hover:bg-sidebar/10 ${!isCurrentMonth ? 'bg-sidebar/5 opacity-30' : 'bg-background'}`}
                >
                  {/* Activity Intensity Bar */}
                  {intensityBarClass && (
                    <div className={`absolute top-0 left-0 right-0 h-[3px] ${intensityBarClass} transition-colors`} />
                  )}

                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <span 
                        className={`inconsolata-ui text-[14px] font-bold transition-transform ${isToday ? 'w-8 h-8 flex items-center justify-center bg-accent text-white rounded-full' : 'text-text-heading'}`}
                      >
                        {format(day, 'd')}
                      </span>
                      {activityCount > 0 && (
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-accent uppercase tracking-tighter">
                            {activityCount} {activityCount === 1 ? 'action' : 'actions'}
                          </span>
                          {totalSeconds > 0 && (
                            <span className="text-[10px] font-bold text-text-heading uppercase tracking-tighter">
                              {hours > 0 ? `${hours}h ` : ''}{minutes}m
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDate(day);
                        setSelectedTask(null);
                        setIsTaskModalOpen(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 bg-sidebar hover:bg-background border border-border rounded text-text-heading transition-all shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                    <div 
                    className="space-y-1.5 overflow-y-auto max-h-[calc(100%-40px)] no-scrollbar"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {dayTasks.map((task) => {
                      const link = getTaskLink(task);
                      const TaskWrapper = link ? Link : 'div';
                      
                      return (
                        <TaskWrapper
                          key={task.id}
                          href={link || '#'}
                          onClick={(e: any) => {
                            if (link && (task.task_type === 'practice' || task.task_type === 'pow')) {
                              if (!confirm("This feature has moved to the Roadmap page. Redirect there now?")) {
                                e.preventDefault();
                                return;
                              }
                            }
                            if (!link) {
                              e.stopPropagation();
                              setSelectedTask(task);
                              setIsTaskModalOpen(true);
                            }
                          }}
                          className={`w-full text-left p-2 rounded-md border text-[12px] font-bold flex flex-col gap-1.5 transition-all hover:brightness-110 active:scale-[0.98] relative group/task shadow-sm ${getTaskColor(task.task_type, task.is_completed)}`}
                        >
                          <div className="flex items-start gap-1.5 w-full pr-1">
                            {getTaskIcon(task.task_type)}
                            <span className="line-clamp-2 flex-1 leading-[1.2] whitespace-normal text-[11px]">{task.title?.replace("Proof of Work", "Homework")}</span>
                          </div>

                          <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-white/10">
                            <button 
                              onClick={(e) => toggleTaskCompletion(task, e)}
                              className="flex items-center gap-2 group/check"
                            >
                              <div className={`w-3.5 h-3.5 rounded-[3px] border transition-all flex items-center justify-center ${
                                task.is_completed 
                                ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
                                : "border-white/30 group-hover/check:border-white/60"
                              }`}>
                                {task.is_completed && <Check className="w-2.5 h-2.5 stroke-[4px]" />}
                              </div>
                              <span className={`text-[10px] uppercase tracking-widest font-black transition-colors ${task.is_completed ? "text-emerald-400" : "text-white/60 group-hover/check:text-white"}`}>
                                {task.is_completed ? "Done" : "Complete"}
                              </span>
                            </button>

                            {link && (
                               <ArrowUpRight className="w-3.5 h-3.5 opacity-40 group-hover/task:opacity-100 transition-opacity" />
                            )}
                          </div>
                        </TaskWrapper>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {isTaskModalOpen && (
        <TaskModal 
          task={selectedTask}
          initialDate={selectedDate}
          onClose={() => setIsTaskModalOpen(false)}
          onRefresh={fetchTasks}
        />
      )}

      {isGenerateModalOpen && (
        <GeneratePlanModal 
          onClose={() => setIsGenerateModalOpen(false)}
          onRefresh={fetchTasks}
        />
      )}

      {expandedDate && (
        <DayDetailModal 
          date={expandedDate}
          tasks={tasks.filter(t => isSameDay(parseISO(t.scheduled_date), expandedDate))}
          onClose={() => setExpandedDate(null)}
          onEditTask={(task) => {
            setSelectedTask(task);
            setIsTaskModalOpen(true);
            setExpandedDate(null);
          }}
          onAddTask={() => {
            setSelectedTask(null);
            setSelectedDate(expandedDate);
            setIsTaskModalOpen(true);
            setExpandedDate(null);
          }}
        />
      )}
    </div>
  );
}
