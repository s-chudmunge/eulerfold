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
  onMenuClick,
  onOpenSyllabus,
  modules = [],
  currentModuleIndex = 0,
  onModuleChange
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
  onMenuClick?: () => void,
  onOpenSyllabus?: () => void,
  modules?: any[],
  currentModuleIndex?: number,
  onModuleChange?: (idx: number) => void
}) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isModuleDropdownOpen, setIsModuleDropdownOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModuleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <header className="fixed top-0 inset-x-0 z-50 bg-header border-b border-border px-4 md:px-6 h-[56px] flex items-center justify-between transition-colors duration-300">
      {/* Left: Logo & Breadcrumbs */}
      <div className="flex items-center gap-4 min-w-0">
        <Link href="/" className="flex items-center group shrink-0">
          <img src="/apple-touch-icon.png" alt="EulerFold" className="w-8 h-8 group-hover:opacity-80 transition-opacity" />
        </Link>
        
        <div className="h-4 w-px bg-border hidden md:block"></div>
        
        <nav className="hidden md:flex items-center gap-2 text-[13px] font-medium text-text-muted">
          <Link 
            href={`/roadmap/${roadmapSlug || roadmapId}`}
            className="hover:text-text-heading transition-colors truncate max-w-[150px] lg:max-w-[200px]"
          >
            {roadmapTitle}
          </Link>
          <span className="text-border">/</span>
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsModuleDropdownOpen(!isModuleDropdownOpen)}
              className="flex items-center gap-1.5 text-text-heading font-semibold hover:bg-callout-bg px-2 py-1 rounded-md transition-colors truncate max-w-[200px]"
            >
              <span className="truncate">
                {modules[currentModuleIndex]?.title?.toLowerCase().startsWith('module')
                  ? modules[currentModuleIndex].title
                  : `Module ${currentModuleIndex + 1}: ${modules[currentModuleIndex]?.title}`}
              </span>
              <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isModuleDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isModuleDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-72 bg-background border border-border rounded-xl shadow-2xl py-2 z-[60] animate-in fade-in slide-in-from-top-1 duration-200">
                <p className="px-4 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider">Select Module</p>
                <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
                  {modules.map((m, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onModuleChange?.(idx);
                        setIsModuleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors flex flex-col gap-0.5 ${
                        idx === currentModuleIndex 
                          ? 'bg-accent/5 text-accent font-bold' 
                          : 'text-text-primary hover:bg-callout-bg'
                      }`}
                    >
                      <span className="truncate">
                        {m.title?.toLowerCase().startsWith('module')
                          ? m.title
                          : `Module ${idx + 1}: ${m.title}`}
                      </span>
                      <span className="text-[10px] text-text-muted font-normal">{m.topics?.length || 0} Units</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 text-text-muted hover:text-text-heading transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 border-r border-border pr-3 mr-1">
          <button 
            onClick={onOpenSyllabus}
            className="hidden sm:flex items-center px-4 py-1.5 rounded-lg text-[13px] font-bold text-text-muted hover:text-text-heading hover:bg-callout-bg transition-all"
          >
            Roadmap Syllabus
          </button>
          
          <div className="flex items-center bg-callout-bg rounded-lg p-0.5">
            <button 
              onClick={onPrev} 
              disabled={!hasPrev}
              className="w-8 h-8 flex items-center justify-center rounded-md transition-all text-text-muted hover:text-text-heading hover:bg-background disabled:opacity-20"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button 
              onClick={onNext} 
              disabled={!hasNext}
              className="w-8 h-8 flex items-center justify-center rounded-md transition-all text-text-muted hover:text-text-heading hover:bg-background disabled:opacity-20"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {user ? (
          <ProfileDropdown user={user} profile={profile} handleSignOut={handleSignOut} />
        ) : (
          <div className="w-8 h-8 bg-callout-bg animate-pulse rounded-full" />
        )}
      </div>
    </header>
  );
}
