'use client';

import React from 'react';
import { Calendar, Sparkles, Check, CheckCircle2, BookOpen } from 'lucide-react';
import { ChatMessage } from './types';

interface ScheduleCardProps {
  msg: ChatMessage;
  currentModuleIndex: number;
  isGoogleCalendarConnected: boolean;
  approvedMap: Record<string, string>;
  setApprovedMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onOpenSettings: (tab: string) => void;
  onCloseModal: () => void;
}

export function ScheduleCard({
  msg,
  currentModuleIndex,
  isGoogleCalendarConnected,
  approvedMap,
  setApprovedMap,
  onOpenSettings,
  onCloseModal
}: ScheduleCardProps) {
  if (!msg.data) return null;

  return (
    <div className="space-y-2.5 pt-1 text-left">
      <div className="p-3 bg-sidebar border border-border rounded-md space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-border text-[11px] font-bold text-text-heading">
          <span>Proposed Week Schedule</span>
          <span className="px-1.5 py-0.5 rounded-sm text-[9.5px] bg-accent/10 text-accent uppercase font-bold tracking-wider">
            {msg.data.intensity || 'Balanced'}
          </span>
        </div>

        {msg.data.strategyNote && (
          <p className="text-[11.5px] text-text-muted italic bg-callout-bg/60 p-2 rounded-sm border border-border/40">
            💡 {msg.data.strategyNote}
          </p>
        )}

        <div className="space-y-1.5">
          {msg.data.schedule?.map((item: any, idx: number) => (
            <div key={idx} className="flex items-start justify-between text-[11px] py-1.5 border-b border-border/30 last:border-0 gap-2">
              <div className="w-24 shrink-0">
                <span className="font-bold text-text-heading block">{item.day}</span>
                {item.formatted_date && (
                  <span className="text-[9.5px] text-text-muted block font-mono">{item.formatted_date.split(',')[0]}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-text-primary font-medium block leading-tight">{item.title}</span>
                {item.focus_hint && (
                  <span className="text-[10.5px] text-text-muted line-clamp-2 mt-0.5 leading-snug">{item.focus_hint}</span>
                )}
              </div>
              <a
                href={item.google_calendar_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline font-bold text-[10px] shrink-0 mt-0.5"
              >
                GCal &rarr;
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* 1-Click Approval & Sync Options */}
      <div className="p-3 bg-sidebar/90 border border-border rounded-md space-y-2">
        <p className="text-[11px] font-bold text-text-heading flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>1-Click Approve & Sync</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {/* 1-Click Google Calendar Action */}
          {isGoogleCalendarConnected ? (
            <button
              onClick={() => {
                const events = msg.data.schedule || [];
                events.forEach((item: any, i: number) => {
                  if (item.google_calendar_url) {
                    setTimeout(() => {
                      window.open(item.google_calendar_url, '_blank');
                    }, i * 150);
                  }
                });
                setApprovedMap(prev => ({ ...prev, [msg.id]: 'Google Calendar' }));
              }}
              title="Opens quick-add pages for all scheduled study sessions"
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-background hover:bg-callout-bg border border-emerald-500/30 rounded-md text-[11px] font-bold text-text-heading transition-all shadow-2xs hover:scale-101"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>1-Click Sync All to Calendar</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onCloseModal();
                onOpenSettings('connections');
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-background hover:bg-callout-bg border border-border rounded-md text-[11px] font-bold text-text-heading transition-all shadow-2xs hover:scale-101"
            >
              <Calendar className="w-3.5 h-3.5 text-orange-600" />
              <span>Connect Google Calendar</span>
            </button>
          )}

          {/* 1-Click Notion */}
          <button
            onClick={() => {
              const notionText = `# Study Plan: Week ${currentModuleIndex + 1}\n\n` + 
                (msg.data.schedule || []).map((s: any) => `- [ ] **${s.day}**: ${s.title}`).join('\n');
              navigator.clipboard.writeText(notionText);
              setApprovedMap(prev => ({ ...prev, [msg.id]: 'Notion' }));
              window.open('https://www.notion.so', '_blank');
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-background hover:bg-callout-bg border border-border rounded-md text-[11px] font-bold text-text-heading transition-all shadow-2xs hover:scale-101"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export to Notion</span>
          </button>

          {/* 1-Click Todoist */}
          <button
            onClick={() => {
              const todoistTasks = (msg.data.schedule || []).map((s: any) => s.title).join(', ');
              navigator.clipboard.writeText(todoistTasks);
              setApprovedMap(prev => ({ ...prev, [msg.id]: 'Todoist' }));
              window.open('https://app.todoist.com/app/today', '_blank');
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-background hover:bg-callout-bg border border-border rounded-md text-[11px] font-bold text-text-heading transition-all shadow-2xs hover:scale-101"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
            <span>Send to Todoist</span>
          </button>

          {/* 1-Click EulerFold Planner */}
          <button
            onClick={() => {
              setApprovedMap(prev => ({ ...prev, [msg.id]: 'EulerFold Planner' }));
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-accent text-background rounded-md text-[11px] font-bold hover:opacity-90 transition-all shadow-2xs hover:scale-101"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save to Study Planner</span>
          </button>
        </div>

        {approvedMap[msg.id] && (
          <div className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-md flex items-center gap-2 text-[11px] font-bold text-emerald-600 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Approved and synced to {approvedMap[msg.id]}!</span>
          </div>
        )}
      </div>
    </div>
  );
}
