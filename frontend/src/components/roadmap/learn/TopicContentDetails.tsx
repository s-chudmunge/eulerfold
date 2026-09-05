'use client';

import React from 'react';
import { FileText, ExternalLink, Plus } from 'lucide-react';
import { GoldfishIcon } from '@/components/goldfish/GoldfishAssistant';

interface TopicContentDetailsProps {
  currentTopic: any;
  currentModule: any;
  onOpenGoldfishReading: () => void;
}

export default function TopicContentDetails({
  currentTopic,
  currentModule,
  onOpenGoldfishReading
}: TopicContentDetailsProps) {
  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-text-heading tracking-tight">
        {currentTopic?.title}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6">
        <div className="md:col-span-2 space-y-6">
          {/* Learning Objectives */}
          <section className="bg-sidebar p-4 rounded-md border border-border">
            <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-3">
              Learning Objectives
            </h4>
            {currentTopic?.subtopics?.length > 0 ? (
              <ul className="space-y-2">
                {currentTopic.subtopics.map((sub: any, idx: number) => {
                  const title = typeof sub === 'string' ? sub : (sub?.title || sub?.name || '');
                  if (!title) return null;
                  return (
                    <li key={idx} className="text-[13px] text-text-primary flex gap-2.5 items-start">
                      <span className="text-accent font-bold mt-0.5">•</span>
                      <span>{title}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-[12px] text-text-muted italic">No specific objectives defined for this node.</p>
            )}
          </section>

          {/* Weekly Outcome */}
          {currentModule?.outcome && (
            <section className="bg-callout-bg border border-callout-border p-4 rounded-md">
              <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">
                Module Outcome
              </h4>
              <p className="text-[13px] text-text-heading leading-relaxed">
                {currentModule.outcome}
              </p>
            </section>
          )}
        </div>

        {/* Resources & Goldfish Scout */}
        <div className="space-y-4">
          <section className="bg-sidebar p-4 rounded-md border border-border space-y-3">
            <div>
              <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                Resources
              </h4>
            </div>

            <div className="flex flex-col gap-2">
              {currentModule?.resources?.map((res: any, idx: number) => {
                const url = res.url || res.link || "#";
                return (
                  <a 
                    key={idx}
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[12px] text-accent hover:underline flex items-start gap-2 group p-2 rounded-md bg-background border border-border hover:border-accent/40 transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0 text-text-muted group-hover:text-accent" />
                    <span className="leading-snug line-clamp-2">{res.title || res.name || "Supplementary Article"}</span>
                  </a>
                );
              })}
              {(!currentModule?.resources || currentModule.resources.length === 0) && (
                <div className="text-center py-4 text-text-muted">
                  <p className="text-[11px] italic mb-2">No extra reading materials added yet.</p>
                  <button
                    onClick={onOpenGoldfishReading}
                    className="px-2.5 py-1 bg-orange-500/10 text-orange-600 border border-orange-500/20 rounded-md text-[10px] font-bold hover:bg-orange-500/20 transition-colors inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Scout with Goldfish</span>
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
