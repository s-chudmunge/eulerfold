'use client';

import React from 'react';
import { X, Settings, MessageSquare, BookOpen, Video, Calendar, RotateCcw } from 'lucide-react';
import { GoldfishAvatar } from './GoldfishAvatar';
import { GoldfishTab, GoldfishAgentState } from './types';

interface AssistantHeaderProps {
  agentState: GoldfishAgentState;
  activeTab: GoldfishTab;
  currentTopicTitle?: string;
  currentModuleIndex: number;
  isTimerActive: boolean;
  onTabChange: (tab: GoldfishTab) => void;
  onClearChat: () => void;
  onOpenSettings: (tab: string) => void;
  onClose: () => void;
}

export function AssistantHeader({
  agentState,
  activeTab,
  currentTopicTitle,
  currentModuleIndex,
  isTimerActive,
  onTabChange,
  onClearChat,
  onOpenSettings,
  onClose
}: AssistantHeaderProps) {
  return (
    <div className="shrink-0">
      {/* Top Title Bar */}
      <div className="p-3.5 border-b border-border bg-sidebar flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <GoldfishAvatar state={agentState} size={28} />
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-[13px] font-bold text-text-heading">Goldfish AI Co-Pilot</h2>
              <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-accent/10 text-accent uppercase">
                Active
              </span>
            </div>
            <p className="text-[10.5px] text-text-muted truncate max-w-[240px] sm:max-w-[320px]">
              Module {currentModuleIndex + 1}: {currentTopicTitle || 'Active Topic'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button 
            onClick={onClearChat}
            className="p-1.5 rounded-md text-text-muted hover:text-red-500 hover:bg-callout-bg transition-colors"
            title="Clear Chat & Reset History"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              onClose();
              onOpenSettings('connections');
            }}
            className="p-1.5 rounded-md text-text-muted hover:text-text-heading hover:bg-callout-bg transition-colors"
            title="Manage Calendar & App Connections"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:text-text-heading hover:bg-callout-bg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex border-b border-border bg-sidebar/50 px-3 pt-1 gap-1 text-[12px] font-semibold overflow-x-auto no-scrollbar">
        <button
          onClick={() => onTabChange('chat')}
          className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 rounded-t-md transition-all shrink-0 ${
            activeTab === 'chat'
              ? 'border-accent text-accent bg-background font-bold'
              : 'border-transparent text-text-muted hover:text-text-heading'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Assistant</span>
        </button>

        <button
          onClick={() => onTabChange('reading')}
          className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 rounded-t-md transition-all shrink-0 ${
            activeTab === 'reading'
              ? 'border-accent text-accent bg-background font-bold'
              : 'border-transparent text-text-muted hover:text-text-heading'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Reading</span>
        </button>

        <button
          onClick={() => onTabChange('video')}
          className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 rounded-t-md transition-all shrink-0 ${
            activeTab === 'video'
              ? 'border-accent text-accent bg-background font-bold'
              : 'border-transparent text-text-muted hover:text-text-heading'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Lecture</span>
        </button>

        <button
          onClick={() => onTabChange('calendar')}
          className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 rounded-t-md transition-all shrink-0 ${
            activeTab === 'calendar'
              ? 'border-accent text-accent bg-background font-bold'
              : 'border-transparent text-text-muted hover:text-text-heading'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Schedule</span>
        </button>
      </div>
    </div>
  );
}
