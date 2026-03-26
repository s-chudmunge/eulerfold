"use client";

import React from 'react';
import { 
    Radar, 
    RadarChart, 
    PolarGrid, 
    PolarAngleAxis, 
    PolarRadiusAxis, 
    ResponsiveContainer 
} from 'recharts';

interface Skill {
    name: string;
    confidence_score: number;
    pow_score: number;
    practice_score: number;
    topic_completion: number;
    depth_score: number;
    tier?: string;
}

interface SkillRadarProps {
    skill: Skill | null;
}

export default function SkillRadar({ skill }: SkillRadarProps) {
    if (!skill) {
        return (
            <div className="bg-transparent flex flex-col h-full manrope-body">
                <h3 className="inconsolata-ui text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">Skill Overview</h3>
                <div className="flex-1 flex items-center justify-center italic text-[12px] text-text-muted opacity-50">
                    No data yet
                </div>
            </div>
        );
    }

    const data = [
        { subject: 'Confidence', A: skill.confidence_score, fullMark: 100 },
        { subject: 'PoW', A: (skill.pow_score || 0) * 100, fullMark: 100 },
        { subject: 'Practice', A: (skill.practice_score || 0) * 100, fullMark: 100 },
        { subject: 'Progress', A: (skill.topic_completion || 0) * 100, fullMark: 100 },
        { subject: 'Depth', A: (skill.depth_score || 0) * 100, fullMark: 100 },
    ];

    return (
        <div className="bg-transparent flex flex-col h-full manrope-body">
            <h3 className="inconsolata-ui text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">Skill Overview</h3>
            <p className="text-[14px] font-bold text-text-heading mb-6 truncate">{skill.name}</p>

            <div className="flex-1 min-h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="var(--border)" opacity={0.5} />
                        <PolarAngleAxis 
                            dataKey="subject" 
                            tick={{ fill: 'var(--text-muted)', fontSize: 9, fontWeight: 500, fontFamily: 'var(--font-mono)' }}
                        />
                        <PolarRadiusAxis 
                            angle={30} 
                            domain={[0, 100]} 
                            tick={false} 
                            axisLine={false} 
                        />
                        <Radar
                            name={skill.name}
                            dataKey="A"
                            stroke="var(--accent)"
                            fill="var(--accent)"
                            fillOpacity={0.1}
                            animationDuration={1000}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <span className="inconsolata-ui text-[10px] font-bold text-text-muted uppercase tracking-widest">{skill.tier || 'Developing'}</span>
                <span className="inconsolata-ui text-[10px] font-bold text-text-heading uppercase tracking-widest">{Math.round(skill.confidence_score)}% Mastered</span>
            </div>
        </div>
    );
}
