"use client";

import React from 'react';
import Link from 'next/link';
import UserNav from '@/components/UserNav';
import GitHubStarButton from '@/components/GitHubStarButton';
import ThemeToggle from '@/components/ThemeToggle';

export default function ProfileHeader() {
  return (
    <header className="border-b border-border bg-header sticky top-0 z-50 inset-x-0 h-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-6">
          <Link 
            href="/" 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
            aria-label="EulerFold Home"
          >
            <img 
              src="/apple-touch-icon.png" 
              alt="EulerFold" 
              className="w-6 h-6 object-contain" 
            />
            <span className="font-bold text-base tracking-tight text-text-heading">
              eulerfold
            </span>
          </Link>
        </div>

        {/* Right: Actions (Theme, Star, UserNav) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <GitHubStarButton className="hidden sm:inline-flex" />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
