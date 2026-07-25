import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Github, Mail, Loader2 } from 'lucide-react';
import FluidGradient from './FluidGradient';
import { textToGradientConfig } from '@/lib/gradientUtils';
import { supabase } from '@/lib/supabase/client';

export default function RoadmapBanner({ 
  title, 
  slug,
  authorName,
  username,
  avatarUrl,
  isAuthenticated,
  onStartLearning
}: { 
  title: string; 
  slug?: string;
  authorName?: string;
  username?: string;
  avatarUrl?: string;
  isAuthenticated?: boolean;
  onStartLearning?: () => void;
}) {
  const { colors, pattern, speed } = useMemo(() => textToGradientConfig(title), [title]);
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'github' | null>(null);

  const handleLogin = async (provider: 'google' | 'github') => {
    setLoadingProvider(provider);
    try {
      const next = slug ? `/roadmap/${slug}` : '';
      await supabase.auth.signInWithOAuth({ 
          provider,
          options: {
              redirectTo: `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ''}`
          }
      });
    } catch (err) {
      setLoadingProvider(null);
    }
  };

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
      <div className="absolute inset-0 z-10 bg-black/10" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 md:p-12 text-center pointer-events-none gap-8">
        <h1 
          className="font-inter font-bold text-white tracking-tight leading-[1.2] drop-shadow-2xl max-w-5xl"
          style={{ 
            fontSize: 'clamp(28px, 3.5vw, 48px)',
            textShadow: '0 2px 12px rgba(0,0,0,0.7), 0 4px 30px rgba(0,0,0,0.6)',
            wordBreak: 'break-word',
            margin: 0
          }}
        >
          {title}
        </h1>

        {(authorName || username) && (
          <div className="flex items-center gap-1.5 text-white/90 font-medium text-[12px] md:text-[13px] drop-shadow-md bg-black/20 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm pointer-events-auto mt-1">
            <span className="opacity-80 font-inconsolata uppercase tracking-wider text-[9px] md:text-[10px]">Created By</span>
            {username ? (
              <Link href={`/u/${username}`} className="flex items-center gap-1.5 hover:text-white transition-colors group">
                <img 
                    src={(avatarUrl?.includes('initials') ? null : avatarUrl) || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(authorName || username || 'User')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`}
                    alt={authorName || username}
                    className="w-4 h-4 md:w-5 md:h-5 rounded-full border border-white/40 object-cover group-hover:border-white transition-colors"
                />
                <span className="font-bold underline-offset-4 group-hover:underline">{authorName || username}</span>
              </Link>
            ) : (
              <span className="flex items-center gap-1.5">
                <img 
                    src={(avatarUrl?.includes('initials') ? null : avatarUrl) || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(authorName || 'User')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`}
                    alt={authorName || "User"}
                    className="w-4 h-4 md:w-5 md:h-5 rounded-full border border-white/40 object-cover"
                />
                <span className="font-bold">{authorName || username}</span>
              </span>
            )}
          </div>
        )}

        {slug && (
          isAuthenticated ? (
            <div className="flex flex-wrap items-center justify-center gap-4 pointer-events-auto mt-2">
              <button 
                onClick={() => onStartLearning ? onStartLearning() : window.location.href = `/roadmap/${slug}/learn`}
                className="inline-flex items-center justify-center gap-2 bg-accent text-white hover:bg-teal-700 px-8 py-3.5 rounded-xl text-[14px] md:text-[15px] font-bold transition-all shadow-lg font-inter backdrop-blur-sm border border-accent/50"
              >
                Start Learning <ArrowRight className="w-4 h-4" />
              </button>
              <a 
                href="#course-content"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-3.5 rounded-xl text-[14px] md:text-[15px] font-bold transition-all shadow-lg font-inter backdrop-blur-md border border-white/20"
              >
                <BookOpen className="w-4 h-4" /> Go to Course
              </a>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 pointer-events-auto mt-2">
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest font-inconsolata">Sign in to start</span>
                <div className="flex items-center gap-2.5">
                  <button 
                    onClick={() => handleLogin('google')} 
                    disabled={loadingProvider !== null}
                    title="Sign in with Google"
                    className="w-10 h-10 flex items-center justify-center bg-white text-black rounded-lg hover:bg-gray-100 transition-colors shadow-md disabled:opacity-50"
                  >
                    {loadingProvider === 'google' ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    )}
                  </button>
                  <button 
                    onClick={() => handleLogin('github')} 
                    disabled={loadingProvider !== null}
                    title="Sign in with GitHub"
                    className="w-10 h-10 flex items-center justify-center bg-[#24292e] text-white rounded-lg hover:bg-[#2f363d] transition-colors shadow-md border border-white/10 disabled:opacity-50"
                  >
                    {loadingProvider === 'github' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
                  </button>
                  <Link 
                    href={`/login?next=/roadmap/${slug}`} 
                    title="Sign in with Email"
                    className="w-10 h-10 flex items-center justify-center bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors shadow-md backdrop-blur-md border border-white/20 disabled:opacity-50"
                  >
                    <Mail className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              <a 
                href="#course-content"
                className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-2 rounded-lg text-[12px] font-bold transition-all shadow-md font-inter backdrop-blur-md border border-white/10 mt-1"
              >
                <BookOpen className="w-3.5 h-3.5" /> Go to Course
              </a>
            </div>
          )
        )}
      </div>
    </div>
  );
}
