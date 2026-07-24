import React, { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import FluidGradient from './FluidGradient';
import { textToGradientConfig } from '@/lib/gradientUtils';

export default function RoadmapBanner({ 
  title, 
  slug,
  authorName,
  username,
  avatarUrl
}: { 
  title: string; 
  slug?: string;
  authorName?: string;
  username?: string;
  avatarUrl?: string;
}) {
  const { colors, pattern, speed } = useMemo(() => textToGradientConfig(title), [title]);

  return (
    <div className="w-full h-[500px] md:h-[550px] lg:h-[650px] relative overflow-hidden border-b border-border/40 shadow-sm">
      <div className="absolute inset-0 z-0">
        <FluidGradient
          colors={colors}
          pattern={pattern}
          speed={speed}
          intensity={1.1}
        />
      </div>
      <div className="absolute inset-0 z-10 bg-black/30" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 md:p-12 text-center pointer-events-none gap-8">
        <h1 
          className="font-inter font-bold text-white tracking-tight leading-[1.2] drop-shadow-xl max-w-5xl"
          style={{ 
            fontSize: 'clamp(28px, 3.5vw, 48px)',
            textShadow: '0 4px 30px rgba(0,0,0,0.5)',
            wordBreak: 'break-word',
            margin: 0
          }}
        >
          {title}
        </h1>

        {(authorName || username) && (
          <div className="flex items-center gap-2 text-white/90 font-medium text-[14px] md:text-[15px] drop-shadow-md bg-black/20 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm pointer-events-auto mt-2">
            <span className="opacity-80 font-inconsolata uppercase tracking-wider text-[11px] md:text-[12px]">Created By</span>
            {username ? (
              <Link href={`/u/${username}`} className="flex items-center gap-2 hover:text-white transition-colors group">
                <img 
                    src={(avatarUrl?.includes('initials') ? null : avatarUrl) || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(authorName || username || 'User')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`}
                    alt={authorName || username}
                    className="w-5 h-5 md:w-6 md:h-6 rounded-full border border-white/40 object-cover group-hover:border-white transition-colors"
                />
                <span className="font-bold underline-offset-4 group-hover:underline">{authorName || username}</span>
              </Link>
            ) : (
              <span className="flex items-center gap-2">
                <img 
                    src={(avatarUrl?.includes('initials') ? null : avatarUrl) || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(authorName || 'User')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`}
                    alt={authorName || "User"}
                    className="w-5 h-5 md:w-6 md:h-6 rounded-full border border-white/40 object-cover"
                />
                <span className="font-bold">{authorName || username}</span>
              </span>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4 pointer-events-auto mt-2">
          {slug && (
            <Link 
              href={`/roadmap/${slug}/learn`}
              className="inline-flex items-center justify-center gap-2 bg-accent text-white hover:bg-teal-700 px-8 py-3.5 rounded-xl text-[14px] md:text-[15px] font-bold transition-all shadow-lg font-inter backdrop-blur-sm border border-accent/50"
            >
              Start Learning <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          <a 
            href="#course-content"
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-3.5 rounded-xl text-[14px] md:text-[15px] font-bold transition-all shadow-lg font-inter backdrop-blur-md border border-white/20"
          >
            <BookOpen className="w-4 h-4" /> Go to Course
          </a>
        </div>
      </div>
    </div>
  );
}
