'use client';

import React, { useState, useEffect } from 'react';
import { X, Gift } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    // Only show if not on dashboard
    if (pathname !== '/dashboard') {
        setIsVisible(true);
        document.documentElement.style.setProperty('--announcement-height', '32px');
    } else {
        setIsVisible(false);
        document.documentElement.style.setProperty('--announcement-height', '0px');
    }
    
    return () => {
      document.documentElement.style.setProperty('--announcement-height', '0px');
      subscription.unsubscribe();
    };
  }, [pathname]);

  const handleClose = () => {
    setIsVisible(false);
    document.documentElement.style.setProperty('--announcement-height', '0px');
  };

  if (!isVisible || pathname === '/dashboard') {
    // Ensure height is 0 if not visible or on dashboard
    if (typeof document !== 'undefined') {
        document.documentElement.style.setProperty('--announcement-height', '0px');
    }
    return null;
  }

  return (
    <div className="fixed top-0 inset-x-0 z-[70] bg-gradient-to-r from-teal-900 via-teal-700 to-teal-900 text-white h-[32px] flex items-center px-4 md:px-6 transition-all duration-500 ease-in-out border-b border-white/10 shadow-sm overflow-hidden">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-center gap-3">
        <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold uppercase tracking-widest">
          <Gift className="w-3.5 h-3.5 text-teal-300" />
          <span>Launch promo: Get 5 free roadmaps on signup</span>
        </div>
        <Link 
          href={isLoggedIn ? "/generate" : "/login"} 
          className="bg-white text-teal-800 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter hover:bg-teal-50 transition-colors hidden sm:block shadow-sm"
        >
          Claim Now
        </Link>
        <button 
          onClick={handleClose}
          className="absolute right-2 md:right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Close announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
