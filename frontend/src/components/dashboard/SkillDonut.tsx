"use client";

import React from 'react';
import { 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    Tooltip 
} from 'recharts';

interface Skill {
    category: string;
}

interface SkillDonutProps {
    skills: Skill[];
}

export default function SkillDonut({ skills }: SkillDonutProps) {
    const categoryCounts = skills.reduce((acc, skill) => {
        acc[skill.category] = (acc[skill.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const total = skills.length;
    const MIN_PERCENT = 0.042;
    
    let data = Object.entries(categoryCounts).map(([name, value]) => ({
        name,
        realValue: value,
        value: Math.max(value / total, MIN_PERCENT) * 100
    }));

    const COLORS = [
        'var(--accent)', 
        '#6366f1', 
        '#f59e0b', 
        '#10b981', 
        '#ec4899', 
    ];

    const isTotalZero = skills.length === 0;

    return (
        <div className="bg-transparent flex flex-col h-full manrope-body">
            <h3 className="inconsolata-ui text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">Diversity</h3>
            <p className="text-[14px] font-bold text-text-heading mb-6">Subject distribution</p>

            <div className={`flex-1 min-h-[180px] w-full ${isTotalZero ? 'opacity-10 grayscale' : ''}`}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={isTotalZero ? [{ name: 'Empty', value: 1 }] : data}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={8}
                            dataKey="value"
                            animationDuration={1000}
                            stroke="none"
                        >
                            {isTotalZero ? (
                                <Cell fill="var(--border)" opacity={0.3} />
                            ) : (
                                data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.6} />
                                ))
                            )}
                        </Pie>
                        {!isTotalZero && (
                            <Tooltip 
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-background px-3 py-2 rounded-lg border border-border shadow-sm">
                                                <p className="inconsolata-ui text-[10px] font-bold text-text-muted uppercase mb-0.5">{payload[0].name}</p>
                                                <p className="text-[13px] font-bold text-text-heading inconsolata-ui">
                                                    {payload[0].payload.realValue} items
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                        )}
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-4 border-t border-border space-y-2.5">
                {isTotalZero ? (
                    <p className="inconsolata-ui text-[10px] font-bold text-text-muted uppercase tracking-widest text-center italic">No data yet</p>
                ) : (
                    data.slice(0, 4).map((item, index) => (
                        <div key={item.name} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div 
                                    className="w-2 h-2 rounded-full shrink-0" 
                                    style={{ backgroundColor: COLORS[index % COLORS.length], opacity: 0.6 }}
                                ></div>
                                <span className="text-[11px] font-medium text-text-muted truncate uppercase tracking-tight">
                                    {item.name}
                                </span>
                            </div>
                            <span className="inconsolata-ui text-[11px] font-bold text-text-heading">
                                {item.realValue}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
