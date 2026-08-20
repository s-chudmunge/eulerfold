import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Github, Mail, Loader2, Clock, Users, Calendar, Copy } from 'lucide-react';
import FluidGradient from './FluidGradient';
import { textToGradientConfig } from '@/lib/gradientUtils';
import { supabase } from '@/lib/supabase/client';
import SocialShare from '@/components/SocialShare';

export default function RoadmapBanner({ 
  title, 
  slug,
  authorName,
  username,
  avatarUrl,
  subject,
  description,
  durationText,
  learnersCount,
  createdDate,
  isOwner,
  isCloned,
  isAuthenticated,
  saving,
  onStartLearning,
  onClone
}: { 
  title: string; 
  slug?: string;
  authorName?: string;
  username?: string;
  avatarUrl?: string;
  subject?: string;
  description?: string;
  durationText?: string;
  learnersCount?: number;
  createdDate?: string;
  isOwner?: boolean;
  isCloned?: boolean;
  isAuthenticated?: boolean;
  saving?: boolean;
  onStartLearning?: () => void;
  onClone?: () => void;
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

  const isProfessional = subject?.includes("JD:");
  const displaySubject = isProfessional ? subject?.replace("JD:", "").trim() : subject;

  return (
    <div className="w-full relative overflow-hidden border-b border-border/40 shadow-sm min-h-[500px] md:min-h-[600px] flex items-center bg-zinc-950">
      <div className="absolute inset-0 z-0">
        <FluidGradient
          colors={colors}
          pattern={pattern}
          speed={speed}
          intensity={1.1}
        />
      </div>
      
      {/* Base dark wash to ensure text readability */}
      <div className="absolute inset-0 z-10 bg-zinc-950/30" />
      
      {/* Soft edge gradients to frame the content without crushing the center */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-zinc-950/60 via-transparent to-transparent" />
      
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-12 py-20 flex flex-col items-start justify-center gap-6">
        
        {/* Title */}
        <h1 
          className="font-inter font-bold text-white tracking-tight leading-[1.1] drop-shadow-2xl max-w-4xl"
          style={{ 
            fontSize: 'clamp(32px, 4vw, 56px)',
            textShadow: '0 2px 20px rgba(0,0,0,0.8), 0 4px 40px rgba(0,0,0,0.6)',
            wordBreak: 'break-word',
            margin: 0
          }}
        >
          {title}
        </h1>

        {/* Description */}
        {description && (
          <p className="manrope-body text-[15px] md:text-[17px] text-white/90 leading-relaxed max-w-3xl drop-shadow-lg font-medium opacity-90">
            {description}
          </p>
        )}

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-2 text-white/80 text-[12px] md:text-[13px] font-medium drop-shadow-md">
          {(authorName || username) && (
            <div className="flex items-center gap-2">
              <span className="opacity-60 uppercase tracking-wider text-[10px] font-bold">Created By</span>
              {username ? (
                <Link href={`/u/${username}`} className="flex items-center gap-1.5 hover:text-white transition-colors group">
                  <img 
                      src={(avatarUrl?.includes('initials') ? null : avatarUrl) || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(authorName || username || 'User')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`}
                      alt={authorName || username}
                      className="w-5 h-5 rounded-full border border-white/40 object-cover group-hover:border-white transition-colors shadow-sm"
                  />
                  <span className="font-bold underline-offset-4 group-hover:underline text-white">{authorName || username}</span>
                </Link>
              ) : (
                <span className="flex items-center gap-1.5">
                  <img 
                      src={(avatarUrl?.includes('initials') ? null : avatarUrl) || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(authorName || 'User')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`}
                      alt={authorName || "User"}
                      className="w-5 h-5 rounded-full border border-white/40 object-cover shadow-sm"
                  />
                  <span className="font-bold text-white">{authorName || username}</span>
                </span>
              )}
            </div>
          )}
          
          {durationText && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 opacity-70" />
              <span>{durationText}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 opacity-70" />
            <span>{learnersCount || 0} Learners</span>
          </div>
          
          {createdDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 opacity-70" />
              <span>{new Date(createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
        </div>

        {/* Actions Area */}
        <div className="flex flex-wrap items-center gap-4 mt-6">
          {isAuthenticated ? (
            (isOwner || isCloned) ? (
              <button 
                onClick={onStartLearning}
                disabled={saving}
                className="inline-flex items-center justify-center bg-accent text-white hover:bg-teal-700 px-8 py-3.5 rounded-lg text-[14px] md:text-[15px] font-bold transition-all shadow-lg font-inter backdrop-blur-sm border border-accent/50 disabled:opacity-50"
              >
                <ArrowRight className="w-4 h-4 mr-2" /> Continue Learning
              </button>
            ) : (
              <button 
                onClick={onClone}
                disabled={saving}
                className="inline-flex items-center justify-center bg-white text-black hover:bg-gray-100 px-8 py-3.5 rounded-lg text-[14px] md:text-[15px] font-bold transition-all shadow-lg font-inter disabled:opacity-50"
              >
                <Copy className="w-4 h-4 mr-2" /> {saving ? 'Adding to Dashboard...' : 'Start Learning'}
              </button>
            )
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleLogin('google')} 
                  disabled={loadingProvider !== null}
                  title="Sign in with Google"
                  className="w-12 h-12 flex items-center justify-center bg-white text-black rounded-lg hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-50"
                >
                  {loadingProvider === 'google' ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
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
                  className="w-12 h-12 flex items-center justify-center bg-[#24292e] text-white rounded-lg hover:bg-[#2f363d] transition-colors shadow-lg border border-white/10 disabled:opacity-50"
                >
                  {loadingProvider === 'github' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Github className="w-5 h-5" />}
                </button>
                <Link 
                  href={`/login?next=/roadmap/${slug}`} 
                  title="Sign in with Email"
                  className="w-12 h-12 flex items-center justify-center bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors shadow-lg backdrop-blur-md border border-white/20 disabled:opacity-50"
                >
                  <Mail className="w-5 h-5" />
                </Link>
              </div>
              <span className="text-[12px] font-medium text-white/60 mx-2">to start learning</span>
            </div>
          )}

          <div className="hidden sm:block h-8 w-[1px] bg-white/20 mx-2" />

          <a 
            href="#course-content"
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3.5 rounded-lg text-[13px] md:text-[14px] font-bold transition-all shadow-md font-inter backdrop-blur-md border border-white/20"
          >
            <BookOpen className="w-4 h-4" /> Curriculum
          </a>

          <div className="flex items-center gap-3 ml-2">
            <p className="inconsolata-ui text-[10px] font-bold text-white/50 uppercase tracking-widest">Share:</p>
            <div className="brightness-200 contrast-200 grayscale opacity-80 hover:opacity-100 transition-opacity">
              <SocialShare 
                  title={title} 
                  text={`Check out this ${subject} course on EulerFold:`} 
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
