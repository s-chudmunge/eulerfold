"use client";

import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import GoalGeneratorModal from '../landing/GoalGeneratorModal';
import Link from 'next/link';

interface CommunitySidebarCardProps {
    onOpenRoadmapModal: () => void;
}

export default function CommunitySidebarCard({ onOpenRoadmapModal }: CommunitySidebarCardProps) {
    const [credits, setCredits] = useState<number | null>(null);

    useEffect(() => {
        const fetchCredits = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('roadmap_credits')
                    .eq('supabase_uid', session.user.id)
                    .single();
                if (data) setCredits(data.roadmap_credits);
            }
        };
        fetchCredits();
    }, []);

    return (
        <>
            <div className="bg-[#111817] border border-emerald-900/20 rounded-[20px] p-6 relative overflow-hidden group shadow-2xl">
                {/* Background Turtle Decor */}
                <div className="absolute -bottom-4 -right-4 text-[100px] opacity-[0.03] grayscale -rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                    🐢
                </div>

                <div className="relative z-10 flex flex-col h-full">
                    <div className="mb-5">
                        <span className="inconsolata-ui text-[10px] font-bold text-teal-500 uppercase tracking-[0.3em]">
                            EULERFOLD INTELLIGENCE
                        </span>
                    </div>

                    <h2 className="inconsolata-ui text-[22px] font-bold text-white leading-tight mb-4 tracking-tight">
                        Join the EulerFold community
                    </h2>

                    <p className="manrope-body text-[13px] text-gray-400 mb-8 leading-relaxed font-medium">
                        Track progress and collaborate on roadmaps with students worldwide.
                    </p>

                    <div className="mt-auto space-y-5">
                        <button 
                            onClick={onOpenRoadmapModal}
                            className="w-full flex items-center justify-between gap-3 bg-[#d1d5db] hover:bg-white text-[#111817] rounded-[12px] px-5 py-3.5 transition-all group/btn"
                        >
                            <span className="text-[12px] font-bold text-left leading-tight">
                                Create your step by step<br />learning path
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                        </button>

                        <Link 
                            href="/pricing" 
                            className="inline-flex items-center gap-2 text-[10px] font-bold text-teal-500 uppercase tracking-[0.2em] hover:text-teal-400 transition-colors"
                        >
                            BUY MORE CREDITS <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
