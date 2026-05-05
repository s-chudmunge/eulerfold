"use client";

import React, { useMemo } from 'react';
import { 
    format, 
    subDays, 
    isSameDay, 
    startOfToday, 
    eachDayOfInterval, 
    subMonths,
    startOfWeek,
    endOfWeek,
    isWithinInterval
} from 'date-fns';

interface ActivityHeatmapProps {
    profile: any;
    activityMap?: Record<string, number>;
}

const LogoShape = ({ intensity, date, count }: { intensity: number, date: string, count: number }) => {
    // intensity 0-4
    const colors = [
        'fill-border/20 dark:fill-white/5',
        'fill-teal-700/20',
        'fill-teal-700/40',
        'fill-teal-700/70',
        'fill-teal-700'
    ];
    
    return (
        <div className="relative group">
            <svg width="11" height="12" viewBox="0 0 11 12" className="block">
                <path 
                    d="M5.5 0L10.5 2.5V9.5L5.5 12L0.5 9.5V2.5L5.5 0Z" 
                    className={`${colors[intensity]} transition-colors duration-300`}
                />
            </svg>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-text-heading text-background text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
                {count} activities on {date}
            </div>
        </div>
    );
};

export default function ActivityHeatmap({ profile, activityMap }: ActivityHeatmapProps) {
    const activityData = useMemo(() => {
        const endDate = startOfToday();
        const startDate = subMonths(endDate, 12);
        
        // Map activity counts to dates
        const activityMapMerged: Record<string, number> = { ...(activityMap || {}) };

        if (!activityMap) {
            // Fallback: derive from profile if dedicated map not provided
            // 1. Submissions
            profile.submissions?.forEach((s: any) => {
                const d = format(new Date(s.submitted_at), 'yyyy-MM-dd');
                activityMapMerged[d] = (activityMapMerged[d] || 0) + 1;
            });

            // 2. MCQ History
            profile.mcq_history?.forEach((m: any) => {
                const d = format(new Date(m.created_at), 'yyyy-MM-dd');
                activityMapMerged[d] = (activityMapMerged[d] || 0) + 1;
            });

            // 3. Roadmap updates
            profile.roadmaps?.forEach((r: any) => {
                const d = format(new Date(r.updated_at), 'yyyy-MM-dd');
                activityMapMerged[d] = (activityMapMerged[d] || 0) + 0.5;
            });
        }

        // Organize into weeks for GitHub-style layout
        const weeks: any[][] = [];
        let currentWeek: any[] = [];

        // Start from the beginning of the week of startDate
        const calendarStart = startOfWeek(startDate);
        const calendarEnd = endOfWeek(endDate);
        const allCalendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

        allCalendarDays.forEach((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const count = Math.ceil(activityMapMerged[dateStr] || 0);
            
            let intensity = 0;
            if (count > 0) intensity = 1;
            if (count > 2) intensity = 2;
            if (count > 5) intensity = 3;
            if (count > 10) intensity = 4;

            const isCurrentMonth = isWithinInterval(day, { start: startDate, end: endDate });

            currentWeek.push({
                day,
                date: format(day, 'MMM d, yyyy'),
                count,
                intensity: isCurrentMonth ? intensity : 0,
                isCurrentMonth
            });

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        });

        return weeks;
    }, [profile, activityMap]);

    return (
        <div className="mt-12 pt-12 border-t border-border">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="inconsolata-ui text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">Learning Activity</h3>
                    <p className="text-[13px] font-medium text-text-muted">Your activity over the last 12 months</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest inconsolata-ui">Less</span>
                    <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map(i => (
                            <svg key={i} width="8" height="9" viewBox="0 0 11 12">
                                <path 
                                    d="M5.5 0L10.5 2.5V9.5L5.5 12L0.5 9.5V2.5L5.5 0Z" 
                                    className={
                                        i === 0 ? 'fill-border/20' : 
                                        i === 1 ? 'fill-teal-700/20' :
                                        i === 2 ? 'fill-teal-700/40' :
                                        i === 3 ? 'fill-teal-700/70' :
                                        'fill-teal-700'
                                    }
                                />
                            </svg>
                        ))}
                    </div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest inconsolata-ui">More</span>
                </div>
            </div>

            <div className="flex gap-[3px] overflow-x-auto no-scrollbar pb-2">
                {activityData.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-[3px] shrink-0">
                        {week.map((day, dIdx) => (
                            <LogoShape 
                                key={dIdx}
                                intensity={day.intensity}
                                date={day.date}
                                count={day.count}
                            />
                        ))}
                    </div>
                ))}
            </div>
            
            <div className="mt-4 flex justify-between items-center">
                <div className="flex gap-8">
                    <div className="flex flex-col">
                        <span className="text-[18px] font-bold text-text-heading inconsolata-ui">
                            {profile.submissions?.length || 0}
                        </span>
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Projects</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[18px] font-bold text-text-heading inconsolata-ui">
                            {profile.mcq_history?.length || 0}
                        </span>
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Quizzes</span>
                    </div>
                </div>
                <p className="text-[11px] text-text-muted italic opacity-60 manrope-body">
                    Based on your project submissions and quiz results.
                </p>
            </div>
        </div>
    );
}
