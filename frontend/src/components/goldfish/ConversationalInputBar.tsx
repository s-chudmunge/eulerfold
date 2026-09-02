'use client';

import React from 'react';
import { Send } from 'lucide-react';
import { GoldfishTab, GoldfishAgentState } from './types';

interface ConversationalInputBarProps {
  inputText: string;
  setInputText: (text: string) => void;
  activeTab: GoldfishTab;
  agentState: GoldfishAgentState;
  onSubmit: () => void;
}

export function ConversationalInputBar({
  inputText,
  setInputText,
  activeTab,
  agentState,
  onSubmit
}: ConversationalInputBarProps) {
  const getPlaceholder = () => {
    switch (activeTab) {
      case 'chat':
        return "Ask any question, request analogies, math derivations, code examples...";
      case 'reading':
        return "Ask for specific reading notes, PDFs, or repos...";
      case 'video':
        return "Specify video style (e.g. 10min whiteboard, Stanford lecture)...";
      case 'calendar':
        return "Ask Goldfish to schedule your week (e.g. 'I have time for 3 topics next week')...";
      case 'focus':
        return "e.g. 'Start my pomodoro for 40 min', 'Pause timer'...";
      default:
        return "Ask Goldfish anything...";
    }
  };

  return (
    <div className="p-3 border-t border-border bg-sidebar shrink-0">
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={agentState !== 'idle'}
          placeholder={getPlaceholder()}
          className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-[13px] text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-accent"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || agentState !== 'idle'}
          className="px-4 py-2 bg-accent text-background rounded-md text-[12px] font-bold hover:opacity-90 transition-all disabled:opacity-40 flex items-center gap-1.5 shrink-0"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
