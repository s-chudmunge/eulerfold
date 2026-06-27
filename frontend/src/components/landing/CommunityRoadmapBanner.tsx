"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import GoalGeneratorModal from './GoalGeneratorModal';
import { supabase } from '@/lib/supabase/client';

interface CommunityBannerProps {
    title?: string;
    description?: string;
    showClose?: boolean;
    onOpenModal?: () => void;
}

export default function CommunityRoadmapBanner({ 
    title = "Join the EulerFold community", 
    description = "Track progress and collaborate on roadmaps with students worldwide.",
    showClose = false,
    onOpenModal
}: CommunityBannerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [credits, setCredits] = useState<number | null>(null);

  const handleOpen = () => {
    if (onOpenModal) {
        onOpenModal();
    } else {
        setIsModalOpen(true);
    }
  };

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

  if (!isVisible) return null;

  return (
    <>
      <div className="bg-transparent rounded-3xl p-6 md:p-8 border border-border/60 relative overflow-hidden group">
        {showClose && (
            <button
                onClick={() => setIsVisible(false)}
                className="absolute top-4 right-4 z-20 p-2 text-text-muted hover:text-text-primary hover:bg-border rounded-full transition-all"
            >
                <X className="w-4 h-4" />
            </button>
        )}
        <div className="relative z-10 max-w-xl">
          <h2 className="text-[20px] md:text-[22px] font-bold mb-3 text-text-heading tracking-tight inconsolata-ui">{title}</h2>
          <p className="manrope-body text-[13px] md:text-[14px] mb-6 text-text-primary leading-relaxed font-medium">
            {description}
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <button 
                onClick={handleOpen}
                className="inline-flex items-center gap-2 bg-[var(--text-heading)] text-[var(--bg-main)] rounded-full px-6 py-2.5 text-[13px] font-bold hover:opacity-90 transition-all shadow-md hover:shadow-teal-500/20"
            >
                Create your step by step learning path <ArrowRight className="w-4 h-4" />
            </button>

            {credits !== null && credits < 1 && (
                <Link href="/pricing" className="text-[11px] font-bold text-accent uppercase tracking-widest hover:underline">
                    BUY MORE CREDITS →
                </Link>
            )}
          </div>
        </div>

      </div>

      {!onOpenModal && <GoalGeneratorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
