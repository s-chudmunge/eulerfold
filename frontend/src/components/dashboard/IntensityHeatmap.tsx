"use client";

import React from 'react';
import { format, subDays, isSameDay } from 'date-fns';

interface WeeklyStat {
    created_at: string;
    duration_seconds: number;
}

interface IntensityHeatmapProps {
    weeklyData: WeeklyStat[];
}

export default function IntensityHeatmap({ weeklyData }: IntensityHeatmapProps) {
    // Generate last 7 days
    const days = [...Array(7)].map((_, i) => {
        const date = subDays(new Date(), 6 - i);
        const dayStat = weeklyData.find(s => isSameDay(new Date(s.created_at), date));
        const minutes = dayStat ? Math.floor(dayStat.duration_seconds / 60) : 0;
        
        // Intensity levels (0 to 4)
        let intensity = 0;
        if (minutes > 0) intensity = 1;
        if (minutes > 30) intensity = 2;
        if (minutes > 60) intensity = 3;
        if (minutes > 120) intensity = 4;

        return {
            date,
            label: format(date, 'EEE, MMM d'),
            minutes,
            intensity
        };
    });

    const getIntensityClass = (level: number) => {
        switch(level) {
            case 0: return 'bg-[var(--border)] opacity-10';
            case 1: return 'bg-accent opacity-20';
            case 2: return 'bg-accent opacity-40';
            case 3: return 'bg-accent opacity-70';
            case 4: return 'bg-accent opacity-100';
            default: return 'bg-[var(--border)] opacity-10';
        }
    };

    const maxMinutes = Math.max(...days.map(d => d.minutes), 1);

    return (
        <div className="bg-transparent flex flex-col h-full manrope-body">
            <h3 className="inconsolata-ui text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">Focus Intensity</h3>
            <p className="text-[14px] font-bold text-text-heading mb-6">Learning Rhythm</p>

            <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-end gap-2 h-24 mb-4">
                    {days.map((day, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                            {/* Tooltip */}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--text-heading)] text-[var(--bg-main)] px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                                {day.minutes}m on {day.label}
                            </div>
                            
                            <div 
                                className={`w-full rounded-sm transition-all duration-500 ${getIntensityClass(day.intensity)}`}
                                style={{ height: `${Math.max((day.minutes / maxMinutes) * 100, 8)}%` }}
                            />
                            <span className="inconsolata-ui text-[9px] text-text-muted uppercase mt-1">{format(day.date, 'EE')[0]}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-[var(--border)] opacity-20 rounded-sm"></div>
                    <div className="w-2 h-2 bg-accent opacity-100 rounded-sm"></div>
                    <span className="inconsolata-ui text-[9px] font-bold text-text-muted uppercase tracking-widest ml-1">Lvl 0-4</span>
                </div>
                <span className="inconsolata-ui text-[10px] font-bold text-text-heading uppercase tracking-widest">
                    Last 7 Days
                </span>
            </div>
        </div>
    );
}
