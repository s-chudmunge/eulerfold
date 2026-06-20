"use client";

import React from 'react';
import { Play, Pause, Square, Volume2, Loader2 } from 'lucide-react';
import { useTTS } from '@/hooks/useTTS';

interface TTSPlayerProps {
  text: string;
  title?: string;
}

export default function TTSPlayer({ text, title }: TTSPlayerProps) {
  const { isPlaying, isLoading, play, stop, settings, updateSettings } = useTTS();

  const handleToggle = () => {
    if (isPlaying) {
      stop();
    } else {
      play(text);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-5 bg-sidebar/50 border border-border rounded-lg mb-8 group transition-all hover:border-accent/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg transition-colors ${isPlaying ? 'bg-accent text-white  shadow-accent/20' : 'bg-accent/10 text-accent'}`}>
            <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-heading manrope-body">Listen to {title || 'this section'}</h4>
            <div className="flex items-center gap-2">
                <p className="text-[10px] text-text-muted inconsolata-ui uppercase tracking-widest opacity-60">Neural AI Voice</p>
                {isPlaying && <span className="w-1 h-1 rounded-full bg-accent animate-ping" />}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
          ) : (
            <div className="flex items-center gap-2">
                <button
                    onClick={handleToggle}
                    className={`p-3.5 rounded-full transition-all shadow-xl active:scale-95 ${
                        isPlaying 
                        ? 'bg-accent/10 text-accent hover:bg-accent/20' 
                        : 'bg-accent text-white hover:bg-accent/90 shadow-accent/20'
                    }`}
                    title={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>
                {isPlaying && (
                    <button
                        onClick={stop}
                        className="p-3.5 bg-error/10 text-error rounded-full hover:bg-error/20 transition-all active:scale-95"
                        title="Stop"
                    >
                        <Square className="w-5 h-5 fill-current" />
                    </button>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Speed Selector */}
      <div className="flex items-center gap-4 pt-4 border-t border-border/40">
        <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Playback Speed</span>
                <span className="text-[10px] font-bold text-accent">{settings.rate.toFixed(1)}x</span>
            </div>
            <input 
                type="range" min="0.5" max="2.5" step="0.1" 
                value={settings.rate} 
                onChange={(e) => updateSettings({ rate: parseFloat(e.target.value) })} 
                className="w-full h-1 bg-accent/10 rounded-lg appearance-none cursor-pointer accent-accent" 
            />
        </div>
        <div className="w-32">
            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-2">Voice</span>
            <select 
                value={settings.voice} 
                onChange={(e) => updateSettings({ voice: e.target.value })} 
                className="w-full bg-background border border-border/60 rounded-lg py-1 px-2 text-[10px] font-bold text-text-primary focus:ring-1 focus:ring-accent outline-none"
            >
                <option value="en-US-AndrewNeural">Andrew</option>
                <option value="en-US-AvaNeural">Ava</option>
                <option value="en-GB-SoniaNeural">Sonia</option>
            </select>
        </div>
      </div>
    </div>
  );
}
