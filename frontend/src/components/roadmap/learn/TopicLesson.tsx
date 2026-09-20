'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Loader2, RefreshCw, AlertCircle, Clock, Code2, Copy, Check, Sparkles, ArrowRight } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { GoldfishIcon } from '@/components/goldfish/GoldfishAvatar';
import { lessonsAPI } from '@/lib/api';

function CodeCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors cursor-pointer"
      title="Copy code to clipboard"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400 font-medium">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

export function stripThinkingProcess(raw: string): string {
  if (!raw) return '';
  let text = raw.replace(/<(think|thought)>[\s\S]*?<\/\1>/gi, '');
  text = text.replace(/<(think|thought)>[\s\S]*$/gi, '');

  if (/(?:here['’]s a thinking process|thinking process:|analyze the request|deconstruct the style)/i.test(text)) {
    const headingMatch = text.match(/\n(#{1,3}\s+[^\n]+[\s\S]*)/);
    if (headingMatch) {
      const pre = text.slice(0, headingMatch.index).trim();
      const draftMatch = pre.match(/(?:Draft|Opening):\s*(?:[^\n]*\.\s*)?([A-Z][^\n]+[\s\S]*)/i);
      if (draftMatch) {
        return (draftMatch[1].trim() + "\n\n" + headingMatch[1].trim()).trim();
      }
      return headingMatch[1].trim();
    } else {
      text = text.replace(/^(?:Here['’]s|Here is) a thinking process:[\s\S]*?\n\n(?=[A-Z])/i, '');
    }
  }
  return text.trim();
}

interface TopicLessonProps {
  roadmapId: number;
  moduleNumber: number;
  topicIndex: number;
  subject: string;
  topicTitle: string;
  subtopics: string[];
  goal: string;
  existingLessonContent?: string | null;
  hasVideo?: boolean;
  videoSeconds?: number;
  isVideoOneMinuteWatched?: boolean;
  isTopicCompleted?: boolean;
  isPro?: boolean;
  onLessonLoaded?: (content: string) => void;
}

// Module-level controller ensuring strictly ONE topic stream can be in flight globally
let globalLessonAbortController: AbortController | null = null;

export default function TopicLesson({
  roadmapId,
  moduleNumber,
  topicIndex,
  subject,
  topicTitle,
  subtopics,
  goal,
  existingLessonContent,
  hasVideo = false,
  videoSeconds = 0,
  isVideoOneMinuteWatched = false,
  isTopicCompleted = false,
  isPro = false,
  onLessonLoaded
}: TopicLessonProps) {
  const [content, setContent] = useState<string | null>(existingLessonContent ? stripThinkingProcess(existingLessonContent) : null);
  const [manualBypass, setManualBypass] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (!isPro) return false;
    if (existingLessonContent) return false;
    if (hasVideo && !isTopicCompleted && !isVideoOneMinuteWatched) return false;
    return true;
  });
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [loadingStatusText, setLoadingStatusText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onLessonLoadedRef = React.useRef(onLessonLoaded);
  useEffect(() => {
    onLessonLoadedRef.current = onLessonLoaded;
  }, [onLessonLoaded]);

  const topicKey = `${roadmapId}:${moduleNumber}:${topicIndex}`;
  const isFetchingRef = React.useRef<boolean>(false);
  const activeTopicKeyRef = React.useRef<string | null>(null);
  const fetchedTopicKeyRef = React.useRef<string | null>(null);

  const prevTopicKeyRef = React.useRef(topicKey);
  useEffect(() => {
    if (prevTopicKeyRef.current !== topicKey) {
      prevTopicKeyRef.current = topicKey;
      setContent(existingLessonContent ? stripThinkingProcess(existingLessonContent) : null);
      setManualBypass(false);
      setErrorMsg(null);
      setIsLoading(Boolean(isPro) && !existingLessonContent && (!hasVideo || isTopicCompleted || isVideoOneMinuteWatched));
      setIsStreaming(false);
    }
  }, [topicKey, existingLessonContent, hasVideo, isTopicCompleted, isVideoOneMinuteWatched, isPro]);

  const subtopicsKey = (subtopics || []).join('::');

  const fetchLesson = useCallback(async (force: boolean = false, signal?: AbortSignal) => {
    if (!isPro) {
      setIsLoading(false);
      setIsStreaming(false);
      return;
    }

    // Immediately cancel any previous in-flight lesson request globally
    if (globalLessonAbortController) {
      globalLessonAbortController.abort();
      globalLessonAbortController = null;
    }
    const internalAbort = new AbortController();
    globalLessonAbortController = internalAbort;

    // Link caller signal if provided
    if (signal) {
      signal.addEventListener('abort', () => internalAbort.abort());
    }

    setIsLoading(true);
    setIsStreaming(false);
    setErrorMsg(null);
    setLoadingStatusText('Synthesizing review with Goldfish Cloud AI...');
    if (force) {
      setContent(null);
    }

    try {
      let accumulated = '';
      const handleChunk = (chunk: string) => {
        accumulated += chunk;
        const cleaned = stripThinkingProcess(accumulated);
        if (cleaned) {
          setContent(cleaned);
          setIsStreaming(true);
          setIsLoading(false);
        }
      };

      const finalMarkdown = await lessonsAPI.generateStream({
        roadmap_id: roadmapId,
        module_number: moduleNumber,
        topic_index: topicIndex,
        subject,
        topic_title: topicTitle,
        subtopics,
        goal,
        force_regenerate: force
      }, handleChunk, internalAbort.signal);

      const cleanMarkdown = stripThinkingProcess(finalMarkdown || accumulated);
      if (cleanMarkdown) {
        setContent(cleanMarkdown);
        fetchedTopicKeyRef.current = topicKey;
        if (onLessonLoadedRef.current) {
          onLessonLoadedRef.current(cleanMarkdown);
        }
      }
    } catch (err: any) {
      if (err?.name !== 'CanceledError' && err?.code !== 'ERR_CANCELED' && err?.name !== 'AbortError') {
        console.error("Failed to generate overview:", err);
        const detail = err?.response?.data?.detail || err?.message;
        setErrorMsg(typeof detail === 'string' ? detail : "Failed to load overview. Please try again.");
      }
    } finally {
      if (globalLessonAbortController === internalAbort) {
        globalLessonAbortController = null;
      }
      if (!internalAbort.signal.aborted) {
        setIsLoading(false);
        setIsStreaming(false);
        setLoadingStatusText('');
      }
    }
  }, [roadmapId, moduleNumber, topicIndex, subject, topicTitle, subtopicsKey, goal, topicKey, isPro]);

  useEffect(() => {
    if (!isPro) {
      setIsLoading(false);
      setIsStreaming(false);
      return;
    }

    if (existingLessonContent) {
      setContent(stripThinkingProcess(existingLessonContent));
      setIsLoading(false);
      setIsStreaming(false);
      fetchedTopicKeyRef.current = topicKey;
      return;
    }

    // If this topic has already completed fetching and has content, don't refetch
    if (fetchedTopicKeyRef.current === topicKey && content) {
      setIsLoading(false);
      return;
    }

    // Gate: if topic has a video, require 1 min watched OR completed OR manual bypass
    const canFetch = !hasVideo || isTopicCompleted || isVideoOneMinuteWatched || manualBypass;
    if (!canFetch) {
      setContent(existingLessonContent ? stripThinkingProcess(existingLessonContent) : null);
      setIsLoading(false);
      setIsStreaming(false);
      return;
    }

    // If a fetch is currently in flight for this exact topicKey, don't spawn a second
    if (isFetchingRef.current && activeTopicKeyRef.current === topicKey) {
      return;
    }

    setContent(null);
    setIsLoading(true);
    setIsStreaming(false);
    activeTopicKeyRef.current = topicKey;
    isFetchingRef.current = true;

    const abortController = new AbortController();
    // 600ms dwell delay: only generates when user stops on topic, avoiding bursts when clicking across topics
    const timer = setTimeout(() => {
      fetchLesson(false, abortController.signal).finally(() => {
        isFetchingRef.current = false;
      });
    }, 600);

    return () => {
      clearTimeout(timer);
      abortController.abort();
      isFetchingRef.current = false;
    };
  }, [topicKey, existingLessonContent, hasVideo, isTopicCompleted, isVideoOneMinuteWatched, manualBypass, isPro, fetchLesson]);

  const handleRegenerate = () => {
    fetchLesson(true);
  };

  if (!isPro) {
    return (
      <div className="bg-sidebar border border-border rounded-md p-5 sm:p-6 my-6 shadow-xs">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-3.5 mb-4 border-b border-border">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[12px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-500/10 px-3 py-1 rounded-md border border-orange-500/20 flex items-center gap-1.5">
              <GoldfishIcon variant="happy" className="w-4 h-4 shrink-0" />
              Goldfish AI Overview
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20 px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Pro Feature
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <h4 className="text-[14.5px] font-semibold text-text-heading">
              AI Overview is available with EulerFold Pro
            </h4>
            <p className="text-[13px] text-text-muted leading-relaxed">
              Get concise concept overviews and key takeaways for every topic.
            </p>
          </div>

          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent text-background text-[12px] font-bold rounded-md hover:opacity-90 transition-opacity shrink-0 shadow-xs"
          >
            <span>Upgrade to Pro</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const isLocked = Boolean(hasVideo) && !isTopicCompleted && !isVideoOneMinuteWatched && !manualBypass && !existingLessonContent;

  if (isLocked) {
    return (
      <div className="bg-sidebar border border-border rounded-md p-5 sm:p-6 my-6 shadow-xs">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-3.5 mb-4 border-b border-border">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[12px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-500/10 px-3 py-1 rounded-md border border-orange-500/20 flex items-center gap-1.5">
              <GoldfishIcon variant="happy" className="w-4 h-4 shrink-0" />
              Goldfish AI Overview
            </span>
            <span className="text-[12px] text-text-muted">
              • Unlocks after 1 min of video study
            </span>
          </div>
        </div>

        {/* Locked State Card Body */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <h4 className="text-[14.5px] font-semibold text-text-heading flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent shrink-0" />
              Lecture study in progress
            </h4>
            <p className="text-[13px] text-text-muted leading-relaxed">
              Watch the lecture above for at least 1 minute. Goldfish will automatically synthesize the core mental model, key mechanics, and practical code takeaways below.
            </p>
          </div>

          <div className="w-full sm:w-56 shrink-0 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11.5px] font-mono text-text-muted">
              <span>Video study</span>
              <span className="font-semibold text-text-heading">
                {Math.min(60, Math.floor(videoSeconds))}s / 60s
              </span>
            </div>
            <div className="w-full h-1.5 bg-background rounded-full overflow-hidden border border-border">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${Math.min(100, (Math.floor(videoSeconds) / 60) * 100)}%` }}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setManualBypass(true);
              }}
              className="text-[12px] text-accent hover:underline text-left sm:text-right mt-1 font-medium cursor-pointer"
            >
              Or generate overview now →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-sidebar border border-border rounded-md p-6 sm:p-7 my-6 shadow-xs">
      {/* Goldfish AI Overview Header */}
      <div className="flex items-center justify-between gap-3 pb-4 mb-6 border-b border-border">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[12px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-500/10 px-3 py-1 rounded-md border border-orange-500/20 flex items-center gap-1.5">
            <GoldfishIcon variant="happy" className="w-4 h-4 shrink-0" />
            Goldfish AI Overview
          </span>
          <span className="text-[13px] text-text-muted">
            • 2 min read
          </span>
          {isStreaming && (
            <span className="inline-flex items-center gap-1.5 text-[11.5px] text-orange-600 dark:text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-md animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              Streaming response
            </span>
          )}
        </div>

        {/* Refresh Control */}
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={isLoading || isStreaming}
          className="p-1.5 text-text-muted hover:text-text-primary bg-background border border-border rounded-md transition-colors disabled:opacity-50"
          title="Regenerate overview"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading || isStreaming ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[13px] rounded-md p-3 mb-5 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="bg-sidebar/50 border border-border rounded-md p-6 my-2 shadow-xs flex flex-col items-center justify-center space-y-2.5 py-10">
          <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
          <p className="text-[12px] text-text-muted font-medium">
            {loadingStatusText || 'Goldfish is generating your overview...'}
          </p>
        </div>
      ) : content ? (
        /* Readable, Scannable Markdown Body */
        <div className="text-[16px] text-text-primary leading-[1.85] max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              h1: ({node, ...props}) => (
                <h2 className="text-text-heading font-bold text-xl sm:text-2xl tracking-tight mt-7 mb-3.5 first:mt-0" {...props} />
              ),
              h2: ({node, ...props}) => (
                <h3 className="text-text-heading font-bold text-lg sm:text-xl tracking-tight mt-6 mb-3 border-b border-border/40 pb-1.5" {...props} />
              ),
              h3: ({node, ...props}) => (
                <h4 className="text-text-heading font-semibold text-[17px] mt-5 mb-2.5" {...props} />
              ),
              p: ({node, ...props}) => (
                <p className="mb-4 leading-[1.85] text-text-primary" {...props} />
              ),
              strong: ({node, ...props}) => (
                <strong className="font-semibold text-text-heading" {...props} />
              ),
              ul: ({node, ...props}) => (
                <ul className="mb-5 space-y-2.5 pl-1" {...props} />
              ),
              ol: ({node, ...props}) => (
                <ol className="list-decimal pl-5 mb-5 space-y-2.5" {...props} />
              ),
              li: ({node, children, ...props}) => (
                <li className="flex items-start gap-3 leading-[1.8] text-text-primary text-[15.5px]" {...props}>
                  <span className="text-accent font-bold mt-1.5 shrink-0 text-[11px]">•</span>
                  <span className="flex-1">{children}</span>
                </li>
              ),
              blockquote: ({node, ...props}) => (
                <blockquote className="border-l-2 border-accent/70 bg-accent/5 rounded-r-md px-4 py-3 text-text-primary italic my-5 text-[15px] leading-relaxed" {...props} />
              ),
              code({node, inline, className, children, ...props}: any) {
                const str = String(children || '');
                const isInline = inline || (!className && !str.includes('\n'));
                if (isInline) {
                  return (
                    <code className="bg-background px-1.5 py-0.5 rounded text-[13.5px] font-mono border border-border text-accent font-medium inline-block mx-0.5" {...props}>
                      {children}
                    </code>
                  );
                }

                const match = /language-(\w+)/.exec(className || '');
                const rawLang = match ? match[1].toLowerCase() : '';

                const langMap: Record<string, string> = {
                  cpp: 'C++',
                  'c++': 'C++',
                  c: 'C',
                  python: 'Python',
                  py: 'Python',
                  typescript: 'TypeScript',
                  ts: 'TypeScript',
                  javascript: 'JavaScript',
                  js: 'JavaScript',
                  bash: 'Bash',
                  sh: 'Bash',
                  shell: 'Shell',
                  sql: 'SQL',
                  rust: 'Rust',
                  json: 'JSON',
                  cmake: 'CMake'
                };
                const langLabel = langMap[rawLang] || (rawLang ? rawLang.toUpperCase() : 'Code');
                const prismLanguage = rawLang || 'cpp';

                // Clean markdown artifacts inside comments (e.g. // **concept** -> // concept)
                const cleanCode = str
                  .replace(/\n$/, '')
                  .replace(/(\/\/\s*|\#\s*)\*\*([^*]+)\*\*/g, '$1$2');

                return (
                  <div className="my-5 rounded-md border border-border overflow-hidden bg-[#131b1b] dark:bg-[#101717] shadow-xs">
                    {/* Top Bar with Language Badge and Copy Button */}
                    <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#0c1212] dark:bg-[#0a0f0f] border-b border-border/40">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-3.5 h-3.5 text-accent/80" />
                        <span className="text-[11px] font-mono font-semibold tracking-wider text-text-muted uppercase">
                          {langLabel}
                        </span>
                      </div>
                      <CodeCopyButton text={cleanCode} />
                    </div>

                    {/* Syntax Highlighted Code Container */}
                    <div className="overflow-x-auto text-[13.5px] font-mono">
                      <SyntaxHighlighter
                        style={oneDark}
                        language={prismLanguage}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          padding: '14px 16px',
                          fontSize: '13.5px',
                          lineHeight: '1.65',
                          background: 'transparent',
                          borderRadius: 0,
                        }}
                        codeTagProps={{
                          style: {
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
                          }
                        }}
                      >
                        {cleanCode}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                );
              },
              a: ({node, ...props}) => (
                <a className="text-accent hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-orange-500 animate-pulse align-middle rounded-xs" />
          )}
        </div>
      ) : null}
    </div>
  );
}
