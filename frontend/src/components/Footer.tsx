'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Youtube, Instagram } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';

export default function Footer() {
  return (
    <footer className="w-full px-6 py-16 border-t border-border ">
      <div className="max-w-5xl mx-auto flex flex-col">
        {/* Top row: Logo + tagline (left) and Socials (right) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div className="flex flex-col items-start gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="/apple-touch-icon.png" alt="EulerFold" className="w-6 h-6 grayscale opacity-80 dark:invert" />
              <span className="font-bold text-[22px] tracking-tight text-text-heading leading-none">eulerfold</span>
            </Link>
            <p className="text-[15px] text-text-heading mt-1">
              Your personal curriculum for the AI era
            </p>
          </div>
          
          <div className="flex items-center gap-5">
            <a href="mailto:eulerfold@gmail.com" className="text-text-heading hover:opacity-60 transition-opacity">
              <Mail className="w-4 h-4" />
            </a>
            <a href="https://x.com/eulerfold" target="_blank" rel="noopener noreferrer" className="text-text-heading hover:opacity-60 transition-opacity">
              <FaXTwitter className="w-4 h-4" />
            </a>
            <a href="https://www.instagram.com/eulerfold" target="_blank" rel="noopener noreferrer" className="text-text-heading hover:opacity-60 transition-opacity">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://www.youtube.com/@eulerfold" target="_blank" rel="noopener noreferrer" className="text-text-heading hover:opacity-60 transition-opacity">
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Links row */}
        <div className="flex flex-wrap items-center gap-5 mb-8">
          <Link href="/privacy" className="text-[14px] text-text-heading hover:text-text-muted transition-colors underline underline-offset-[5px] decoration-text-muted/40 hover:decoration-text-muted">Privacy policy</Link>
          <Link href="/terms" className="text-[14px] text-text-heading hover:text-text-muted transition-colors underline underline-offset-[5px] decoration-text-muted/40 hover:decoration-text-muted">Terms of service</Link>
          <Link href="/about" className="text-[14px] text-text-heading hover:text-text-muted transition-colors underline underline-offset-[5px] decoration-text-muted/40 hover:decoration-text-muted">About us</Link>
          <a href="mailto:eulerfold@gmail.com" className="text-[14px] text-text-heading hover:text-text-muted transition-colors underline underline-offset-[5px] decoration-text-muted/40 hover:decoration-text-muted">Contact us</a>
        </div>

        {/* Copyright */}
        <p className="text-[14px] text-text-muted">
          © {new Date().getFullYear()} EulerFold. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
