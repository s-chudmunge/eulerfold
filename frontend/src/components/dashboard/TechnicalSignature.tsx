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

interface UserSkill {
    pow_score: number;
    practice_score: number;
    topic_completion: number;
    depth_score: number;
    confidence_score: number;
}

interface TechnicalSignatureProps {
    skills: UserSkill[];
}

export default function TechnicalSignature({ skills }: TechnicalSignatureProps) {
    if (!skills || skills.length === 0) {
        return (
            <div className="bg-transparent flex flex-col h-full manrope-body">
                <h3 className="inconsolata-ui text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">Technical Signature</h3>
                <div className="flex-1 flex items-center justify-center italic text-[12px] text-text-muted opacity-50">
                    Awaiting verification signals
                </div>
            </div>
        );
    }

    // Calculate averages across all skills
    const count = skills.length;
    const avgPOW = (skills.reduce((acc, s) => acc + (s.pow_score || 0), 0) / count) * 100;
    const avgRecall = (skills.reduce((acc, s) => acc + (s.practice_score || 0), 0) / count) * 100;
    const avgCoverage = (skills.reduce((acc, s) => acc + (s.topic_completion || 0), 0) / count) * 100;
    const avgDepth = (skills.reduce((acc, s) => acc + (s.depth_score || 0), 0) / count) * 100;
    const avgConfidence = (skills.reduce((acc, s) => acc + (s.confidence_score || 0), 0) / count);

    const data = [
        { subject: 'Proof', A: avgPOW, fullMark: 100 },
        { subject: 'Recall', A: avgRecall, fullMark: 100 },
        { subject: 'Coverage', A: avgCoverage, fullMark: 100 },
        { subject: 'Depth', A: avgDepth, fullMark: 100 },
        { subject: 'Momentum', A: Math.min(avgConfidence * 1.1, 100), fullMark: 100 },
    ];

    return (
        <div className="bg-transparent flex flex-col h-full manrope-body">
            <h3 className="inconsolata-ui text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">Technical Signature</h3>
            <p className="text-[14px] font-bold text-text-heading mb-6">Aggregate Identity</p>

            <div className="flex-1 min-h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="var(--border)" opacity={0.5} />
                        <PolarAngleAxis 
                            dataKey="subject" 
                            tick={{ fill: 'var(--text-muted)', fontSize: 9, fontWeight: 600, fontFamily: 'var(--font-mono)' }}
                        />
                        <PolarRadiusAxis 
                            angle={30} 
                            domain={[0, 100]} 
                            tick={false} 
                            axisLine={false} 
                        />
                        <Radar
                            name="Average Performance"
                            dataKey="A"
                            stroke="var(--accent)"
                            fill="var(--accent)"
                            fillOpacity={0.15}
                            animationDuration={1500}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <span className="inconsolata-ui text-[10px] font-bold text-text-muted uppercase tracking-widest">
                    {skills.length} Active Skills
                </span>
                <span className="inconsolata-ui text-[10px] font-bold text-accent uppercase tracking-widest">
                    {Math.round(avgConfidence)}% AVG CONFIDENCE
                </span>
            </div>
        </div>
    );
}
