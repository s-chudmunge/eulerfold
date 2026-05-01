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
  Clock,
  BookOpen,
  Target,
  Video,
  Menu,
  X,
  FileText,
  Book,
  Trash2
} from 'lucide-react';
import { plannerAPI, sessionsAPI, User } from '@/lib/api';
import AppSidebar from '@/components/AppSidebar';
import { useAuth } from '@/components/AuthProvider';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addDays, parseISO } from 'date-fns';
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
    <div className="fixed inset-0 z-[100] flex flex-col bg-background text-text-primary selection:bg-teal-500/30 selection:text-text-heading overflow-hidden">
      {/* Header */}
      <header className="inconsolata-ui border-b border-border bg-header h-[48px] shrink-0 z-50">
        <div className="w-full px-4 md:px-6 flex h-full items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 lg:hidden text-text-muted hover:text-text-heading transition-colors"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-accent" />
              <h1 className="text-[14px] font-bold uppercase tracking-[0.2em] text-text-heading">Study Planner</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 mr-2 text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-text-heading border border-border rounded-md hover:bg-sidebar/50 transition-all"
            >
              Today
            </button>
            <div className="flex items-center bg-sidebar/50 border border-border p-0.5 rounded-lg mr-4">
              <button onClick={prevMonth} className="p-1.5 hover:bg-background rounded-md text-text-muted transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-4 text-[11px] font-black uppercase tracking-widest text-text-heading min-w-[140px] text-center">
                {format(currentDate, 'MMMM yyyy')}
              </span>
              <button onClick={nextMonth} className="p-1.5 hover:bg-background rounded-md text-text-muted transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button 
              onClick={() => setIsGenerateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-1.5 bg-accent/10 text-accent border border-accent/20 rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-accent/20 transition-all"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Generate Plan</span>
            </button>

            {tasks.length > 0 && (
              <button 
                onClick={handleClearMonth}
                className="flex items-center gap-2 px-4 py-1.5 text-red-500/70 hover:text-red-500 border border-transparent hover:border-red-500/20 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Clear Month</span>
              </button>
            )}

            <button 
              onClick={() => {
                setSelectedTask(null);
                setSelectedDate(new Date());
                setIsTaskModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-1.5 bg-text-heading text-background rounded-md text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
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
          <div className="grid grid-cols-7 border-b border-border bg-sidebar/20">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-2 text-center text-[10px] font-black uppercase tracking-[0.2em] text-text-muted border-r border-border last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 grid grid-cols-7 overflow-y-auto no-scrollbar auto-rows-fr">
            {calendarDays.map((day, idx) => {
              const dayTasks = tasks.filter(t => isSameDay(parseISO(t.scheduled_date), day));
              const daySessions = sessions.filter(s => isSameDay(parseISO(s.created_at), day));
              const totalSeconds = daySessions.reduce((acc, s) => acc + s.duration_seconds, 0);
              const hours = Math.floor(totalSeconds / 3600);
              const minutes = Math.floor((totalSeconds % 3600) / 60);

              const isCurrentMonth = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, new Date());

              return (
                <div 
                  key={idx} 
                  onClick={() => setExpandedDate(day)}
                  className={`min-h-[120px] p-2 border-r border-b border-border transition-colors group relative cursor-pointer hover:bg-sidebar/5 ${!isCurrentMonth ? 'bg-sidebar/5 opacity-30' : 'bg-background'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span 
                        className={`inconsolata-ui text-[11px] font-bold transition-transform ${isToday ? 'w-6 h-6 flex items-center justify-center bg-accent text-white rounded-full' : 'text-text-muted'}`}
                      >
                        {format(day, 'd')}
                      </span>
                      {totalSeconds > 0 && (
                        <span className="text-[9px] font-black text-accent/70 uppercase tracking-tighter">
                          {hours > 0 ? `${hours}h ` : ''}{minutes}m
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDate(day);
                        setSelectedTask(null);
                        setIsTaskModalOpen(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-sidebar rounded text-text-muted transition-all"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div 
                    className="space-y-1 overflow-y-auto max-h-[calc(100%-28px)] no-scrollbar"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {dayTasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTask(task);
                          setIsTaskModalOpen(true);
                        }}
                        className={`w-full text-left p-1.5 rounded border text-[10px] font-bold flex flex-col gap-1 transition-all hover:brightness-95 active:scale-[0.98] ${getTaskColor(task.task_type, task.is_completed)}`}
                      >
                        <div className="flex items-center gap-1.5 w-full">
                          {getTaskIcon(task.task_type)}
                          <span className="truncate flex-1">{task.title}</span>
                        </div>
                      </button>
                    ))}
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
