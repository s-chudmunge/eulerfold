"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, CheckCircle2, Sparkles } from 'lucide-react';

interface YouTubePlayerProps {
    videoId: string;
    title?: string;
    onComplete?: () => void;
    onProgress?: (progressFraction: number, currentTime: number, duration: number) => void;
    onNext?: () => void;
    isCompleted?: boolean;
    isPro?: boolean;
    onTakeCheckpoint?: () => void;
}

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

export default function YouTubePlayer({ 
    videoId, 
    title, 
    onComplete, 
    onProgress, 
    onNext, 
    isCompleted,
    isPro = false,
    onTakeCheckpoint
}: YouTubePlayerProps) {
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const onCompleteRef = useRef(onComplete);
    const isCompletedRef = useRef(isCompleted);
    const isProRef = useRef(isPro);
    const [isReady, setIsReady] = useState(false);
    const [showEndedOverlay, setShowEndedOverlay] = useState(false);
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

    useEffect(() => {
        isProRef.current = isPro;
    }, [isPro]);

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
                    // For Free users, auto-complete at >90% progress.
                    // For Pro users, topic completion requires passing the Concept Check.
                    if (!hasTriggeredComplete && !isCompletedRef.current && !isProRef.current && fraction > 0.9) {
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
            if (!isCompletedRef.current && !isProRef.current) {
                setHasTriggeredComplete(true);
                onCompleteRef.current?.();
            }
            setShowEndedOverlay(true);
        }
    }, [checkProgress]);

    useEffect(() => {
        setHasTriggeredComplete(false);
        setShowEndedOverlay(false);
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
            
            {showEndedOverlay && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50 animate-in fade-in duration-300 p-4">
                    <div className="bg-sidebar border border-border rounded-md shadow-lg w-full max-w-[340px] overflow-hidden">
                        <div className="p-6 text-center">
                            {isPro && !isCompleted ? (
                                <>
                                    <div className="w-10 h-10 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mx-auto mb-3">
                                        <Sparkles className="h-5 w-5 text-amber-400" />
                                    </div>
                                    <h3 className="text-[15px] font-bold text-text-heading mb-1.5">
                                        Video Finished
                                    </h3>
                                    <p className="text-[12.5px] text-text-muted leading-relaxed mb-5">
                                        Complete the Concept Check below to lock in your progress and earn your EulerCoin.
                                    </p>
                                    <div className="flex flex-col gap-2">
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setShowEndedOverlay(false);
                                                if (onTakeCheckpoint) {
                                                    onTakeCheckpoint();
                                                } else {
                                                    document.getElementById('topic-checkpoint')?.scrollIntoView({ behavior: 'smooth' });
                                                }
                                            }}
                                            className="w-full bg-accent text-background py-2.5 rounded-md font-bold text-[12px] hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                                        >
                                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                            <span>Go to Concept Check</span>
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setShowEndedOverlay(false)}
                                            className="w-full text-text-muted py-2 rounded-md font-bold text-[12px] hover:text-text-heading transition-colors cursor-pointer"
                                        >
                                            Stay on Video
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto mb-3">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-[15px] font-bold text-text-heading mb-1.5">
                                        Topic Completed
                                    </h3>
                                    <p className="text-[12.5px] text-text-muted leading-relaxed mb-5">
                                        Nicely done! Ready to move to the next lesson?
                                    </p>
                                    <div className="flex flex-col gap-2">
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setShowEndedOverlay(false);
                                                onNext?.();
                                            }}
                                            className="w-full bg-text-heading text-background py-2.5 rounded-md font-bold text-[12px] hover:opacity-90 transition-all active:scale-[0.98] shadow-xs cursor-pointer"
                                        >
                                            Next Lesson
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setShowEndedOverlay(false)}
                                            className="w-full text-text-muted py-2 rounded-md font-bold text-[12px] hover:text-text-heading transition-colors cursor-pointer"
                                        >
                                            Stay on this Lesson
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
