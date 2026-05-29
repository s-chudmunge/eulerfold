'use client';

import React from 'react';
import Link from 'next/link';
import { Instagram, Mail, Youtube } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import { useSettings } from './SettingsProvider';

export default function Footer() {
  const { openSettings } = useSettings();
  return (
    <footer className="w-full px-6 py-12 border-t border-border bg-background">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-4">
        <div className="col-span-2 md:col-span-1 flex flex-col items-start">
          <Link href="/" className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity grayscale">
            <img src="/apple-touch-icon.png" alt="" className="w-3.5 h-3.5" />
            <span className="font-semibold text-[14px] tracking-tight manrope-body text-text-heading">EulerFold</span>
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="text-[13px] font-bold text-text-heading opacity-30">Website</h4>
          <div className="flex flex-col gap-1">
            <Link href="/dashboard" className="text-[13px] text-text-muted hover:text-text-heading transition-colors">Dashboard</Link>
            <Link href="/login" className="text-[13px] text-text-muted hover:text-text-heading transition-colors">Sign in</Link>
            <Link href="/explore" className="text-[13px] text-text-muted hover:text-text-heading transition-colors">Explore</Link>
            <Link href="/roadmap" className="text-[13px] text-text-muted hover:text-text-heading transition-colors">Roadmap Index</Link>
            <Link href="/generate" className="text-[13px] text-text-muted hover:text-text-heading transition-colors">Generate</Link>

            <Link href="/planner" className="text-[13px] text-text-muted hover:text-text-heading transition-colors">Study Planner</Link>
            <Link href="/learn" className="text-[13px] text-text-muted hover:text-text-heading transition-colors">Learn</Link>
            <Link href="/pricing" className="text-[13px] text-text-muted hover:text-text-heading transition-colors">Pricing</Link>
            <Link href="/leaderboard" className="text-[13px] text-text-muted hover:text-text-heading transition-colors">Leaderboard</Link>
            <Link href="/sitemap" className="text-[13px] text-text-muted hover:text-text-heading transition-colors">Sitemap</Link>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="text-[13px] font-bold text-text-heading opacity-30">Resources</h4>
          <div className="flex flex-col gap-1">
            <Link href="/research-decoded" className="text-[13px] text-text-muted hover:text-text-heading transition-colors">Research</Link>
            <Link href="/articles" className="text-[13px] text-text-muted hover:text-text-heading transition-colors">Article Index</Link>
            <Link href="/help" className="text-[13px] text-text-muted hover:text-text-heading transition-colors">Help center</Link>
            <button 
              onClick={openSettings}
              className="text-[13px] text-text-muted hover:text-text-heading transition-colors text-left"
            >
              Settings
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="text-[13px] font-bold text-text-heading opacity-30">Company</h4>
          <div className="flex flex-col gap-1">
            <Link href="/about" className="text-[13px] text-text-muted hover:text-text-heading transition-colors">About us</Link>
            <Link href="/careers" className="text-[13px] text-text-muted hover:text-text-heading transition-colors">Careers</Link>
            <Link href="/terms" className="text-[13px] text-text-muted hover:text-text-heading transition-colors">Terms of service</Link>
            <Link href="/privacy" className="text-[13px] text-text-muted hover:text-text-heading transition-colors">Privacy</Link>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="text-[13px] font-bold text-text-heading opacity-30">Social</h4>
          <div className="flex flex-col gap-2">
            <a href="https://x.com/eulerfold" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[13px] text-text-muted hover:text-text-heading transition-colors">
              <FaXTwitter className="w-3 h-3" /> X
            </a>
            <a href="https://www.instagram.com/eulerfold" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[13px] text-text-muted hover:text-text-heading transition-colors">
              <Instagram className="w-3 h-3" /> Instagram
            </a>
            <a href="https://www.youtube.com/@eulerfold" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[13px] text-text-muted hover:text-text-heading transition-colors">
              <Youtube className="w-3 h-3" /> Youtube
            </a>
            <a href="mailto:eulerfold@gmail.com" className="flex items-center gap-2 text-[13px] text-text-muted hover:text-text-heading transition-colors">
              <Mail className="w-3 h-3" /> Contact support
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto mt-12 pt-4 border-t border-border dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-[12px] text-text-muted manrope-body opacity-60">
          © {new Date().getFullYear()} EulerFold. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
