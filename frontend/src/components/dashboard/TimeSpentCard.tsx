"use client";

import React from 'react';
import { format, subDays, isSameDay } from 'date-fns';

interface WeeklySession {
    duration_seconds: number;
    created_at: string;
}

interface TimeSpentCardProps {
    hours: number;
    activeDays: number;
    weeklyData?: WeeklySession[];
}

export default function TimeSpentCard({ hours, activeDays, weeklyData = [] }: TimeSpentCardProps) {
    const totalMinutes = Math.round(hours * 60);
    const displayHours = Math.floor(totalMinutes / 60);
    const displayMinutes = totalMinutes % 60;

    const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(new Date(), 6 - i);
        const daySeconds = weeklyData
            .filter(session => isSameDay(new Date(session.created_at), date))
            .reduce((sum, session) => sum + session.duration_seconds, 0);
        
        return {
            day: format(date, 'EEEE'),
            seconds: daySeconds
        };
    });

    const maxSeconds = Math.max(...last7Days.map(d => d.seconds), 3600);
    const mostActiveDay = last7Days.reduce((prev, current) => (prev.seconds > current.seconds) ? prev : current, last7Days[0]);

    return (
        <div className="bg-transparent flex flex-col h-full manrope-body">
            <h3 className="inconsolata-ui text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] mb-6">Focus duration</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-[20px] font-bold text-text-heading inconsolata-ui">{displayHours}h {displayMinutes}m</span>
                    </div>
                    <p className="text-[11px] font-medium text-text-muted mt-1">Total time</p>
                </div>
                <div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-[20px] font-bold text-text-heading inconsolata-ui">{activeDays}</span>
                    </div>
                    <p className="text-[11px] font-medium text-text-muted mt-1">Active days</p>
                </div>
            </div>

            <div className="mt-auto">
                <div className="flex items-end justify-between gap-1.5 h-12 mb-4">
                    {last7Days.map((d, i) => {
                        const height = (d.seconds / maxSeconds) * 100;
                        return (
                            <div key={i} className="flex-1 h-full bg-background rounded border border-border relative overflow-hidden group">
                                <div 
                                    className="absolute bottom-0 left-0 right-0 bg-accent opacity-40 transition-all duration-500"
                                    style={{ height: `${Math.max(height, d.seconds > 0 ? 10 : 0)}%` }}
                                ></div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-border">
                    <span className="inconsolata-ui text-[10px] font-bold text-text-muted uppercase tracking-widest">Most active</span>
                    <span className="text-[11px] font-bold text-text-heading">
                        {mostActiveDay.seconds > 0 ? mostActiveDay.day : '—'}
                    </span>
                </div>
            </div>
        </div>
    );
}
