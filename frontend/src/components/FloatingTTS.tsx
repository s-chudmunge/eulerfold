"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Square, Volume2, Loader2, Settings2, X, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function FloatingTTS({ content: manualContent }: { content?: string }) {
  const pathname = usePathname();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [voice, setVoice] = useState("en-US-AndrewNeural");
  const [selectedText, setSelectedText] = useState("");
  
  // High-performance refs for gapless control
  const audio1 = useRef<HTMLAudioElement | null>(null);
  const audio2 = useRef<HTMLAudioElement | null>(null);
  const activeRef = useRef<1 | 2>(1);
  const chunksRef = useRef<string[]>([]);
  const currentIndexRef = useRef<number>(0);
  const [activeBuffer, setActiveBuffer] = useState<1 | 2>(1);

  const isAllowedPath = pathname?.startsWith('/articles') || pathname?.startsWith('/research-decoded');

  const cleanText = (rawText: string) => {
    return rawText
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/`{1,3}[^`]*`{1,3}/g, '')
      .replace(/\\\[[\s\S]*?\\\]/g, '')
      .replace(/\\\( [\s\S]*? \\\)/g, '')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  };

  const generateUrl = useCallback((text: string, v: string, r: number) => {
    if (!text || text.length < 1) return "";
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
    const rateVal = Math.round((r - 1.0) * 100);
    const rateParam = rateVal >= 0 ? `+${rateVal}%` : `${rateVal}%`;
    return `${backendUrl}/tts/stream?text=${encodeURIComponent(text)}&voice=${v}&rate=${encodeURIComponent(rateParam)}`;
  }, []);

  const splitIntoSmartChunks = (text: string) => {
    const rawParagraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
    const superChunks: string[] = [];
    let currentBuffer = "";
    
    // Merge short paragraphs/headers to prevent "staccato" reading
    rawParagraphs.forEach(p => {
        const trimmed = p.trim();
        if ((currentBuffer.length + trimmed.length) < 800) {
            currentBuffer += (currentBuffer ? " " : "") + trimmed;
        } else {
            if (currentBuffer) superChunks.push(currentBuffer);
            if (trimmed.length > 800) {
                // Split very long paragraphs by sentences
                const sentences = trimmed.match(/[^.!?]+[.!?]+/g) || [trimmed];
                let subBuffer = "";
                sentences.forEach(s => {
                    if ((subBuffer.length + s.length) > 800) {
                        superChunks.push(subBuffer.trim());
                        subBuffer = s;
                    } else subBuffer += s;
                });
                currentBuffer = subBuffer;
            } else {
                currentBuffer = trimmed;
            }
        }
    });
    if (currentBuffer) superChunks.push(currentBuffer);
    return superChunks.filter(c => c.length > 2);
  };

  const handleStop = useCallback(() => {
    [audio1, audio2].forEach(ref => {
      if (ref.current) {
        ref.current.pause();
        ref.current.src = "";
        ref.current.load();
      }
    });
    setIsPlaying(false);
    currentIndexRef.current = 0;
    chunksRef.current = [];
    activeRef.current = 1;
    setActiveBuffer(1);
  }, []);

  const playNext = useCallback(() => {
    const nextIdx = currentIndexRef.current + 1;
    
    if (nextIdx >= chunksRef.current.length) {
        handleStop();
        return;
    }

    currentIndexRef.current = nextIdx;
    
    // Swap buffers: play the one that was preloading
    const current = activeRef.current === 1 ? audio1.current : audio2.current;
    const next = activeRef.current === 1 ? audio2.current : audio1.current;
    
    if (next && next.src) {
        next.play().catch(e => console.error("Ping-pong failed:", e));
        activeRef.current = activeRef.current === 1 ? 2 : 1;
        setActiveBuffer(activeRef.current);
        
        // Preload the following chunk into the now-available buffer
        const followingIdx = nextIdx + 1;
        if (followingIdx < chunksRef.current.length && current) {
            current.src = generateUrl(chunksRef.current[followingIdx], voice, rate);
            current.load();
        }
    } else {
        handleStop();
    }
  }, [generateUrl, voice, rate, handleStop]);

  const handlePlay = async () => {
    if (isPlaying) {
      const active = activeRef.current === 1 ? audio1.current : audio2.current;
      active?.pause();
      setIsPlaying(false);
      return;
    }

    // Resume if paused
    const active = activeRef.current === 1 ? audio1.current : audio2.current;
    if (active && active.src && active.readyState >= 2) {
      active.play();
      setIsPlaying(true);
      return;
    }

    try {
      setIsLoading(true);
      
      let text = selectedText;
      
      // 1. Prioritize manual content prop (the "smart" way)
      if (!text && manualContent) {
        text = manualContent;
      }
      
      // 2. Fallback to DOM scraping if no manual content
      if (!text) {
        const selectors = ['.prose-eulerfold', '.page-content', 'article', 'main'];
        const blocks: HTMLElement[] = [];
        
        selectors.forEach(s => {
          document.querySelectorAll(s).forEach(el => {
            if (el instanceof HTMLElement) blocks.push(el);
          });
        });

        if (blocks.length > 0) {
          text = blocks.map(block => {
            const clone = block.cloneNode(true) as HTMLElement;
            // Remove non-textual or noisy elements
            ['pre', 'code', '.katex', '.math', '.d2-diagram', 'nav', 'footer', 'button', '.no-tts'].forEach(s => {
                clone.querySelectorAll(s).forEach(el => el.remove());
            });
            return clone.innerText;
          }).join('\n\n');
        }
      }

      if (!text || text.length < 5) return;
      
      const newChunks = splitIntoSmartChunks(cleanText(text));
      if (newChunks.length === 0) return;
      
      handleStop(); // Reset first
      chunksRef.current = newChunks;
      
      // Initialize both buffers
      if (audio1.current) {
        audio1.current.src = generateUrl(newChunks[0], voice, rate);
        audio1.current.load();
      }
      if (audio2.current && newChunks[1]) {
        audio2.current.src = generateUrl(newChunks[1], voice, rate);
        audio2.current.load();
      }
      
      // Kick off playback
      audio1.current?.play();
      setIsPlaying(true);
      activeRef.current = 1;
      setActiveBuffer(1);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSelection = useCallback(() => {
    const text = window.getSelection()?.toString().trim();
    if (text && text.length > 5) {
      handleStop();
      setSelectedText(text);
      setIsExpanded(true);
    }
  }, [handleStop]);

  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelection);
    return () => document.removeEventListener('mouseup', handleTextSelection);
  }, [handleTextSelection]);

  if (!isAllowedPath) return null;

  return (
    <div className="fixed z-[9999] bottom-6 right-6 flex flex-col items-end gap-2">
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
                  <span className="text-[10px] font-black text-accent tracking-tighter">{rate.toFixed(1)}x</span>
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
                      {(isPlaying || currentIndexRef.current > 0) ? (
                        <button onClick={handleStop} className="p-1.5 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-all">
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
                        <span className="text-accent">{rate.toFixed(1)}x</span>
                      </div>
                      <input type="range" min="0.5" max="2.5" step="0.1" value={rate} onChange={(e) => { setRate(parseFloat(e.target.value)); handleStop(); }} className="w-full h-1 bg-accent/10 rounded-lg appearance-none cursor-pointer accent-accent" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[8px] font-black text-text-muted uppercase tracking-wider">Voice Profile</label>
                      <select value={voice} onChange={(e) => { setVoice(e.target.value); handleStop(); }} className="w-full bg-background border border-accent/10 rounded-lg py-1 px-1.5 text-[9px] font-bold text-text-primary focus:ring-1 focus:ring-accent outline-none">
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

      <audio ref={audio1} onEnded={playNext} className="hidden" />
      <audio ref={audio2} onEnded={playNext} className="hidden" />
    </div>
  );
}
