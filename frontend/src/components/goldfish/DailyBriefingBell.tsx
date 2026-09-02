'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, ArrowRight, Clock, TreePine } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { goldfishAPI } from '@/lib/api';
import { GoldfishIcon } from './GoldfishAvatar';
import { getRecentHarvests } from '../grove/harvestUtils';
import { TreeHarvestEvent } from '../grove/types';

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
        setRecentHarvests(prev => [e.detail, ...prev.slice(0, 4)]);
        setHasUnread(true);
      }
    };
    window.addEventListener('eulerfold_tree_planted' as any, handleTreePlanted);
    return () => window.removeEventListener('eulerfold_tree_planted' as any, handleTreePlanted);
  }, []);

  useEffect(() => {
    if (!user) return;

    // Fetch daily briefing directly from database-backed endpoint
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

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpenDropdown}
        className="relative p-1.5 rounded-md text-text-muted hover:text-text-heading hover:bg-sidebar/50 transition-colors border border-transparent hover:border-border/40"
        title="Goldfish Daily Study Briefing & Grove Rewards"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {hasUnread && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-background border border-border shadow-xl z-50 rounded-md overflow-hidden animate-in fade-in zoom-in-98 duration-150 origin-top-right">
          {/* Header */}
          <div className="px-3.5 py-2.5 bg-sidebar border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GoldfishIcon className="w-4 h-4" />
              <span className="text-[12.5px] font-bold text-text-heading">Daily Briefing & Grove</span>
            </div>
            {briefing?.highlight_badge && (
              <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-accent/10 text-accent uppercase">
                {briefing.highlight_badge}
              </span>
            )}
          </div>

          {/* Recent Tree Harvests (Action Feed) */}
          {recentHarvests.length > 0 && (
            <div className="px-3.5 py-2 bg-accent/5 border-b border-border/60 space-y-1.5">
              <div className="flex items-center justify-between text-[10.5px] font-bold text-accent">
                <span className="flex items-center gap-1">
                  <TreePine className="w-3.5 h-3.5" />
                  Recent Trees Planted
                </span>
                <span className="text-[10px] opacity-75">Grove Record</span>
              </div>
              {recentHarvests.slice(0, 3).map((h) => (
                <div key={h.id} className="flex items-center justify-between text-[11.5px] text-text-primary bg-background/80 px-2 py-1 rounded-md border border-border/40">
                  <span className="truncate pr-2">{h.title}</span>
                  <span className="text-accent font-bold font-mono shrink-0">
                    +{h.treesEarned} 🌲 {h.coinsEarned > 0 && `(+${h.coinsEarned}c)`}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Daily AI Briefing Body Content */}
          <div className="p-4 space-y-3">
            {loading ? (
              <div className="space-y-2 py-4">
                <div className="h-3.5 bg-sidebar rounded-sm animate-pulse w-3/4" />
                <div className="h-3.5 bg-sidebar rounded-sm animate-pulse w-full" />
                <div className="h-3.5 bg-sidebar rounded-sm animate-pulse w-5/6" />
              </div>
            ) : briefing ? (
              <>
                <p className="text-[13px] text-text-primary leading-relaxed whitespace-pre-line font-normal">
                  {briefing.briefing}
                </p>

                {/* Direct Action Link */}
                {briefing.action_cta && (
                  <div className="pt-2">
                    <Link
                      href={briefing.action_cta.url}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center justify-between w-full px-3 py-2 bg-sidebar hover:bg-callout-bg border border-border rounded-md text-[12px] font-bold text-accent transition-colors group"
                    >
                      <span className="truncate">{briefing.action_cta.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </Link>
                  </div>
                )}

                {/* Micro Stats Footer */}
                {briefing.stats && (
                  <div className="pt-2.5 border-t border-border/50 flex items-center justify-between text-[10.5px] text-text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {briefing.stats.sessions_last_7_days} sessions this week
                    </span>
                    <span className="font-semibold text-text-heading">
                      🔥 {briefing.stats.streak_days} Day Streak
                    </span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-[12px] text-text-muted py-2">
                No new study briefings today. Keep learning!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
