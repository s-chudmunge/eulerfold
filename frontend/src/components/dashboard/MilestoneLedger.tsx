"use client";

import React from 'react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    Tooltip, 
    ResponsiveContainer,
    Cell
} from 'recharts';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';

interface Submission {
    submitted_at: string;
    evaluation_level: string;
}

interface MilestoneLedgerProps {
    submissions: Submission[];
}

export default function MilestoneLedger({ submissions }: MilestoneLedgerProps) {
    // Generate last 7 days of data
    const last7Days = [...Array(7)].map((_, i) => {
        const date = subDays(new Date(), 6 - i);
        const daySubmissions = submissions.filter(s => 
            isSameDay(new Date(s.submitted_at), date) && 
            (s.evaluation_level === 'Solid' || s.evaluation_level === 'Developing')
        );
        
        return {
            date: format(date, 'EEE'),
            fullDate: format(date, 'MMM d'),
            count: daySubmissions.length,
            levels: daySubmissions.map(s => s.evaluation_level)
        };
    });

    const totalMilestones = submissions.filter(s => 
        s.evaluation_level === 'Solid' || s.evaluation_level === 'Developing'
    ).length;

    return (
        <div className="bg-transparent flex flex-col h-full manrope-body">
            <h3 className="inconsolata-ui text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">Milestone Ledger</h3>
            <p className="text-[14px] font-bold text-text-heading mb-6">Verification Velocity</p>

            <div className="flex-1 min-h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={last7Days}>
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                        />
                        <Tooltip 
                            cursor={{ fill: 'var(--callout-bg)', opacity: 0.5 }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-background px-3 py-2 rounded-lg border border-border shadow-sm">
                                            <p className="inconsolata-ui text-[10px] font-bold text-text-muted uppercase mb-1">{data.fullDate}</p>
                                            <p className="text-[13px] font-bold text-text-heading inconsolata-ui">
                                                {data.count} Verified Passes
                                            </p>
                                            {data.levels.length > 0 && (
                                                <div className="flex gap-1 mt-1">
                                                    {data.levels.map((l: string, i: number) => (
                                                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${l === 'Solid' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar 
                            dataKey="count" 
                            radius={[4, 4, 0, 0]}
                            animationDuration={1000}
                        >
                            {last7Days.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.count > 0 ? 'var(--accent)' : 'var(--border)'} 
                                    opacity={entry.count > 0 ? 0.8 : 0.2}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <span className="inconsolata-ui text-[10px] font-bold text-text-muted uppercase tracking-widest">
                    Last 7 Days
                </span>
                <span className="inconsolata-ui text-[10px] font-bold text-text-heading uppercase tracking-widest">
                    {totalMilestones} Total Proofs
                </span>
            </div>
        </div>
    );
}
