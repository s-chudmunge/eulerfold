"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Square, Volume2, Loader2, Settings2, X, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useTTS } from '@/hooks/useTTS';

export default function FloatingTTS({ content: manualContent }: { content?: string }) {
  const pathname = usePathname();
  const [showSettings, setShowSettings] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  
  const { isPlaying, isLoading, play, stop, updateSettings, settings } = useTTS();

  const isAllowedPath = pathname?.startsWith('/articles') || pathname?.startsWith('/research-decoded');

  const handlePlay = async () => {
    let textToPlay = selectedText;
    
    // 1. Prioritize manual content prop (e.g. from Article page)
    if (!textToPlay && manualContent) {
      textToPlay = manualContent;
    }
    
    // 2. Fallback to DOM scraping
    if (!textToPlay) {
      const selectors = ['.prose-eulerfold', '.page-content', 'article', 'main'];
      const blocks: HTMLElement[] = [];
      
      selectors.forEach(s => {
        document.querySelectorAll(s).forEach(el => {
          if (el instanceof HTMLElement) blocks.push(el);
        });
      });

      if (blocks.length > 0) {
        textToPlay = blocks.map(block => {
          const clone = block.cloneNode(true) as HTMLElement;
          // Remove non-textual or noisy elements
          ['pre', 'code', '.katex', '.math', '.d2-diagram', 'nav', 'footer', 'button', '.no-tts'].forEach(s => {
              clone.querySelectorAll(s).forEach(el => el.remove());
          });
          
          // Add a period after all headings to force a pause in TTS
          clone.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
            el.innerHTML = el.innerHTML.trim() + '. ';
          });

          return clone.innerText;
        }).join('\n\n');
      }
    }

    if (textToPlay) {
      await play(textToPlay);
    }
  };

  const handleTextSelection = useCallback(() => {
    const text = window.getSelection()?.toString().trim();
    if (text && text.length > 5) {
      setSelectedText(text);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelection);
    return () => document.removeEventListener('mouseup', handleTextSelection);
  }, [handleTextSelection]);

  if (!isAllowedPath) return null;

  return (
    <div className="fixed z-[9999] bottom-14 right-12 flex flex-col items-end gap-2">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="pill" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsExpanded(true)}
            className="bg-accent text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 hover:scale-105 transition-all border border-accent/20"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span className="text-[11px] font-black uppercase tracking-widest">Listen</span>
          </motion.button>
        ) : (
          <motion.div
            key="player" drag dragMomentum={false} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-sidebar/95 backdrop-blur-md border border-accent/20 rounded-2xl shadow-2xl flex flex-col w-[175px] overflow-hidden cursor-grab active:cursor-grabbing"
          >
            <div className="p-2.5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 bg-accent/5 px-2 py-1.5 rounded-xl border border-accent/10">
                  <Volume2 className={`w-3.5 h-3.5 text-accent ${isPlaying ? "animate-pulse" : ""}`} />
                  <span className="text-[10px] font-black text-accent tracking-tighter">{settings.rate.toFixed(1)}x</span>
                </div>

                <div className="flex items-center gap-0.5">
                  <button onClick={() => setShowSettings(!showSettings)} className={`p-1.5 rounded-lg transition-colors ${showSettings ? "bg-accent text-white shadow-lg" : "hover:bg-accent/10 text-text-muted"}`}>
                    <Settings2 className="w-3.5 h-3.5" />
                  </button>
                  
                  {isLoading ? (
                    <div className="p-1.5"><Loader2 className="w-4 h-4 text-accent animate-spin" /></div>
                  ) : (
                    <div className="flex items-center gap-0.5">
                      <button onClick={handlePlay} className="p-1.5 bg-accent text-white rounded-lg hover:scale-110 active:scale-95 transition-all shadow-md shadow-accent/20">
                        {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                      </button>
                      {(isPlaying || selectedText) ? (
                        <button onClick={() => { stop(); setSelectedText(""); }} className="p-1.5 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-all">
                          <Square className="w-3.5 h-3.5 fill-current" />
                        </button>
                      ) : (
                        <button onClick={() => setIsExpanded(false)} className="p-1.5 hover:bg-error/10 text-text-muted hover:text-error transition-colors rounded-lg"><X className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {showSettings && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="flex flex-col gap-3 border-t border-accent/10 pt-3 overflow-hidden">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[8px] font-black text-text-muted uppercase tracking-wider">
                        <span>Speed</span>
                        <span className="text-accent">{settings.rate.toFixed(1)}x</span>
                      </div>
                      <input 
                        type="range" min="0.5" max="2.5" step="0.1" 
                        value={settings.rate} 
                        onChange={(e) => updateSettings({ rate: parseFloat(e.target.value) })} 
                        className="w-full h-1 bg-accent/10 rounded-lg appearance-none cursor-pointer accent-accent" 
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[8px] font-black text-text-muted uppercase tracking-wider">Voice Profile</label>
                      <select 
                        value={settings.voice} 
                        onChange={(e) => updateSettings({ voice: e.target.value })} 
                        className="w-full bg-background border border-accent/10 rounded-lg py-1 px-1.5 text-[9px] font-bold text-text-primary focus:ring-1 focus:ring-accent outline-none"
                      >
                        <option value="en-US-AndrewNeural">Andrew (M)</option>
                        <option value="en-US-AvaNeural">Ava (F)</option>
                        <option value="en-GB-SoniaNeural">Sonia (UK)</option>
                        <option value="pt-BR-AntonioNeural">Antonio (BR)</option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
