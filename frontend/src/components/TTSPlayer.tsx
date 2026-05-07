"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, Volume2, Loader2 } from 'lucide-react';

interface TTSPlayerProps {
  text: string;
  title?: string;
}

export default function TTSPlayer({ text, title }: TTSPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const cleanText = (rawText: string) => {
    // Remove markdown symbols for better TTS quality
    return rawText
      .replace(/#{1,6}\s/g, '') // Headers
      .replace(/\*\*/g, '')      // Bold
      .replace(/\*/g, '')       // Italic
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Links
      .replace(/`{1,3}[^`]*`{1,3}/g, '') // Code blocks
      .replace(/\n+/g, ' ')      // Newlines to spaces
      .trim();
  };

  const handlePlay = async () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    try {
      setIsLoading(true);
      const cleanedText = cleanText(text);
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const url = `${backendUrl}/tts/stream?text=${encodeURIComponent(cleanedText.substring(0, 4000))}`; // Limit to 4000 chars for safety
      
      setAudioUrl(url);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error starting TTS:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <div className="flex flex-col gap-2 p-4 bg-sidebar/50 border border-border rounded-xl mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-accent/10 rounded-lg text-accent">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-heading manrope-body">Listen to {title || 'this article'}</h4>
            <p className="text-[11px] text-text-muted inconsolata-ui uppercase tracking-wider">AI Generated Neural Voice</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          ) : !isPlaying ? (
            <button
              onClick={handlePlay}
              className="p-3 bg-accent text-white rounded-full hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
              title="Play"
            >
              <Play className="w-5 h-5 fill-current" />
            </button>
          ) : (
            <>
              <button
                onClick={handlePause}
                className="p-3 bg-accent/10 text-accent rounded-full hover:bg-accent/20 transition-all"
                title="Pause"
              >
                <Pause className="w-5 h-5 fill-current" />
              </button>
              <button
                onClick={handleStop}
                className="p-3 bg-error/10 text-error rounded-full hover:bg-error/20 transition-all"
                title="Stop"
              >
                <Square className="w-5 h-5 fill-current" />
              </button>
            </>
          )}
        </div>
      </div>

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="hidden"
          autoPlay
        />
      )}
    </div>
  );
}
