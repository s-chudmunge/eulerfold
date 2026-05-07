"use client";

import React from 'react';
import { Play, Pause, Square, Volume2, Loader2 } from 'lucide-react';
import { useTTS } from '@/hooks/useTTS';

interface TTSListenButtonProps {
  text: string;
  className?: string;
  label?: string;
  variant?: 'minimal' | 'full';
}

export default function TTSListenButton({ text, className = "", label = "Listen", variant = 'minimal' }: TTSListenButtonProps) {
  const { isPlaying, isLoading, play, stop } = useTTS();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPlaying) {
      stop();
    } else {
      play(text);
    }
  };

  if (variant === 'full') {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/5 border border-accent/20 hover:bg-accent/10 transition-all group ${className}`}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-3.5 h-3.5 text-accent fill-accent group-hover:scale-110 transition-transform" />
        ) : (
          <Play className="w-3.5 h-3.5 text-accent fill-accent group-hover:scale-110 transition-transform ml-0.5" />
        )}
        <span className="text-[10px] font-black text-accent uppercase tracking-widest inconsolata-ui">
          {isPlaying ? 'Stop' : label}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      title={isPlaying ? "Stop listening" : `Listen to ${label}`}
      className={`inline-flex items-center justify-center p-1.5 rounded-md hover:bg-accent/10 transition-colors group ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />
      ) : isPlaying ? (
        <div className="relative">
          <Square className="w-3.5 h-3.5 text-error fill-error animate-pulse" />
        </div>
      ) : (
        <Volume2 className="w-3.5 h-3.5 text-accent group-hover:scale-110 transition-transform" />
      )}
    </button>
  );
}
