import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { goldfishAPI } from '@/lib/api';
import { GoldfishIcon } from './GoldfishAvatar';
import { TreeIllustration } from '../grove/TreeIllustration';
import { getRecentHarvests } from '../grove/harvestUtils';
import { TreeHarvestEvent, TreeVariety } from '../grove/types';

interface DailyBriefingData {
  status: string;
  briefing: string;
  highlight_badge?: string;
  action_cta?: {
    label: string;
    url: string;
  };
  stats?: {
    streak_days: number;
    active_roadmaps_count: number;
    sessions_last_7_days: number;
  };
}

/* Bespoke EulerFold Custom Geometric SVG Icons */

// Geometric faceted notification bell icon
function EulerBellIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2.5a4.5 4.5 0 0 0-4.5 4.5v3.2L4 13.5h12l-1.5-3.3V7A4.5 4.5 0 0 0 10 2.5Z" />
      <path d="M8.2 16a2 2 0 0 0 3.6 0" />
      <circle cx="10" cy="2.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

// Geometric 4-point golden star sparkle for AI Copilot
function CoPilotSparkIcon({ className = "w-2.5 h-2.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C8 4.418 4.418 8 0 8C4.418 8 8 11.582 8 16C8 11.582 11.582 8 16 8C11.582 8 8 4.418 8 0Z" />
    </svg>
  );
}

// Geometric study flame / embers marker for streak
function EmberStreakIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <path
        d="M8.2 1.5C8.2 3.8 6.5 5 5 7C3.5 9 3 11 4.2 13C5.2 14.5 7 15 8.5 15C11.5 15 13.5 12.8 13.5 9.5C13.5 6 11 4 9.5 2.5L8.2 1.5Z"
        fill="#D97706"
      />
      <path
        d="M8.5 7.5C8.5 9 7.8 10 7 11C6.4 11.8 6.5 12.6 7 13.2C7.5 13.7 8.2 14 9 14C10.5 14 11.5 12.8 11.5 11C11.5 9.2 10.2 8.2 9.5 7.5H8.5Z"
        fill="#FDE68A"
      />
    </svg>
  );
}

// Sundial / Hourglass study cadence icon
function StudyCadenceIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 2.5H12.5" />
      <path d="M3.5 13.5H12.5" />
      <path d="M4.5 2.5C4.5 7 11.5 6 11.5 2.5" />
      <path d="M4.5 13.5C4.5 9 11.5 10 11.5 13.5" />
      <circle cx="8" cy="8" r="1" fill="currentColor" />
    </svg>
  );
}

// Curated badge icon for Quiz Verification / Practice
function QuillCheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 15.5L4 12L13.5 2.5C14.1 1.9 15.1 1.9 15.7 2.5C16.3 3.1 16.3 4.1 15.7 4.7L6.2 14.2L2.5 15.5Z" />
      <path d="M11.5 4.5L13.7 6.7" />
      <path d="M6 10L8 12L12 7.5" strokeWidth="1.7" />
    </svg>
  );
}

// Geometric folded parchment / lesson chapter node
function FoldedNodeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3.5L9 2L15 3.5V14.5L9 13L3 14.5V3.5Z" />
      <path d="M9 2V13" />
      <path d="M6 5.5L7.5 5.2" />
      <path d="M6 8L7.5 7.7" />
      <path d="M10.5 5.2L12 5.5" />
      <path d="M10.5 7.7L12 8" />
    </svg>
  );
}

// Compass arrow for targeted action
function CompassArrowIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 8H13.5" />
      <path d="M9.5 4L13.5 8L9.5 12" />
    </svg>
  );
}

// Minimalist close cross
function DismissCrossIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3.5 3.5L10.5 10.5" />
      <path d="M10.5 3.5L3.5 10.5" />
    </svg>
  );
}

export function DailyBriefingBell() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [briefing, setBriefing] = useState<DailyBriefingData | null>(null);
  const [recentHarvests, setRecentHarvests] = useState<TreeHarvestEvent[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Initial load of past harvests from storage
  useEffect(() => {
    const saved = getRecentHarvests();
    if (saved.length > 0) {
      setRecentHarvests(saved);
      const unread = localStorage.getItem('eulerfold_harvest_has_unread') === 'true';
      if (unread) setHasUnread(true);
    }
  }, []);

  // 2. Listen for live tree harvest events across the app
  useEffect(() => {
    const handleTreePlanted = (e: CustomEvent<TreeHarvestEvent>) => {
      if (e.detail) {
        setRecentHarvests(prev => [e.detail, ...prev.slice(0, 9)]);
        setHasUnread(true);
      }
    };
    window.addEventListener('eulerfold_tree_planted' as any, handleTreePlanted);
    return () => window.removeEventListener('eulerfold_tree_planted' as any, handleTreePlanted);
  }, []);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    goldfishAPI.getDailyBriefing()
      .then((res: DailyBriefingData) => {
        if (res && res.briefing) {
          setBriefing(res);
          const isRead = sessionStorage.getItem(`eulerfold_briefing_read_${todayStr}`);
          if (!isRead) {
            setHasUnread(true);
          }
        }
      })
      .catch((err: any) => {
        console.error('Failed to load daily briefing:', err);
      })
      .finally(() => setLoading(false));
  }, [user, todayStr]);

  const handleOpenDropdown = () => {
    setIsOpen(!isOpen);
    if (hasUnread) {
      setHasUnread(false);
      try {
        sessionStorage.setItem(`eulerfold_briefing_read_${todayStr}`, 'true');
        localStorage.removeItem('eulerfold_harvest_has_unread');
      } catch {}
    }
  };

  const formatHarvestRelativeTime = (timestamp: string) => {
    try {
      const diffMs = Date.now() - new Date(timestamp).getTime();
      const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const getTreeVariety = (h: TreeHarvestEvent): TreeVariety => {
    if (h.variety) return h.variety;
    if (h.type === 'practice_cleared') return 'spruce';
    if (h.type === 'topic_completed') return 'oak';
    if (h.type === 'homework_approved') return 'willow';
    if (h.type === 'module_mastered') return 'blossom_oak';
    return 'pine';
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpenDropdown}
        className="relative p-1.5 rounded-md text-text-muted hover:text-text-heading hover:bg-sidebar/50 transition-colors border border-transparent hover:border-border/40"
        title="Notifications & Daily Briefing"
        aria-label="Notifications"
      >
        <EulerBellIcon className="w-4 h-4 text-text-muted hover:text-text-heading transition-colors" />
        {hasUnread && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent ring-2 ring-background" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-84 sm:w-[410px] bg-background border border-border shadow-2xl z-50 rounded-md overflow-hidden animate-in fade-in zoom-in-98 duration-150 origin-top-right flex flex-col max-h-[560px]">
          {/* Top Bar Header */}
          <div className="px-3.5 py-2.5 bg-sidebar border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-text-heading">Notifications</span>
              {hasUnread && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </div>

            <div className="flex items-center gap-2">
              {briefing?.highlight_badge && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wider bg-accent/10 text-accent border border-accent/20 uppercase font-mono">
                  {briefing.highlight_badge}
                </span>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-text-muted hover:text-text-heading p-1 rounded-md hover:bg-background transition-colors"
                aria-label="Close"
              >
                <DismissCrossIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Micro Stats Quick Bar */}
          {briefing?.stats && (
            <div className="px-3.5 py-1.5 bg-sidebar/50 border-b border-border/60 flex items-center justify-between text-[11px] text-text-muted shrink-0">
              <span className="inline-flex items-center gap-1.5">
                <StudyCadenceIcon className="w-3 h-3 text-accent" />
                <strong className="font-medium text-text-primary">{briefing.stats.sessions_last_7_days}</strong> sessions this week
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium text-text-primary">
                <EmberStreakIcon className="w-3.5 h-3.5" />
                {briefing.stats.streak_days} Day Streak
              </span>
            </div>
          )}

          {/* Scrollable Notification List / Strips */}
          <div className="overflow-y-auto divide-y divide-border/60 flex-1">
            {/* Strip 1: Daily AI Briefing (Primary / Important Strip) */}
            <div className="p-3.5 bg-background hover:bg-sidebar/30 transition-colors">
              <div className="flex items-start gap-3">
                {/* Left: Goldfish Avatar with Geometric Co-pilot Sparkle */}
                <div className="relative shrink-0 pt-0.5">
                  <div className="w-8 h-8 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center overflow-hidden">
                    <GoldfishIcon className="w-5 h-5" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-md bg-accent text-white flex items-center justify-center shadow-xs">
                    <CoPilotSparkIcon className="w-2 h-2" />
                  </span>
                </div>

                {/* Center / Body */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-semibold text-text-heading truncate">
                      Goldfish Daily Study Briefing
                    </span>
                    <span className="text-[10px] text-text-muted shrink-0 font-mono">Today</span>
                  </div>

                  {loading ? (
                    <div className="space-y-1.5 py-1">
                      <div className="h-3 bg-sidebar rounded-sm animate-pulse w-3/4" />
                      <div className="h-3 bg-sidebar rounded-sm animate-pulse w-full" />
                      <div className="h-3 bg-sidebar rounded-sm animate-pulse w-4/5" />
                    </div>
                  ) : briefing ? (
                    <>
                      <p className="text-[12px] text-text-primary leading-relaxed line-clamp-4">
                        {briefing.briefing}
                      </p>

                      {briefing.action_cta && (
                        <div className="pt-1">
                          <Link
                            href={briefing.action_cta.url}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-sidebar hover:bg-callout-bg border border-border rounded-md text-[11.5px] font-medium text-accent transition-colors group"
                          >
                            <span className="truncate max-w-[240px]">{briefing.action_cta.label}</span>
                            <CompassArrowIcon className="w-3 h-3 group-hover:translate-x-0.5 transition-transform shrink-0" />
                          </Link>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-[11.5px] text-text-muted">
                      No active briefing right now. Keep up your momentum!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Strip Section: Grove Activity & Rewards */}
            {recentHarvests.length > 0 && (
              <div className="bg-sidebar/20">
                <div className="px-3.5 py-1.5 text-[10.5px] font-semibold text-text-muted uppercase tracking-wider bg-sidebar/60 flex items-center justify-between border-y border-border/40">
                  <span className="flex items-center gap-1.5">
                    <TreeIllustration variety="spruce" size={14} />
                    Grove Harvests
                  </span>
                  <span className="text-[10px] lowercase font-normal opacity-80">recent activity</span>
                </div>

                <div className="divide-y divide-border/40">
                  {recentHarvests.slice(0, 4).map((h) => {
                    const relativeTime = formatHarvestRelativeTime(h.timestamp);
                    const treeVariety = getTreeVariety(h);

                    return (
                      <div
                        key={h.id}
                        className="px-3.5 py-2.5 flex items-center gap-3 hover:bg-sidebar/40 transition-colors"
                      >
                        {/* Bespoke Botanical Illustration Thumbnail */}
                        <div className="w-8 h-8 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                          {h.type === 'practice_cleared' ? (
                            <QuillCheckIcon className="w-4 h-4 text-accent" />
                          ) : h.type === 'topic_completed' ? (
                            <FoldedNodeIcon className="w-4 h-4 text-accent" />
                          ) : (
                            <TreeIllustration variety={treeVariety} size={24} />
                          )}
                        </div>

                        {/* Strip Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[11.5px] font-medium text-text-heading truncate">
                            {h.title}
                          </p>
                          <div className="flex items-center gap-2 text-[10.5px] text-text-muted mt-0.5">
                            <span className="text-accent font-semibold">
                              +{h.treesEarned} Tree{h.treesEarned > 1 ? 's' : ''}
                            </span>
                            {h.coinsEarned > 0 && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-amber-600">+{h.coinsEarned}c</span>
                              </>
                            )}
                            <span>•</span>
                            <span className="font-mono">{relativeTime}</span>
                          </div>
                        </div>

                        {/* Right Badge / Status */}
                        <div className="shrink-0 flex items-center">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-sidebar text-text-muted border border-border">
                            Planted
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-3.5 py-2 bg-sidebar border-t border-border flex items-center justify-between text-[11px] text-text-muted shrink-0">
            <span className="truncate">
              EulerFold Personal Co-pilot
            </span>
            <Link
              href="/planner"
              onClick={() => setIsOpen(false)}
              className="text-accent hover:underline font-medium flex items-center gap-1 shrink-0"
            >
              Study Planner
              <CompassArrowIcon className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
