'use client';
import { useState } from 'react';
import { Search, Globe, Loader2, Check, AlertCircle, ChevronDown, ExternalLink } from 'lucide-react';
import type { ToolActivity } from '../lib/types';

export function ToolCallCard({ activity }: { activity: ToolActivity }) {
  const [expanded, setExpanded] = useState(false);
  const isSearch = activity.type === 'web_search';
  const query = activity.input.query || activity.input.url || '';
  return (
    <div className="my-2 border border-border/60 rounded-lg overflow-hidden text-[12px] bg-background/40">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-2.5 px-3 py-2 bg-sidebar/50 hover:bg-sidebar transition-colors text-left"
      >
        {isSearch ? <Search className="w-3 h-3 text-accent shrink-0" /> : <Globe className="w-3 h-3 text-accent shrink-0" />}
        <span className="text-text-muted/70 font-medium shrink-0">{isSearch ? 'Searched' : 'Fetched'}</span>
        <span className="text-text-primary font-semibold truncate flex-1 min-w-0">
          {isSearch ? `"${query}"` : query}
        </span>
        {activity.status === 'running' && <Loader2 className="w-3 h-3 text-accent animate-spin shrink-0" />}
        {activity.status === 'done'    && <Check className="w-3 h-3 text-green-500 shrink-0" />}
        {activity.status === 'error'   && <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />}
        {activity.status === 'done' && (
          <ChevronDown className={`w-3 h-3 text-text-muted/50 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        )}
      </button>
      {expanded && activity.status === 'done' && (
        <div className="border-t border-border/40">
          {isSearch && activity.searchResults?.map((r, i) => (
            <div key={i} className="px-3 py-2.5 bg-background/30 border-b border-border/30 last:border-0">
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-1.5 text-accent font-medium hover:underline">
                <ExternalLink className="w-3 h-3 mt-0.5 shrink-0" />
                <span className="line-clamp-1">{r.title}</span>
              </a>
              <p className="text-text-muted text-[11px] mt-0.5 leading-relaxed line-clamp-2">{r.snippet}</p>
              <p className="text-text-muted/40 text-[10px] mt-1 font-mono truncate">{r.url}</p>
            </div>
          ))}
          {!isSearch && activity.fetchResult && (
            <div className="px-3 py-2.5 bg-background/30 space-y-1">
              <p className="font-semibold text-text-heading line-clamp-1">{activity.fetchResult.title}</p>
              <p className="text-text-muted/70 text-[11px] leading-relaxed line-clamp-5 whitespace-pre-wrap">
                {activity.fetchResult.content.slice(0, 600)}{activity.fetchResult.content.length > 600 ? '…' : ''}
              </p>
            </div>
          )}
          {activity.error && <div className="px-3 py-2.5 text-red-400 text-[11px]">{activity.error}</div>}
        </div>
      )}
    </div>
  );
}
