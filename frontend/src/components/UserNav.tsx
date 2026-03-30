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
      <div className="flex items-center gap-3 sm:gap-4">
        <Link 
          href="/dashboard" 
          className="hidden lg:flex items-center gap-2 text-[12px] font-bold text-text-muted hover:text-text-heading transition-all active:scale-95 uppercase tracking-tight"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Dashboard
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link 
            href="/settings"
            className="w-8 h-8 rounded-full bg-sidebar/50 border border-border flex items-center justify-center overflow-hidden hover:border-accent/30 transition-all active:scale-90 shadow-sm"
          >
            {user.metadata?.avatar_url ? (
              <img src={user.metadata.avatar_url} alt="" className="w-full h-full object-cover grayscale-[0.5]" />
            ) : (
              <span className="text-[10px] font-black text-accent uppercase">
                {user.email?.substring(0, 1)}
              </span>
            )}
          </Link>
          <button 
            onClick={handleSignOut}
            className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-500/5 rounded-lg transition-all active:scale-90"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 sm:gap-6">
      <Link
        href="/login"
        className="text-[12px] font-bold text-text-muted hover:text-text-heading transition-all active:scale-95 uppercase tracking-tight"
      >
        Sign in
      </Link>
    </div>
  );
}
