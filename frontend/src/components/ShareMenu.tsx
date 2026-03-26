"use client";

import React, { useState } from 'react';
import { Share2, Copy, Twitter, Linkedin, Check } from 'lucide-react';

interface ShareMenuProps {
  title: string;
  text: string;
  url: string;
  triggerClassName?: string;
  showIcon?: boolean;
}

export default function ShareMenu({ title, text, url, triggerClassName, showIcon = true }: ShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareData = {
    title,
    text,
    url,
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
        setIsOpen(!isOpen);
      }
    } else {
      setIsOpen(!isOpen);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setIsOpen(false);
    }, 2000);
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${text} ${url}`);

  return (
    <div className="relative inline-block">
      <button 
        onClick={handleShare}
        className={triggerClassName || "whitespace-nowrap rounded-full bg-[var(--text-heading)] px-5 py-1.5 text-[var(--bg-main)] text-[12px] font-bold hover:opacity-90 transition-opacity flex items-center gap-2"}
      >
        {showIcon && <Share2 className="w-3.5 h-3.5" />} Share
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[120]" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-none shadow-2xl z-[130] animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
            <div className="p-2 space-y-1">
              <button 
                onClick={copyLink}
                className="w-full flex items-center gap-3 px-3 py-2 text-[12px] font-bold text-text-primary hover:bg-callout-bg transition-colors text-left inconsolata-ui uppercase tracking-wider"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Link'}
              </button>
              
              <a 
                href={`https://twitter.com/intent/tweet?text=${encodedText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-3 py-2 text-[12px] font-bold text-text-primary hover:bg-callout-bg transition-colors text-left inconsolata-ui uppercase tracking-wider"
                onClick={() => setIsOpen(false)}
              >
                <Twitter className="w-3.5 h-3.5" />
                X / Twitter
              </a>

              <a 
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-3 py-2 text-[12px] font-bold text-text-primary hover:bg-callout-bg transition-colors text-left inconsolata-ui uppercase tracking-wider"
                onClick={() => setIsOpen(false)}
              >
                <Linkedin className="w-3.5 h-3.5" />
                LinkedIn
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
