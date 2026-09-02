'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, Award, Loader, Sparkles } from 'lucide-react';

interface CourseCompletionBannerProps {
  isPro: boolean;
  certificateId: string | null;
}

export default function CourseCompletionBanner({
  isPro,
  certificateId
}: CourseCompletionBannerProps) {
  return (
    <div className="mb-6 p-5 bg-accent/10 border border-accent/20 rounded-md flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-accent/20 rounded-full flex items-center justify-center shrink-0">
          <Trophy className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-text-heading">Course complete. 🏆</h3>
          <p className="text-text-primary text-[12px]">
            Every topic, practice session, and evaluation has been completed.
          </p>
        </div>
      </div>
      <div className="shrink-0">
        {isPro ? (
          certificateId ? (
            <Link 
              href={`/certificates/${certificateId}`} 
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-accent text-background rounded-md font-bold text-[12px] hover:opacity-90 transition-opacity shadow-xs"
            >
              <Award className="h-3.5 w-3.5" />
              <span>View Certificate</span>
            </Link>
          ) : (
            <button 
              disabled
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-accent/60 text-background rounded-md font-bold text-[12px] shadow-xs cursor-not-allowed"
            >
              <Loader className="h-3.5 w-3.5 animate-spin" />
              <span>Generating...</span>
            </button>
          )
        ) : (
          <Link 
            href="/settings/billing" 
            className="inline-flex flex-col items-center justify-center px-4 py-1.5 bg-text-heading text-background rounded-md font-bold hover:opacity-90 transition-opacity shadow-xs"
          >
            <span className="flex items-center gap-1.5 text-[12px]">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Upgrade to Pro
            </span>
            <span className="text-[9px] font-normal opacity-70">to download certificate</span>
          </Link>
        )}
      </div>
    </div>
  );
}
