'use client';

import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Loader, 
  Menu, 
  ExternalLink 
} from 'lucide-react';
import YouTubePlayer from '@/components/roadmap/YouTubePlayer';
import { GoldfishIcon } from '@/components/goldfish/GoldfishAssistant';

interface VideoReferenceAreaProps {
  activeVideoId: string | null;
  currentTopic: any;
  isTopicCompleted: boolean;
  isUpdatingProgress: boolean;
  activeTopicResources: any[];
  resourceCardIdx: number;
  setResourceCardIdx: React.Dispatch<React.SetStateAction<number>>;
  onMarkAsCompleted: () => void;
  onNext: () => void;
  onOpenGoldfishVideo: () => void;
  onVideoProgress?: (progressFraction: number, currentTime: number, duration: number) => void;
}

export default function VideoReferenceArea({
  activeVideoId,
  currentTopic,
  isTopicCompleted,
  isUpdatingProgress,
  activeTopicResources,
  resourceCardIdx,
  setResourceCardIdx,
  onMarkAsCompleted,
  onNext,
  onOpenGoldfishVideo,
  onVideoProgress
}: VideoReferenceAreaProps) {
  return (
    <div className="bg-image-bg border border-border rounded-md overflow-hidden shadow-xs mb-8">
      <div className={`w-full relative group ${activeVideoId ? 'aspect-video bg-black' : 'min-h-[340px] md:aspect-video bg-sidebar'}`}>
        {activeVideoId ? (
          <YouTubePlayer
            key={activeVideoId}
            videoId={activeVideoId}
            title={currentTopic.youtube_video_title || currentTopic.title}
            onComplete={onMarkAsCompleted}
            onNext={onNext}
            isCompleted={isTopicCompleted}
            onProgress={onVideoProgress}
          />
        ) : (
          <div className="w-full h-full bg-sidebar border border-border flex flex-col justify-between p-4 sm:p-6 relative group">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div>
                <span className="text-[11px] font-bold text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  Recommended References
                </span>
                <p className="text-[12px] text-text-muted mt-1.5 font-medium">
                  No video available for this topic. Explore these curated study references:
                </p>
              </div>
              {activeTopicResources.length > 1 && (
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-[11px] font-bold text-text-muted bg-background px-2.5 py-1 rounded-md border border-border font-mono">
                    {resourceCardIdx + 1} / {activeTopicResources.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setResourceCardIdx(prev => (prev - 1 + activeTopicResources.length) % activeTopicResources.length)}
                      title="Previous Reference"
                      className="p-1.5 rounded-md border border-border bg-background text-text-muted hover:text-text-primary transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setResourceCardIdx(prev => (prev + 1) % activeTopicResources.length)}
                      title="Next Reference"
                      className="p-1.5 rounded-md border border-border bg-background text-text-muted hover:text-text-primary transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Reference Card */}
            {activeTopicResources.length > 0 ? (
              <div className="my-auto py-3 flex items-center gap-3">
                <div className="flex-1 w-full">
                  {(() => {
                    const res = activeTopicResources[resourceCardIdx % activeTopicResources.length];
                    const urlStr = res.url || res.link || "#";
                    let domain = "External Reference";
                    try {
                      if (urlStr !== "#") domain = new URL(urlStr).hostname.replace(/^www\./, "");
                    } catch {}
                    const rawImg = res.image || res.featured_image || res.thumbnail || res.og_image || res.img || res.cover_image;
                    const featImg = rawImg || (urlStr && urlStr !== "#" ? `https://api.microlink.io/?url=${encodeURIComponent(urlStr)}&embed=image.url` : null);
                    const faviconUrl = domain !== "External Reference" ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null;

                    return (
                      <div className="bg-background border border-border rounded-md p-4 sm:p-6 shadow-xs hover:border-accent/60 transition-all flex flex-col justify-between min-h-[180px] gap-4">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                          {featImg && (
                            <div className="w-full md:w-44 h-32 shrink-0 rounded-md border border-border overflow-hidden bg-sidebar relative">
                              <img
                                src={featImg}
                                alt={res.title || "Reference image"}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <div className="space-y-2 flex-1 w-full">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-bold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                {res.type || "Article"}
                              </span>
                              <span className="text-[11px] font-mono text-text-muted flex items-center gap-1.5">
                                {faviconUrl && (
                                  <img src={faviconUrl} alt="" className="w-3.5 h-3.5" />
                                )}
                                {domain}
                              </span>
                            </div>
                            <h4 className="text-[15px] font-bold text-text-heading leading-snug">
                              {res.title || "Reference Material"}
                            </h4>
                            {res.snippet && (
                              <p className="text-[12px] text-text-muted line-clamp-2">
                                {res.snippet}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-border flex items-center justify-between">
                          <a
                            href={urlStr}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-background rounded-md text-[11px] font-bold hover:opacity-90 transition-opacity"
                          >
                            <span>Open Reference</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="my-auto text-center py-6 text-text-muted">
                <p className="text-[13px] font-semibold text-text-heading mb-1">
                  No Direct Video Attached
                </p>
                <p className="text-[11px] text-text-muted max-w-sm mx-auto">
                  Use Goldfish to find a verified lecture or scout reading materials.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-3 border-t border-border bg-sidebar flex items-center justify-end flex-wrap gap-2">

        <button
          onClick={onMarkAsCompleted}
          disabled={isUpdatingProgress}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md font-bold text-[11px] transition-all ${
            isTopicCompleted
              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
              : 'bg-text-heading text-background hover:opacity-90 active:scale-98'
          }`}
        >
          {isUpdatingProgress ? (
            <Loader className="h-3.5 w-3.5 animate-spin" />
          ) : isTopicCompleted ? (
            <><Check className="h-3.5 w-3.5" /> Mastered</>
          ) : (
            "Mark as Mastered"
          )}
        </button>
      </div>
    </div>
  );
}
