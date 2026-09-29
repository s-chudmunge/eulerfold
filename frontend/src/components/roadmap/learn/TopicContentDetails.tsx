'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { FileText, ExternalLink, Plus, BookOpen, RotateCw, Sparkles } from 'lucide-react';
import { roadmapsAPI, TopicPaper } from '@/lib/api';

interface TopicContentDetailsProps {
  currentTopic: any;
  currentModule: any;
  subject?: string;
  onOpenGoldfishReading: () => void;
}

// Module-level client cache to avoid refetching previously viewed topics
const clientPapersCache = new Map<string, TopicPaper[]>();

function formatCitations(num: number): string {
  if (!num || num <= 0) return 'Seminal Work';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M cites`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k cites`;
  return `${num} cites`;
}

export default function TopicContentDetails({
  currentTopic,
  currentModule,
  subject,
  onOpenGoldfishReading
}: TopicContentDetailsProps) {
  const [papers, setPapers] = useState<TopicPaper[]>([]);
  const [papersLoading, setPapersLoading] = useState<boolean>(true);
  const [papersError, setPapersError] = useState<boolean>(false);
  const [canManualTrigger, setCanManualTrigger] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const moduleTitle = currentModule?.title || '';
  const moduleId = currentModule?.id || moduleTitle;

  const learningObjectives: string[] = React.useMemo(() => {
    if (!currentModule?.topics) return [];
    const list: string[] = [];
    for (const t of currentModule.topics) {
      if (t?.subtopics && Array.isArray(t.subtopics)) {
        for (const s of t.subtopics) {
          const str = typeof s === 'string' ? s : (s?.title || s?.name || '');
          if (str) list.push(str);
        }
      } else if (t?.title) {
        list.push(t.title);
      }
    }
    return list;
  }, [currentModule]);

  const executeFetch = useCallback(async (modTitle: string, objs: string[], signal?: AbortSignal) => {
    const cacheKey = (currentModule?.id || modTitle).toLowerCase().trim();
    if (clientPapersCache.has(cacheKey)) {
      setPapers(clientPapersCache.get(cacheKey) || []);
      setPapersLoading(false);
      setPapersError(false);
      setCanManualTrigger(false);
      return;
    }

    setPapersLoading(true);
    setPapersError(false);
    try {
      const data = await roadmapsAPI.getTopicPapers(modTitle, subject, objs, signal);
      const validPapers = Array.isArray(data) ? data : [];
      clientPapersCache.set(cacheKey, validPapers);
      setPapers(validPapers);
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') {
        return;
      }
      console.warn('Failed to load module papers:', err);
      setPapersError(true);
    } finally {
      setPapersLoading(false);
      setCanManualTrigger(false);
    }
  }, [currentModule?.id, subject]);

  useEffect(() => {
    if (!moduleTitle) {
      setPapers([]);
      setPapersLoading(false);
      setCanManualTrigger(false);
      return;
    }

    const cacheKey = (moduleId).toLowerCase().trim();
    if (clientPapersCache.has(cacheKey)) {
      setPapers(clientPapersCache.get(cacheKey) || []);
      setPapersLoading(false);
      setPapersError(false);
      setCanManualTrigger(false);
      return;
    }

    // New module not in cache: show skeleton loading and only trigger if user stays > 25 seconds
    setPapers([]);
    setPapersLoading(true);
    setPapersError(false);
    setCanManualTrigger(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 25-second residency threshold: do not trigger network request if user clicks through quickly
    timerRef.current = setTimeout(() => {
      executeFetch(moduleTitle, learningObjectives, abortController.signal);
    }, 25000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      abortController.abort();
    };
  }, [moduleId, moduleTitle, learningObjectives, executeFetch]);

  const handleManualTrigger = () => {
    if (!moduleTitle) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    executeFetch(moduleTitle, learningObjectives, controller.signal);
  };

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

        {/* Resources & Papers Side Column */}
        <div className="space-y-6">
          {/* Resources Section */}
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

          {/* Foundational Papers Section */}
          <section className="bg-sidebar p-4 rounded-md border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-accent" />
                  <span>Foundational Papers</span>
                </h4>
                <p className="text-[10px] text-text-muted mt-0.5">
                  Curated for this module
                </p>
              </div>
              {papersError ? (
                <button
                  type="button"
                  onClick={handleManualTrigger}
                  className="text-text-muted hover:text-text-primary p-1 rounded-md transition-colors"
                  title="Retry fetching papers"
                >
                  <RotateCw className="w-3 h-3" />
                </button>
              ) : papersLoading && canManualTrigger ? (
                <button
                  type="button"
                  onClick={handleManualTrigger}
                  className="text-[10px] text-accent hover:underline inline-flex items-center gap-1"
                  title="Fetch top cited papers now"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Load now</span>
                </button>
              ) : null}
            </div>

            {papersLoading ? (
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-2.5 rounded-md bg-background border border-border animate-pulse space-y-2">
                    <div className="h-3.5 bg-border rounded-md w-5/6" />
                    <div className="h-2.5 bg-border rounded-md w-full" />
                    <div className="flex items-center justify-between pt-1">
                      <div className="h-2.5 bg-border rounded-md w-2/5" />
                      <div className="h-3.5 bg-border rounded-md w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : papers.length > 0 ? (
              <div className="flex flex-col gap-2">
                {papers.map((paper, idx) => {
                  const paperUrl = paper.url || (paper.doi ? `https://doi.org/${paper.doi}` : '#');
                  return (
                    <a
                      key={idx}
                      href={paperUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-md bg-background border border-border hover:border-accent/50 transition-colors flex flex-col gap-1.5 group cursor-pointer block"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-[12px] font-semibold text-text-heading group-hover:text-accent leading-snug line-clamp-2 transition-colors">
                          {paper.title}
                        </h5>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 text-text-muted group-hover:text-accent transition-colors mt-0.5" />
                      </div>

                      {paper.snippet ? (
                        <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">
                          {paper.snippet}
                        </p>
                      ) : null}

                      <div className="flex items-center justify-between text-[11px] text-text-muted gap-2 mt-auto pt-0.5">
                        <span className="truncate max-w-[130px]" title={paper.authors}>
                          {paper.authors} {paper.year ? `• ${paper.year}` : ''}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {paper.citation_count > 0 ? (
                            <span
                              className="text-[10px] font-medium text-accent bg-accent/10 px-1.5 py-0.5 rounded-md"
                              title={`${paper.citation_count.toLocaleString()} citations recorded in academic index`}
                            >
                              {formatCitations(paper.citation_count)}
                            </span>
                          ) : (
                            <span
                              className="text-[10px] font-medium text-accent bg-accent/10 px-1.5 py-0.5 rounded-md font-mono"
                              title={paper.badge || paper.venue || 'Survey'}
                            >
                              {paper.badge || paper.venue || 'Survey'}
                            </span>
                          )}

                          {paper.pdf_url && (
                            <span
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.open(paper.pdf_url!, '_blank', 'noopener,noreferrer');
                              }}
                              className="text-[10px] font-semibold text-text-primary hover:text-accent bg-sidebar border border-border hover:border-accent/40 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer"
                              title="Open PDF directly in new tab"
                            >
                              PDF
                            </span>
                          )}
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-text-muted">
                <p className="text-[11px] italic">
                  {papersError ? 'Unable to load papers right now.' : 'No cited papers indexed for this topic.'}
                </p>
                {papersError && (
                  <button
                    type="button"
                    onClick={handleManualTrigger}
                    className="mt-2 px-2.5 py-1 bg-accent/10 text-accent border border-accent/20 rounded-md text-[10px] font-bold hover:bg-accent/20 transition-colors inline-flex items-center gap-1"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Retry</span>
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
