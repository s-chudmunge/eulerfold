"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { User, LayoutDashboard, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function UserNav() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-x-6 text-[14px] font-medium text-text-muted animate-pulse">
        <div className="w-12 h-4 bg-border rounded"></div>
        <div className="w-16 h-8 bg-[var(--text-heading)] rounded-full opacity-20"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard" 
          className="hidden md:flex items-center gap-1.5 text-[12px] font-bold text-text-muted hover:text-text-heading transition-colors uppercase tracking-tight"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <Link 
            href="/settings"
            className="w-8 h-8 rounded-full bg-sidebar dark:bg-white/5 border border-border dark:border-white/10 flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity"
          >
            {user.metadata?.avatar_url ? (
              <img src={user.metadata.avatar_url} alt="" className="w-full h-full object-cover grayscale-[0.5]" />
            ) : (
              <span className="text-[10px] font-bold text-teal-600 uppercase">
                {user.email?.substring(0, 1)}
              </span>
            )}
          </Link>
          <button 
            onClick={handleSignOut}
            className="p-2 text-text-muted hover:text-red-500 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 md:gap-6">
      <Link
        href="/login"
        className="text-[12px] md:text-[13px] font-bold text-text-muted hover:text-text-heading transition-colors uppercase tracking-tight"
      >
        Sign in
      </Link>
      <Link 
        href="/generate"
        className="bg-text-heading dark:bg-white text-background dark:text-black px-4 py-1.5 rounded-full text-[12px] md:text-[13px] font-bold hover:opacity-90 transition-opacity uppercase tracking-tight shadow-sm"
      >
        New Goal
      </Link>
    </div>
  );
}
