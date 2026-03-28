"use client";

import React, { useState } from 'react';
import { 
    BrainCircuit, 
    ChevronDown, 
    ChevronUp,
    Timer,
    Info,
    Trophy,
    CheckCircle2,
    ShieldCheck,
    History,
    Target
} from 'lucide-react';

interface Skill {
    id: string;
    name: string;
    confidence_score: number;
    category: string;
    tier: string;
    pow_score: number;
    practice_score: number;
    topic_completion: number;
    depth_score: number;
    time_invested: number;
    last_updated: string;
}

interface SkillsProfileProps {
    skills: Skill[];
}

export default function SkillsProfile({ skills }: SkillsProfileProps) {
    const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);
    const [showWeightsInfo, setShowWeightsInfo] = useState(false);
    const [isTrainingExpanded, setIsTrainingExpanded] = useState(false);
    const [isSystemExpanded, setIsSystemExpanded] = useState(false);

    if (!skills || skills.length === 0) return null;

    const sortedSkills = [...skills].sort((a, b) => b.confidence_score - a.confidence_score);

    return (
        <section className="space-y-8">
            {/* 1. TECHNICAL PROFICIENCY (Always visible core) */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-1 bg-teal-700 dark:bg-teal-500 rounded-full"></div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-[#f2f2f7] uppercase tracking-tight">Technical Proficiency</h2>
                    </div>
                    <button 
                        onClick={() => setShowWeightsInfo(!showWeightsInfo)}
                        className="p-2 hover:bg-sidebar dark:hover:bg-[#3a3a3c] rounded-lg transition-colors text-gray-400"
                        title="About Signal Weights"
                    >
                        <Info className="h-4 w-4" />
                    </button>
                </div>

                {showWeightsInfo && (
                    <div className="mb-6 p-4 bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/30 rounded-xl animate-in slide-in-from-top-2 duration-300">
                        <h4 className="text-[10px] font-black text-teal-800 dark:text-teal-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <ShieldCheck className="h-3 w-3" /> How we measure mastery
                        </h4>
                        <p className="text-xs text-teal-700/80 dark:text-teal-400/70 leading-relaxed mb-3">
                            Scores are calculated using an honest weighting system that rewards consistency and external proof over simple completion.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { label: 'PoW (40%)', desc: "Projects You've Solved & Proof of Work submissions." },
                                { label: 'Practice (30%)', desc: 'Performance in AI-generated practice assessments.' },
                                { label: 'Topics (15%)', desc: 'Percentage of roadmap topics covered and reviewed.' },
                                { label: 'Depth (15%)', desc: 'Complexity level of the topics mastered.' }
                            ].map((w, i) => (
                                <div key={i}>
                                    <p className="text-[9px] font-black text-teal-800 dark:text-teal-400">{w.label}</p>
                                    <p className="text-[8px] text-teal-600 dark:text-teal-500 uppercase tracking-tighter leading-tight">{w.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sortedSkills.map((skill) => (
                        <div key={skill.id} className="bg-background dark:bg-[#2c2c2e] rounded-xl border border-border dark:border-[#3a3a3c] overflow-hidden shadow-sm hover:border-teal-200 dark:hover:border-teal-900/50 transition-all">
                            <button 
                                onClick={() => setExpandedSkillId(expandedSkillId === skill.id ? null : skill.id)}
                                className="w-full p-4 flex items-center justify-between text-left"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-sm font-black text-gray-900 dark:text-[#f2f2f7] leading-snug tracking-tight">
                                            {skill.name}
                                        </h3>
                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shrink-0 ${skill.tier === 'strong' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400'}`}>
                                            {skill.tier}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400">
                                        <span className="text-gray-900 dark:text-[#f2f2f7]">{Math.round(skill.confidence_score)}</span>
                                        <div className="w-24 h-1 bg-sidebar dark:bg-[#3a3a3c] rounded-full overflow-hidden">
                                            <div className="bg-teal-600 h-full rounded-full" style={{ width: `${skill.confidence_score}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                                {expandedSkillId === skill.id ? <ChevronUp className="h-4 w-4 text-gray-300" /> : <ChevronDown className="h-4 w-4 text-gray-300" />}
                            </button>

                            {expandedSkillId === skill.id && (
                                <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                                    <div className="pt-4 border-t border-gray-50 dark:border-[#3a3a3c] grid grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 dark:text-[#636366] uppercase tracking-widest mb-3">Signal Contributions</p>
                                            <div className="space-y-2">
                                                {[
                                                    { label: "Work You've Submitted", val: (skill.pow_score * 40).toFixed(1), total: 40 },
                                                    { label: 'Practice Score', val: (skill.practice_score * 30).toFixed(1), total: 30 },
                                                    { label: 'Topics Covered', val: (skill.topic_completion * 15).toFixed(1), total: 15 },
                                                    { label: 'Concept Depth', val: (Math.min(skill.depth_score, 1.0) * 15).toFixed(1), total: 15 }
                                                ].map((s, i) => (
                                                    <div key={i} className="flex justify-between items-center text-[10px]">
                                                        <span className="font-bold text-gray-500 dark:text-[#aeaeb2]">{s.label}</span>
                                                        <span className="font-black text-gray-900 dark:text-[#f2f2f7]">{Math.min(Number(s.val), s.total).toFixed(1)} / {s.total}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 dark:text-[#636366] uppercase tracking-widest mb-3">Metadata</p>
                                            <div className="space-y-2 text-[10px]">
                                                <div className="flex items-center gap-2 text-gray-500 dark:text-[#aeaeb2] font-bold">
                                                    <Timer className="h-3 w-3" />
                                                    <span>{Math.round(skill.time_invested)}h training time</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-500 dark:text-[#aeaeb2] font-bold">
                                                    <Target className="h-3 w-3" />
                                                    <span>Earned in {skill.contributing_roadmap_ids?.length || 1} { (skill.contributing_roadmap_ids?.length || 1) === 1 ? 'Roadmap' : 'Roadmaps' }</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-500 dark:text-[#aeaeb2] font-bold">
                                                    <ShieldCheck className="h-3 w-3" />
                                                    <span>Last Checked {new Date(skill.last_updated).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. EXPANDABLE SECTIONS */}
            <div className="space-y-4 pt-4 border-t border-border dark:border-[#3a3a3c]">
                {/* Training History */}
                <div className="bg-background dark:bg-[#2c2c2e] rounded-xl border border-border dark:border-[#3a3a3c] overflow-hidden">
                    <button 
                        onClick={() => setIsTrainingExpanded(!isTrainingExpanded)}
                        className="w-full p-4 flex items-center justify-between text-left group"
                    >
                        <div className="flex items-center gap-3">
                            <History className="h-4 w-4 text-teal-600" />
                            <h3 className="text-xs font-black text-gray-900 dark:text-[#f2f2f7] uppercase tracking-widest">Training History</h3>
                        </div>
                        {isTrainingExpanded ? <ChevronUp className="h-4 w-4 text-gray-300" /> : <ChevronDown className="h-4 w-4 text-gray-300" />}
                    </button>
                    {isTrainingExpanded && (
                        <div className="p-4 pt-0 text-xs text-gray-500 dark:text-[#aeaeb2] leading-relaxed animate-in slide-in-from-top-2 duration-200">
                            Your full chronological log of learning activities, roadmap starts, and milestones. Use this to track your velocity over long periods.
                        </div>
                    )}
                </div>

                {/* Verification System */}
                <div className="bg-background dark:bg-[#2c2c2e] rounded-xl border border-border dark:border-[#3a3a3c] overflow-hidden">
                    <button 
                        onClick={() => setIsSystemExpanded(!isSystemExpanded)}
                        className="w-full p-4 flex items-center justify-between text-left group"
                    >
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="h-4 w-4 text-orange-600" />
                            <h3 className="text-xs font-black text-gray-900 dark:text-[#f2f2f7] uppercase tracking-widest">Verification System</h3>
                        </div>
                        {isSystemExpanded ? <ChevronUp className="h-4 w-4 text-gray-300" /> : <ChevronDown className="h-4 w-4 text-gray-300" />}
                    </button>
                    {isSystemExpanded && (
                        <div className="p-4 pt-0 animate-in slide-in-from-top-2 duration-200">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] font-bold text-gray-500 dark:text-[#aeaeb2] uppercase tracking-tight">
                                {[
                                    'Automated progress tracking',
                                    'AI-evaluated proof of work',
                                    'Permanent evidence attachment',
                                    'Verified practice completion',
                                    'Active learning time tracking',
                                    'Independent roadmap scoring'
                                ].map((p, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                        <span>{p}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
