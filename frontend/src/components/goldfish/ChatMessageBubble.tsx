'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { BookOpen, ExternalLink, Globe, Sparkles } from 'lucide-react';
import { GoldfishAvatar } from './GoldfishAvatar';
import { ScheduleCard } from './ScheduleCard';
import { ChatMessage, GoldfishAgentState } from './types';
import { TreeIllustration } from '@/components/roadmap/FocusGrove';

interface ChatMessageBubbleProps {
  msg: ChatMessage;
  agentState: GoldfishAgentState;
  currentModuleIndex: number;
  isGoogleCalendarConnected: boolean;
  approvedMap: Record<string, string>;
  setApprovedMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onOpenSettings: (tab: string) => void;
  onCloseModal: () => void;
  isTimerActive: boolean;
  secondsRemaining: number;
  timerDurationMins: number;
  currentTimerTreeStage: any;
  formatTime: (secs: number) => string;
  onStartTimer: (mins: number) => void;
  onPauseTimer: () => void;
}

export function ChatMessageBubble({
  msg,
  agentState,
  currentModuleIndex,
  isGoogleCalendarConnected,
  approvedMap,
  setApprovedMap,
  onOpenSettings,
  onCloseModal,
  isTimerActive,
  secondsRemaining,
  timerDurationMins,
  currentTimerTreeStage,
  formatTime,
  onStartTimer,
  onPauseTimer
}: ChatMessageBubbleProps) {
  const isGoldfish = msg.sender === 'goldfish';

  return (
    <div className={`flex gap-3 ${isGoldfish ? 'items-start' : 'items-start flex-row-reverse'}`}>
      {isGoldfish ? (
        <GoldfishAvatar state={agentState === 'happy' ? 'happy' : 'idle'} size={32} />
      ) : (
        <div className="w-8 h-8 rounded-full bg-text-heading text-background flex items-center justify-center font-bold text-[11px] shrink-0">
          You
        </div>
      )}

      <div className={`space-y-2 max-w-[88%] ${isGoldfish ? '' : 'text-right'}`}>
        <div className={`p-3 rounded-md text-[13px] leading-relaxed ${
          isGoldfish 
            ? 'bg-sidebar border border-border text-text-primary text-left' 
            : 'bg-accent text-background text-left font-medium'
        }`}>
          {isGoldfish && msg.tools_used && msg.tools_used.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2.5 pb-2 border-b border-border/60">
              {msg.tools_used.map((t, idx) => (
                <span 
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent/10 border border-accent/20 text-[10.5px] font-semibold text-accent"
                >
                  {t.tool === 'web_search' ? <Globe className="w-3 h-3 shrink-0" /> : <Sparkles className="w-3 h-3 shrink-0" />}
                  <span>{t.label || (t.tool === 'web_search' ? 'Web Search' : t.tool)}</span>
                </span>
              ))}
            </div>
          )}

          {isGoldfish ? (
            <div className="text-[13px] leading-relaxed space-y-2">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-text-primary">{children}</p>,
                  h1: ({ children }) => <h1 className="text-[15px] font-bold text-text-heading mt-3 mb-1.5 first:mt-0">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-[14px] font-bold text-text-heading mt-3 mb-1.5 first:mt-0">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-[13px] font-bold text-text-heading mt-2.5 mb-1 first:mt-0">{children}</h3>,
                  ul: ({ children }) => <ul className="list-disc list-outside ml-4 mb-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-outside ml-4 mb-2 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-text-primary leading-relaxed">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold text-text-heading">{children}</strong>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-accent/60 pl-3 my-2 text-text-muted italic bg-callout-bg/40 py-1 rounded-r-sm">
                      {children}
                    </blockquote>
                  ),
                  code: ({ className, children, ...props }: any) => {
                    const isInline = !className && typeof children === 'string' && !children.includes('\n');
                    if (isInline) {
                      return (
                        <code className="bg-callout-bg text-text-heading px-1.5 py-0.5 rounded-sm text-[12px] font-mono border border-border/60" {...props}>
                          {children}
                        </code>
                      );
                    }
                    return (
                      <pre className="p-2.5 bg-[#1a2424] text-gray-100 rounded-md overflow-x-auto text-[12px] font-mono my-2 border border-border">
                        <code>{children}</code>
                      </pre>
                    );
                  },
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2 hover:opacity-80">
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-2 rounded-md border border-border">
                      <table className="border-collapse text-[12px] w-full">{children}</table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border-b border-border px-2.5 py-1.5 text-left text-[11px] font-bold uppercase tracking-wider text-text-muted bg-background">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border-b border-border/60 px-2.5 py-1 text-text-primary">
                      {children}
                    </td>
                  ),
                  hr: () => <hr className="border-border my-2.5" />
                }}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{msg.text}</p>
          )}
        </div>

        {/* Rich Response: Resources */}
        {msg.type === 'resources' && Array.isArray(msg.data) && (
          <div className="space-y-1.5 pt-1 text-left">
            {msg.data.map((res: any, idx: number) => (
              <a
                key={idx}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-md bg-sidebar border border-border hover:border-accent/50 transition-all group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <BookOpen className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="text-[12px] font-semibold text-text-heading truncate group-hover:text-accent">
                    {res.title}
                  </span>
                </div>
                <ExternalLink className="w-3 h-3 text-text-muted group-hover:text-accent shrink-0 ml-2" />
              </a>
            ))}
          </div>
        )}

        {/* Rich Response: Schedule with 1-Click Approval */}
        {msg.type === 'schedule' && msg.data && (
          <ScheduleCard
            msg={msg}
            currentModuleIndex={currentModuleIndex}
            isGoogleCalendarConnected={isGoogleCalendarConnected}
            approvedMap={approvedMap}
            setApprovedMap={setApprovedMap}
            onOpenSettings={onOpenSettings}
            onCloseModal={onCloseModal}
          />
        )}

        {/* Rich Response: Focus Pomodoro */}
        {msg.type === 'focus' && (
          <div className="pt-1 text-left">
            <div className="p-3 bg-sidebar border border-border rounded-md flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <TreeIllustration stage={currentTimerTreeStage} size={36} />
                <div>
                  <p className="text-[12px] font-bold text-text-heading font-mono">
                    {formatTime(secondsRemaining)}
                  </p>
                  <p className="text-[10px] text-text-muted">
                    {isTimerActive ? "Focus timer running" : "Timer ready"}
                  </p>
                </div>
              </div>
              {!isTimerActive ? (
                <button
                  onClick={() => onStartTimer(timerDurationMins)}
                  className="px-3 py-1 bg-accent text-background rounded-md text-[11px] font-bold hover:opacity-90 transition-opacity"
                >
                  Resume
                </button>
              ) : (
                <button
                  onClick={onPauseTimer}
                  className="px-3 py-1 bg-background border border-border rounded-md text-[11px] font-bold text-text-heading hover:bg-callout-bg transition-colors"
                >
                  Pause
                </button>
              )}
            </div>
          </div>
        )}

        <span className="text-[10px] text-text-muted px-1 font-mono">
          {msg.timestamp}
        </span>
      </div>
    </div>
  );
}
