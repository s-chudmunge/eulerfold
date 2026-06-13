"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { User as UserIcon, LayoutDashboard, LogOut, Settings, ChevronDown, UserCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useSettings } from './SettingsProvider';

export default function UserNav() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { openSettings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    router.refresh();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="w-7 h-7 rounded-full bg-border/20 animate-pulse" />
    );
  }

  if (user) {
    const avatarUrl = user.metadata?.avatar_url;
    const displayName = user.display_name || user.metadata?.full_name || 'User';
    const initials = displayName.substring(0, 1).toUpperCase();

    return (
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-1 rounded-lg hover:bg-sidebar/40 transition-colors border border-transparent hover:border-border/40"
        >
          <div className="w-6.5 h-6.5 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center overflow-hidden">
            <img 
              src={(avatarUrl?.includes('initials') ? null : avatarUrl) || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`} 
              alt={displayName} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[13px] font-semibold text-text-heading tracking-tight max-w-[100px] truncate hidden sm:block">
              {displayName.split(' ')[0]}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-text-muted opacity-40 transition-transform duration-300 ${isOpen ? 'rotate-180 opacity-100' : ''}`} />
          </div>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-60 bg-header border border-border shadow-[0_15px_50px_-12px_rgba(0,0,0,0.15)] z-[100] animate-in fade-in zoom-in-98 slide-in-from-top-2 duration-200 origin-top-right rounded-xl overflow-hidden">
            {/* User Info Section */}
            <div className="px-4 py-3 border-b border-border/50">
              <p className="text-[13px] font-bold text-text-heading truncate tracking-tight">{displayName}</p>
              <p className="text-[11px] text-text-muted truncate opacity-70 mt-0.5 font-medium">{user.email}</p>
            </div>

            {/* Menu Items */}
            <div className="p-1.5">
              <Link 
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-2.5 py-2 text-[13px] font-medium text-text-muted hover:text-text-heading hover:bg-sidebar/50 rounded-lg transition-all group"
              >
                <div className="w-5 h-5 rounded-md bg-sidebar border border-border/50 flex items-center justify-center group-hover:bg-header group-hover:border-accent/30 transition-all">
                  <LayoutDashboard className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:text-accent" />
                </div>
                Dashboard
              </Link>
              
              {user.username && (
                <Link 
                  href={`/u/${user.username}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-2.5 py-2 text-[13px] font-medium text-text-muted hover:text-text-heading hover:bg-sidebar/50 rounded-lg transition-all group"
                >
                  <div className="w-5 h-5 rounded-md bg-sidebar border border-border/50 flex items-center justify-center group-hover:bg-header group-hover:border-accent/30 transition-all">
                    <UserCircle className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:text-accent" />
                  </div>
                  Public Profile
                </Link>
              )}

              <button 
                onClick={() => { setIsOpen(false); openSettings(); }}
                className="w-full flex items-center gap-3 px-2.5 py-2 text-[13px] font-medium text-text-muted hover:text-text-heading hover:bg-sidebar/50 rounded-lg transition-all group"
              >
                <div className="w-5 h-5 rounded-md bg-sidebar border border-border/50 flex items-center justify-center group-hover:bg-header group-hover:border-accent/30 transition-all">
                  <Settings className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:text-accent" />
                </div>
                Settings
              </button>
            </div>

            {/* Sign Out Section */}
            <div className="p-1.5 border-t border-border/50 bg-sidebar/5">
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-2.5 py-2 text-[13px] font-semibold text-red-500 hover:bg-red-500/10 rounded-lg transition-all group"
              >
                <div className="w-5 h-5 rounded-md bg-red-500/5 border border-red-500/10 flex items-center justify-center group-hover:bg-red-500/10 transition-all">
                  <LogOut className="w-3 h-3 opacity-80 group-hover:opacity-100" />
                </div>
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    );

  }

  return (
    <div className="flex items-center gap-4">
      <Link
        href="/login"
        className="inline-flex items-center justify-center bg-gradient-to-b from-teal-400 to-teal-600 text-white px-5 py-1.5 rounded-lg text-[12px] font-bold transition-all hover:brightness-110 active:border-b-0 active:translate-y-[3px] border-b-[3px] border-teal-800 shadow-sm"
      >
        Sign in
      </Link>
    </div>
  );
}
