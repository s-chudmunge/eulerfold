'use client';

import React from 'react';
import { GoldfishTab, GoldfishAgentState } from './types';

interface QuickChipsBarProps {
  activeTab: GoldfishTab;
  agentState: GoldfishAgentState;
  tabContextPrompts: Record<string, string[]>;
  onSelectChip: (chip: string) => void;
}

export function QuickChipsBar({
  activeTab,
  agentState,
  tabContextPrompts,
  onSelectChip
}: QuickChipsBarProps) {
  const chips = tabContextPrompts[activeTab] || [];
  if (chips.length === 0) return null;

  return (
    <div className="px-3 py-2 border-t border-border bg-sidebar/30 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
      {chips.map((chip, idx) => (
        <button
          key={idx}
          disabled={agentState !== 'idle'}
          onClick={() => onSelectChip(chip)}
          className="px-2.5 py-1 bg-background hover:bg-callout-bg border border-border rounded-md text-[11px] text-text-muted hover:text-text-heading whitespace-nowrap transition-colors disabled:opacity-50"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
