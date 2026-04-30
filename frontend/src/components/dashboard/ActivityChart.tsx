"use client";

import React from 'react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';
import { format, subDays, isSameDay } from 'date-fns';

interface ActivityChartProps {
    roadmaps: any[];
    profile?: any;
}

export default function ActivityChart({ roadmaps, profile }: ActivityChartProps) {
    const data = Array.from({ length: 30 }).map((_, i) => {
        const date = subDays(new Date(), 29 - i);
        
        const topicCount = profile?.skills?.reduce((acc: number, skill: any) => {
            return acc + (isSameDay(new Date(skill.last_updated), date) ? 1 : 0);
        }, 0) || 0;

        const roadmapCount = roadmaps.filter(r => isSameDay(new Date(r.updated_at), date)).length;
        const submissionCount = profile?.submissions?.filter((s: any) => isSameDay(new Date(s.submitted_at), date)).length || 0;

        const total = topicCount + roadmapCount + submissionCount;

        return {
            name: format(date, 'MMM d'),
            activity: total,
            fullDate: format(date, 'MMMM d, yyyy')
        };
    }).map(d => ({
        ...d,
        displayActivity: d.activity + 0.05 
    }));

    const isTotalZero = data.every(d => d.activity === 0);

    return (
        <div className="bg-transparent relative overflow-hidden manrope-body">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="inconsolata-ui text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">Activity</h3>
                    <p className="text-[13px] font-medium text-text-muted">30-day engagement signal</p>
                </div>
                {isTotalZero && (
                    <span className="inconsolata-ui text-[10px] font-bold text-text-muted border border-border px-2 py-0.5 rounded uppercase tracking-widest">
                        No data yet
                    </span>
                )}
            </div>

            <div className={`h-[180px] w-full ${isTotalZero ? 'opacity-10 grayscale' : ''}`}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 9, fontWeight: 500, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                            interval={6}
                            dy={10}
                        />
                        <YAxis hide domain={[0, 'dataMax + 2']} />
                        <Tooltip 
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-background px-3 py-2 rounded-lg border border-border shadow-sm">
                                            <p className="inconsolata-ui text-[10px] font-bold text-text-muted uppercase mb-0.5">{payload[0].payload.fullDate}</p>
                                            <p className="text-[13px] font-bold text-text-heading inconsolata-ui">
                                                {Math.round(payload[0].payload.activity)} actions
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="displayActivity" 
                            stroke="var(--accent)" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorActivity)" 
                            animationDuration={1000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
