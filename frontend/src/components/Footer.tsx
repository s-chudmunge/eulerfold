import React from 'react';
import Link from 'next/link';
import { Twitter, Instagram, Mail, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full px-6 py-12 border-t border-border bg-background">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-4">
        <div className="col-span-2 md:col-span-1 flex flex-col items-start">
          <Link href="/" className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity grayscale">
            <img src="/apple-touch-icon.png" alt="" className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px] tracking-tight manrope-body text-black dark:text-white">EulerFold</span>
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="text-[10px] font-bold text-black dark:text-white opacity-30">Website</h4>
          <div className="flex flex-col gap-1">
            <Link href="/dashboard" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Dashboard</Link>
            <Link href="/login" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Sign in</Link>
            <Link href="/explore" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Explore</Link>
            <Link href="/generate" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Generate</Link>
            <Link href="/learn" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Learn</Link>
            <Link href="/pricing" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Pricing</Link>
            <Link href="/leaderboard" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Leaderboard</Link>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="text-[10px] font-bold text-black dark:text-white opacity-30">Resources</h4>
          <div className="flex flex-col gap-1">
            <Link href="/research-decoded" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Research</Link>
            <Link href="/help" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Help center</Link>
            <Link href="/settings" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Settings</Link>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="text-[10px] font-bold text-black dark:text-white opacity-30">Company</h4>
          <div className="flex flex-col gap-1">
            <Link href="/terms" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Terms of service</Link>
            <Link href="/privacy" className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="text-[10px] font-bold text-black dark:text-white opacity-30">Social</h4>
          <div className="flex flex-col gap-2">
            <a href="https://x.com/eulerfold" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">
              <Twitter className="w-3 h-3" /> Twitter
            </a>
            <a href="https://www.instagram.com/eulerfold" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">
              <Instagram className="w-3 h-3" /> Instagram
            </a>
            <a href="https://www.youtube.com/@eulerfold" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">
              <Youtube className="w-3 h-3" /> Youtube
            </a>
            <a href="mailto:eulerfold@gmail.com" className="flex items-center gap-2 text-[10px] text-gray-500 hover:text-black dark:hover:text-white transition-colors">
              <Mail className="w-3 h-3" /> Contact support
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto mt-12 pt-4 border-t border-border dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-[2px] text-gray-400 manrope-body opacity-60">
          © {new Date().getFullYear()} EulerFold. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
