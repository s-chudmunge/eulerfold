"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SkipForward, Loader2, CheckCircle2 } from 'lucide-react';

interface YouTubePlayerProps {
    videoId: string;
    title?: string;
    onComplete?: () => void;
    onProgress?: (progressFraction: number, currentTime: number, duration: number) => void;
    onNext?: () => void;
    isCompleted?: boolean;
}

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

export default function YouTubePlayer({ videoId, title, onComplete, onProgress, onNext, isCompleted }: YouTubePlayerProps) {
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const onCompleteRef = useRef(onComplete);
    const isCompletedRef = useRef(isCompleted);
    const [isReady, setIsReady] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [hasTriggeredComplete, setHasTriggeredComplete] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const onProgressRef = useRef(onProgress);

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        onProgressRef.current = onProgress;
    }, [onProgress]);

    useEffect(() => {
        isCompletedRef.current = isCompleted;
    }, [isCompleted]);

    const checkProgress = useCallback(() => {
        if (playerRef.current &&
            typeof playerRef.current.getCurrentTime === 'function' &&
            typeof playerRef.current.getDuration === 'function') {
            try {
                const currentTime = playerRef.current.getCurrentTime();
                const duration = playerRef.current.getDuration();
                if (duration > 0) {
                    const fraction = currentTime / duration;
                    onProgressRef.current?.(fraction, currentTime, duration);
                    if (!hasTriggeredComplete && !isCompletedRef.current && fraction > 0.9) {
                        setHasTriggeredComplete(true);
                        onCompleteRef.current?.();
                    }
                }
            } catch (e) {
                // Ignore transient iframe communication errors
            }
        }
    }, [hasTriggeredComplete]);

    const onPlayerReady = useCallback((event: any) => {
        // Always retain the API instance provided by YouTube. In some browsers
        // onReady fires before the constructor assignment below completes.
        playerRef.current = event.target;
        setIsReady(true);
        setIsLoading(false);
        checkProgress();
    }, [checkProgress]);

    const onPlayerStateChange = useCallback((event: any) => {
        // Any playing or buffered state confirms player is ready
        setIsReady(true);
        setIsLoading(false);
        checkProgress();

        // YT.PlayerState.ENDED = 0
        if (event.data === 0) {
            if (!isCompletedRef.current) {
                setHasTriggeredComplete(true);
                onCompleteRef.current?.();
            }
            setTimeLeft(12);
        }
    }, [checkProgress]);

    useEffect(() => {
        setHasTriggeredComplete(false);
        setTimeLeft(null);
        setIsLoading(true);

        const initPlayer = () => {
            if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
                playerRef.current.loadVideoById({
                    videoId: videoId,
                    startSeconds: 0
                });
                setIsReady(true);
                setIsLoading(false);
            } else if (window.YT && window.YT.Player && containerRef.current) {
                playerRef.current = new window.YT.Player(containerRef.current, {
                    videoId: videoId,
                        playerVars: {
                            autoplay: 1,
                            mute: 1,
                        rel: 0,
                        modestbranding: 1,
                        iv_load_policy: 3,
                            controls: 1,
                            enablejsapi: 1,
                            // YouTube requires an explicit origin for reliable
                            // postMessage responses from embedded players.
                            origin: window.location.origin,
                    },
                    events: {
                        onReady: onPlayerReady,
                        onStateChange: onPlayerStateChange,
                    },
                });
            }
        };

        if (!window.YT || !window.YT.Player) {
            if (!document.getElementById('youtube-iframe-api')) {
                const tag = document.createElement('script');
                tag.id = 'youtube-iframe-api';
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
            }
            
            const previousOnReady = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                if (previousOnReady) previousOnReady();
                initPlayer();
            };
        } else {
            initPlayer();
        }

        return () => {
            if (playerRef.current) {
                try {
                    if (typeof playerRef.current.pauseVideo === 'function') {
                        playerRef.current.pauseVideo();
                    }
                    if (typeof playerRef.current.stopVideo === 'function') {
                        playerRef.current.stopVideo();
                    }
                } catch (e) {}
            }
        };
    }, [videoId, onPlayerReady, onPlayerStateChange]);

    useEffect(() => {
        // Poll every 800ms for continuous progress tracking
        const interval = setInterval(checkProgress, 800);
        return () => clearInterval(interval);
    }, [checkProgress]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (timeLeft !== null && timeLeft > 0) {
            timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        } else if (timeLeft === 0) {
            onNext?.();
            setTimeLeft(null);
        }
        return () => clearTimeout(timer);
    }, [timeLeft, onNext]);

    return (
        <div className="relative w-full h-full bg-black">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f0f] z-10">
                    <Loader2 className="h-8 w-8 text-accent animate-spin opacity-50" />
                </div>
            )}
            <div className="w-full h-full">
                <div ref={containerRef} className="w-full h-full" />
            </div>
            
            {timeLeft !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-50 animate-in fade-in duration-300">
                    <div className="bg-sidebar border border-border rounded-lg shadow-2xl w-full max-w-[320px] overflow-hidden">
                        <div className="p-6 text-center">
                            <h3 className="text-[16px] font-bold text-text-heading mb-1 flex items-center justify-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                Unit Completed
                            </h3>
                            <p className="text-[13px] text-text-primary mb-6">Moving to the next lesson in {timeLeft}s</p>
                            
                            <div className="flex flex-col gap-2">
                                <button 
                                    onClick={() => {
                                        setTimeLeft(null);
                                        onNext?.();
                                    }}
                                    className="w-full bg-text-heading text-background py-2.5 rounded-lg font-bold text-[13px] hover:opacity-90 transition-all active:scale-[0.98]"
                                >
                                    Next Unit
                                </button>
                                <button 
                                    onClick={() => setTimeLeft(null)}
                                    className="w-full text-text-muted py-2 rounded-lg font-bold text-[12px] hover:text-text-heading transition-colors"
                                >
                                    Stay on this unit
                                </button>
                            </div>
                        </div>
                        
                        {/* Simple Linear Progress Bar */}
                        <div className="h-1 w-full bg-border/30">
                            <div 
                                className="h-full bg-accent transition-all duration-1000 ease-linear"
                                style={{ width: `${(timeLeft / 12) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
