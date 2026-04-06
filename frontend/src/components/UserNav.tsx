"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { User as UserIcon, LayoutDashboard, LogOut, Settings, ChevronDown, UserCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function UserNav() {
  const { user, loading } = useAuth();
  const router = useRouter();
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
          className="flex items-center gap-1.5 p-0.5 rounded-full hover:bg-sidebar/60 transition-all active:scale-95 border border-transparent hover:border-border/40"
        >
          <div className="w-7 h-7 rounded-full bg-accent/10 border border-border/50 flex items-center justify-center overflow-hidden shadow-sm">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] font-bold text-accent">
                {initials}
              </span>
            )}
          </div>
          <ChevronDown className={`w-3 h-3 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1.5 w-56 bg-header border border-border rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl z-[100] animate-in fade-in zoom-in-95 duration-150 origin-top-right overflow-hidden">
            {/* User Info Section */}
            <div className="px-3.5 py-2.5 border-b border-border/50 bg-sidebar/10">
              <p className="text-[12px] font-bold text-text-heading truncate leading-tight">{displayName}</p>
              <p className="text-[10px] text-text-muted truncate opacity-60 leading-tight mt-0.5">{user.email}</p>
            </div>

            {/* Menu Items */}
            <div className="p-1">
              <Link 
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 text-[12px] font-medium text-text-muted hover:text-text-heading hover:bg-sidebar/60 rounded-lg transition-all group"
              >
                <LayoutDashboard className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:text-accent transition-all" />
                Dashboard
              </Link>
              
              {user.username && (
                <Link 
                  href={`/u/${user.username}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 text-[12px] font-medium text-text-muted hover:text-text-heading hover:bg-sidebar/60 rounded-lg transition-all group"
                >
                  <UserCircle className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:text-accent transition-all" />
                  Public profile
                </Link>
              )}

              <Link 
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 text-[12px] font-medium text-text-muted hover:text-text-heading hover:bg-sidebar/60 rounded-lg transition-all group"
              >
                <Settings className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:text-accent transition-all" />
                Settings
              </Link>
            </div>

            {/* Sign Out Section */}
            <div className="p-1 border-t border-border/50">
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-[12px] font-medium text-red-500 hover:bg-red-500/5 rounded-lg transition-all group"
              >
                <LogOut className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-all" />
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
        className="text-[12px] font-bold text-text-heading px-5 py-2 rounded-full border border-border/80 hover:bg-sidebar/60 hover:border-text-muted transition-all active:scale-95 shadow-sm hover:shadow-md"
      >
        Sign in
      </Link>
    </div>
  );
}
