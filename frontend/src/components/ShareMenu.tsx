"use client";

import React, { useState } from 'react';
import { Share2, Copy, Linkedin, Check } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';

interface ShareMenuProps {
  title: string;
  text?: string;
  url?: string;
  slug?: string;
  triggerClassName?: string;
  showIcon?: boolean;
  type?: 'roadmap' | 'project';
}

export default function ShareMenu({ 
  title, 
  text = "Check this out on EulerFold:", 
  url, 
  slug,
  triggerClassName, 
  showIcon = true,
  type = 'roadmap'
}: ShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const finalUrl = url || (slug 
    ? `${window.location.origin}/${type}/${slug}`
    : typeof window !== 'undefined' ? window.location.href : '');

  const shareData = {
    title,
    text,
    url: finalUrl,
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
    navigator.clipboard.writeText(finalUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setIsOpen(false);
    }, 2000);
  };

  const encodedUrl = encodeURIComponent(finalUrl);
  const encodedText = encodeURIComponent(`${text} ${finalUrl}`);

  return (
    <div className="relative inline-block">
      <button 
        onClick={handleShare}
        className={triggerClassName || "whitespace-nowrap rounded-none bg-text-heading px-5 py-1.5 text-background text-[12px] font-bold hover:opacity-90 transition-opacity flex items-center gap-2"}
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
                className="w-full flex items-center gap-3 px-3 py-2 text-[11px] font-bold text-text-primary hover:bg-callout-bg transition-colors text-left inconsolata-ui uppercase tracking-wider"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Link'}
              </button>
              
              <div className="grid grid-cols-2 gap-1 pt-1 mt-1 border-t border-border">
                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodedText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-3 py-2 text-[10px] font-bold text-text-primary hover:bg-callout-bg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <FaXTwitter className="w-3.5 h-3.5" />
                  X
                </a>

                <a 
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-3 py-2 text-[10px] font-bold text-text-primary hover:bg-callout-bg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  LI
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
