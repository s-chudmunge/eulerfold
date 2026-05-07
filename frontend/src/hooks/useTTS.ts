"use client";

import { useState, useRef, useCallback, useEffect } from 'react';

export interface TTSSettings {
  rate: number;
  voice: string;
}

export function useTTS(initialSettings: TTSSettings = { rate: 1.0, voice: "en-US-AndrewNeural" }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<TTSSettings>(initialSettings);
  
  // High-performance refs for gapless control
  const audio1 = useRef<HTMLAudioElement | null>(null);
  const audio2 = useRef<HTMLAudioElement | null>(null);
  const activeRef = useRef<1 | 2>(1);
  const chunksRef = useRef<string[]>([]);
  const currentIndexRef = useRef<number>(0);

  // Initialize audio elements once on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const a1 = new Audio();
      const a2 = new Audio();
      audio1.current = a1;
      audio2.current = a2;
      
      return () => {
        a1.pause(); a1.src = "";
        a2.pause(); a2.src = "";
      };
    }
  }, []);

  const cleanText = (rawText: string) => {
    if (typeof rawText !== 'string') return "";
    return rawText
      .replace(/(#{1,6}\s+)([^\n]+)/g, '$2. ') // Headings
      .replace(/\$\$[\s\S]*?\$\$/g, ' [Equation]. ') // Remove display math blocks
      .replace(/\$([^$]+)\$/g, (match, p1) => {
          // If it contains \text{...}, extract the text
          const textMatch = p1.match(/\\text\{([^}]+)\}/);
          if (textMatch) return textMatch[1];
          // If it's very long/complex, just call it a formula
          if (p1.length > 20 || p1.includes('\\') || p1.includes('_') || p1.includes('^')) return "[formula]";
          return p1; // Keep simple variables
      })
      .replace(/\\\[[\s\S]*?\\\]/g, ' [Equation]. ') // LaTeX display math
      .replace(/\\\( [\s\S]*? \\\)/g, '[formula]') // LaTeX inline math
      .replace(/\*\*/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/`{1,3}[^`]*`{1,3}/g, '')
      .replace(/\n\s*\n/g, '.\n') 
      .trim();
  };

  const generateUrl = useCallback((text: string, v: string, r: number) => {
    if (!text || text.length < 1) return "";
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
    const rateVal = Math.round((r - 1.0) * 100);
    const rateParam = rateVal >= 0 ? `+${rateVal}%` : `${rateVal}%`;
    return `${backendUrl}/tts/stream?text=${encodeURIComponent(text)}&voice=${v}&rate=${encodeURIComponent(rateParam)}`;
  }, []);

  const stop = useCallback(() => {
    if (audio1.current) { audio1.current.pause(); audio1.current.src = ""; }
    if (audio2.current) { audio2.current.pause(); audio2.current.src = ""; }
    setIsPlaying(false);
    setIsLoading(false);
    currentIndexRef.current = 0;
    chunksRef.current = [];
    activeRef.current = 1;
  }, []);

  const playNext = useCallback(() => {
    const nextIdx = currentIndexRef.current + 1;
    
    if (nextIdx >= chunksRef.current.length) {
        stop();
        return;
    }

    currentIndexRef.current = nextIdx;
    
    const current = activeRef.current === 1 ? audio1.current : audio2.current;
    const next = activeRef.current === 1 ? audio2.current : audio1.current;
    
    if (next && next.src) {
        next.play().catch(e => {
            console.error("TTS playback failed:", e);
            stop();
        });
        activeRef.current = activeRef.current === 1 ? 2 : 1;
        
        const followingIdx = nextIdx + 1;
        if (followingIdx < chunksRef.current.length && current) {
            current.src = generateUrl(chunksRef.current[followingIdx], settings.voice, settings.rate);
            current.load();
        }
    } else {
        stop();
    }
  }, [generateUrl, settings, stop]);

  // Sync event listeners to avoid stale closures
  useEffect(() => {
    if (audio1.current) audio1.current.onended = playNext;
    if (audio2.current) audio2.current.onended = playNext;
  }, [playNext]);

  const splitIntoSmartChunks = (text: string) => {
    const rawParagraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
    const superChunks: string[] = [];
    let currentBuffer = "";
    
    rawParagraphs.forEach(p => {
        const trimmed = p.trim();
        if ((currentBuffer.length + trimmed.length) < 800) {
            currentBuffer += (currentBuffer ? " " : "") + trimmed;
        } else {
            if (currentBuffer) superChunks.push(currentBuffer);
            if (trimmed.length > 800) {
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

  const play = async (text: string) => {
    if (!audio1.current || !audio2.current) return;

    if (isPlaying) {
      const active = activeRef.current === 1 ? audio1.current : audio2.current;
      active?.pause();
      setIsPlaying(false);
      return;
    }

    const active = activeRef.current === 1 ? audio1.current : audio2.current;
    // Resume if we have an active src and it's not finished
    if (active && active.src && active.src !== "" && !active.ended && active.readyState >= 2) {
      try {
        await active.play();
        setIsPlaying(true);
        return;
      } catch (e) {
        console.error("Failed to resume:", e);
      }
    }

    try {
      setIsLoading(true);
      const cleanedText = cleanText(text);
      if (!cleanedText || cleanedText.length < 2) {
        setIsLoading(false);
        return;
      }
      
      const newChunks = splitIntoSmartChunks(cleanedText);
      if (newChunks.length === 0) {
        setIsLoading(false);
        return;
      }
      
      // Full reset before new content
      stop();
      setIsLoading(true); // stop() clears it
      
      chunksRef.current = newChunks;
      currentIndexRef.current = 0;
      activeRef.current = 1;
      
      audio1.current.src = generateUrl(newChunks[0], settings.voice, settings.rate);
      audio1.current.load();
      
      if (newChunks[1]) {
        audio2.current.src = generateUrl(newChunks[1], settings.voice, settings.rate);
        audio2.current.load();
      }
      
      await audio1.current.play();
      setIsPlaying(true);
    } catch (e) {
      console.error("TTS Play Error:", e);
      stop();
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = (newSettings: Partial<TTSSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    stop(); 
  };

  return {
    isPlaying,
    isLoading,
    settings,
    play,
    stop,
    updateSettings
  };
}
