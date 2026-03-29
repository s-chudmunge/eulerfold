// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { LogOut, ChevronDown, Settings, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, User as UserIcon, Trophy, Menu } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';

const ProfileDropdown = ({ user, profile, handleSignOut }: { user: any; profile: any; handleSignOut: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const firstName = user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0];
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-2 py-1 bg-background border border-border rounded-full transition-all hover:bg-callout-bg"
      >
        <div className="w-5 h-5 rounded-full overflow-hidden border border-border/50 flex items-center justify-center bg-callout-bg shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={firstName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[9px] font-bold text-text-muted uppercase">
              {firstName.substring(0, 2)}
            </span>
          )}
        </div>
        <span className="text-[11px] font-bold text-text-muted hidden sm:inline-block tracking-tight">
          {firstName}
        </span>
        <ChevronDown className={`h-3 w-3 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-background rounded-xl shadow-2xl border border-border py-1.5 z-[60] animate-in fade-in slide-in-from-top-2 duration-200 transition-colors">
          <div className="px-4 py-2 border-b border-border/50 mb-1">
            <p className="text-[9px] font-bold text-text-muted tracking-wide mb-0.5">Session</p>
            <p className="text-[11px] font-bold text-text-heading truncate leading-tight">{user.email}</p>
          </div>
          
          {profile?.username && (
            <Link 
              href={`/u/${profile.username}`} 
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-2 text-[12px] font-bold text-accent hover:bg-accent/5 transition-colors"
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span className="tracking-tight">Public profile</span>
            </Link>
          )}

          <Link 
            href="/settings" 
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 px-4 py-2 text-[12px] font-bold text-text-muted hover:bg-callout-bg hover:text-text-heading transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="tracking-tight">Settings</span>
          </Link>

          <div className="h-px bg-[var(--border)]/50 my-1 mx-2" />
          
          <button
            onClick={() => {
              setIsOpen(false);
              handleSignOut();
            }}
            className="flex items-center space-x-3 w-full px-4 py-2 text-[12px] font-bold text-red-500 hover:bg-red-500/5 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="tracking-tight">Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default function CourseHeader({ 
  roadmapId, 
  roadmapSlug,
  roadmapTitle, 
  unitInfo, 
  unitTitle,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  onMenuClick
}: { 
  roadmapId: number | string, 
  roadmapSlug?: string,
  roadmapTitle?: string,
  unitInfo?: string,
  unitTitle?: string,
  onPrev?: () => void,
  onNext?: () => void,
  hasPrev?: boolean,
  hasNext?: boolean,
  onMenuClick?: () => void
}) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        try {
          const data = await authAPI.getMe();
          setProfile(data);
        } catch (e) {
          console.error("Failed to fetch profile in course header", e);
        }
      } else {
        setProfile(null);
      }
    }
    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut({ scope: 'local' });
    router.push('/');
    router.refresh();
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-header border-b border-border px-4 md:px-6 h-[48px] flex items-center justify-between transition-colors duration-300">
      {/* Left: Menu & Logo */}
      <div className="flex items-center gap-1 md:gap-4 shrink-0">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="p-2 -ml-2 text-text-muted hover:text-text-heading transition-colors"
            aria-label="Toggle curriculum sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        
        <div className="h-3 w-px bg-[var(--border)] hidden md:block mx-1"></div>
        
        <Link href="/" className="flex items-center group shrink-0">
          <img src="/apple-touch-icon.png" alt="EulerFold" className="w-7 h-7 group-hover:opacity-80 transition-opacity" />
        </Link>
      </div>

      {/* Center: Unit Info & Navigation - Redesigned Pill */}
      <div className="flex-1 flex items-center justify-center min-w-0 px-4">
        <div className="flex items-center bg-callout-bg dark:bg-white/[0.03] border border-border rounded-full p-0.5 transition-all shadow-sm hover:shadow-md hover:border-[var(--accent)]/30 group/nav">
          <button 
            onClick={onPrev} 
            disabled={!hasPrev}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-all text-text-muted hover:text-accent hover:bg-background disabled:opacity-10 disabled:hover:bg-transparent"
            aria-label="Previous unit"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <div className="px-4 md:px-8 flex flex-col items-center justify-center overflow-hidden max-w-[140px] sm:max-w-[220px] md:max-w-md border-x border-border/50">
            <span className="text-[8px] font-bold text-accent leading-none mb-0.5 truncate w-full text-center tracking-widest uppercase opacity-80">{unitInfo}</span>
            <span className="text-[10px] md:text-[12px] font-bold text-text-heading truncate w-full text-center transition-colors tracking-tight leading-tight">{unitTitle}</span>
          </div>

          <button 
            onClick={onNext} 
            disabled={!hasNext}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-all text-text-muted hover:text-accent hover:bg-background disabled:opacity-10 disabled:hover:bg-transparent"
            aria-label="Next unit"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4 shrink-0">
        {user ? (
          <ProfileDropdown user={user} profile={profile} handleSignOut={handleSignOut} />
        ) : (
          <div className="w-16 h-7 bg-callout-bg animate-pulse rounded-full" />
        )}
      </div>
    </header>
  );
}
