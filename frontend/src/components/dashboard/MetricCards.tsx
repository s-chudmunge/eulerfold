"use client";

import React from 'react';
import { Zap, Coins, Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface MetricCardsProps {
    streak: number;
    coins: number;
    activeRoadmaps: number;
    nextSync: string | null;
}

export default function MetricCards({ streak, coins, activeRoadmaps, nextSync }: MetricCardsProps) {
    return (
        <div className="hidden md:flex items-center gap-6 inconsolata-ui">
            <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-orange-500" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-text-heading">
                    {streak}d <span className="text-text-muted font-medium">Streak</span>
                </span>
            </div>
            
            <div className="w-px h-3.5 bg-[var(--border)]"></div>

            <div className="flex items-center gap-2">
                <Coins className="h-3.5 w-3.5 text-accent" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-text-heading">
                    {coins} <span className="text-text-muted font-medium">Coins</span>
                </span>
            </div>

            <div className="w-px h-3.5 bg-[var(--border)]"></div>

            <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-accent" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-text-heading">
                    {activeRoadmaps} <span className="text-text-muted font-medium">Goals</span>
                </span>
            </div>

            <div className="w-px h-3.5 bg-[var(--border)]"></div>

            <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-text-muted" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-text-heading">
                    {nextSync ? format(new Date(nextSync), 'MMM d') : '—'} <span className="text-text-muted font-medium">Sync</span>
                </span>
            </div>
        </div>
    );
}
