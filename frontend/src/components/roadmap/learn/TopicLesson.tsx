import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { BookOpen, Loader2, Cpu, Cloud, Key, RefreshCw, AlertCircle, Sparkles, ChevronDown } from 'lucide-react';
import { GoldfishIcon } from '@/components/goldfish/GoldfishAvatar';
import { LocalAIModal } from '@/components/landing/LocalAIModal';
import { lessonsAPI } from '@/lib/api';
import { logAIUsage } from '@/lib/usageTracker';

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
  onLessonLoaded?: (content: string) => void;
}

export default function TopicLesson({
  roadmapId,
  moduleNumber,
  topicIndex,
  subject,
  topicTitle,
  subtopics,
  goal,
  existingLessonContent,
  onLessonLoaded
}: TopicLessonProps) {
  const [content, setContent] = useState<string | null>(existingLessonContent ? stripThinkingProcess(existingLessonContent) : null);
  const [isLoading, setIsLoading] = useState<boolean>(!existingLessonContent);
  const [loadingStatusText, setLoadingStatusText] = useState<string>('');
  const [aiProvider, setAiProvider] = useState<'cloud' | 'openrouter' | 'webgpu'>('cloud');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Local WebGPU Model Selection & Gallery Modal
  const [isLocalModalOpen, setIsLocalModalOpen] = useState(false);
  const [localModelId, setLocalModelId] = useState<string>('Llama-3.2-1B-Instruct-q4f16_1-MLC');
  const [localModelName, setLocalModelName] = useState<string>('Llama 3.2 1B');

  // Load saved provider & local model preferences on client mount
  useEffect(() => {
    try {
      const savedProvider = localStorage.getItem('eulerfold_lesson_provider');
      if (savedProvider === 'webgpu' || savedProvider === 'openrouter' || savedProvider === 'cloud') {
        setAiProvider(savedProvider);
      } else {
        // Match user's global settings if preferred
        const useOR = localStorage.getItem('use_openrouter') === 'true';
        const useLocal = localStorage.getItem('use_local_ai') === 'true';
        if (useLocal) setAiProvider('webgpu');
        else if (useOR) setAiProvider('openrouter');
      }

      const savedModelId = localStorage.getItem('local_ai_model') || localStorage.getItem('localAIModelId');
      const savedModelName = localStorage.getItem('local_ai_model_name') || localStorage.getItem('localAIModelName');
      if (savedModelId) setLocalModelId(savedModelId);
      if (savedModelName) setLocalModelName(savedModelName);
    } catch {
      // Ignore local storage error
    }
  }, []);

  const generateWithWebGPU = async (promptText: string, modelOverride?: string) => {
    const modelToUse = modelOverride || localModelId || localStorage.getItem('local_ai_model') || 'Llama-3.2-1B-Instruct-q4f16_1-MLC';
    setLoadingStatusText(`Initializing WebGPU (${modelToUse})...`);
    
    const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
    const engine = await CreateMLCEngine(modelToUse, {
      initProgressCallback: (report: any) => {
        if (report?.text) setLoadingStatusText(report.text);
      }
    });

    setLoadingStatusText('Generating overview on device GPU...');
    const response = await engine.chat.completions.create({
      messages: [
        { role: 'user', content: promptText }
      ],
      temperature: 0.3
    });

    const output = response.choices?.[0]?.message?.content || '';
    if (!output.trim()) {
      throw new Error('WebGPU returned empty output.');
    }

    try {
      await logAIUsage({
        subject: `Micro-Lesson (WebGPU): ${topicTitle}`,
        model: localModelId,
        prompt_tokens: response.usage?.prompt_tokens || 0,
        completion_tokens: response.usage?.completion_tokens || 0,
        total_tokens: response.usage?.total_tokens || 0,
        source: 'LocalAI'
      });
    } catch {
      // Ignore tracking errors
    }

    return output.trim();
  };

  const generateWithOpenRouter = async (promptText: string) => {
    const apiKey = localStorage.getItem('openrouter_key') || localStorage.getItem('openRouterKey');
    if (!apiKey) {
      throw new Error('No OpenRouter API key found. Please connect your OpenRouter key in Settings.');
    }

    const modelName = localStorage.getItem('openrouter_model') || localStorage.getItem('openRouterModel') || 'openai/gpt-4o';
    setLoadingStatusText(`Querying OpenRouter (${modelName})...`);

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": typeof window !== 'undefined' ? window.location.origin : 'https://www.eulerfold.com',
        "X-Title": "EulerFold"
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: "user", content: promptText }],
        temperature: 0.3
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || "OpenRouter generation request failed.");
    }

    const output = data.choices?.[0]?.message?.content || '';
    if (!output.trim()) {
      throw new Error('OpenRouter returned an empty response.');
    }

    try {
      await logAIUsage({
        subject: `Micro-Lesson (OpenRouter): ${topicTitle}`,
        model: data.model || modelName,
        prompt_tokens: data.usage?.prompt_tokens || 0,
        completion_tokens: data.usage?.completion_tokens || 0,
        total_tokens: data.usage?.total_tokens || 0,
        source: 'OpenRouter'
      });
    } catch {
      // Ignore tracking errors
    }

    return output.trim();
  };

  const fetchLesson = useCallback(async (provider: 'cloud' | 'openrouter' | 'webgpu', force: boolean = false, signal?: AbortSignal) => {
    setIsLoading(true);
    setErrorMsg(null);
    setLoadingStatusText('');

    try {
      let finalMarkdown = '';

      if (provider === 'webgpu') {
        const { prompt } = await lessonsAPI.getPrompt({
          subject,
          topic_title: topicTitle,
          subtopics,
          goal
        });
        finalMarkdown = await generateWithWebGPU(prompt);
      } else if (provider === 'openrouter') {
        const { prompt } = await lessonsAPI.getPrompt({
          subject,
          topic_title: topicTitle,
          subtopics,
          goal
        });
        finalMarkdown = await generateWithOpenRouter(prompt);
      } else {
        // Standard EulerFold Cloud inference
        setLoadingStatusText('Synthesizing review with Goldfish Cloud AI...');
        const result = await lessonsAPI.generate({
          roadmap_id: roadmapId,
          module_number: moduleNumber,
          topic_index: topicIndex,
          subject,
          topic_title: topicTitle,
          subtopics,
          goal,
          model: 'cloud',
          force_regenerate: force
        }, signal);
        finalMarkdown = result?.lesson_content || '';
      }

      const cleanMarkdown = stripThinkingProcess(finalMarkdown);
      if (cleanMarkdown) {
        setContent(cleanMarkdown);
        if (onLessonLoaded) {
          onLessonLoaded(cleanMarkdown);
        }

        // Persist lesson content back to roadmap if generated client-side
        if (provider !== 'cloud') {
          try {
            await lessonsAPI.saveContent({
              roadmap_id: roadmapId,
              module_number: moduleNumber,
              topic_index: topicIndex,
              lesson_content: cleanMarkdown
            });
          } catch (saveErr) {
            console.warn("Could not save client-generated lesson back to roadmap:", saveErr);
          }
        }
      }
    } catch (err: any) {
      if (err?.name !== 'CanceledError' && err?.code !== 'ERR_CANCELED' && err?.name !== 'AbortError') {
        console.error("Failed to generate lesson:", err);
        const detail = err?.response?.data?.detail || err?.message;
        setErrorMsg(typeof detail === 'string' ? detail : "Failed to load overview. Please try again or switch provider.");
      }
    } finally {
      if (!signal || !signal.aborted) {
        setIsLoading(false);
        setLoadingStatusText('');
      }
    }
  }, [roadmapId, moduleNumber, topicIndex, subject, topicTitle, subtopics, goal, onLessonLoaded]);

  useEffect(() => {
    if (existingLessonContent) {
      setContent(stripThinkingProcess(existingLessonContent));
      setIsLoading(false);
      return;
    }

    const abortController = new AbortController();
    const timer = setTimeout(() => {
      fetchLesson(aiProvider, false, abortController.signal);
    }, 800);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [existingLessonContent, fetchLesson, aiProvider]);

  const handleProviderChange = (newProvider: 'cloud' | 'openrouter' | 'webgpu') => {
    if (newProvider === aiProvider) return;
    setAiProvider(newProvider);
    try {
      localStorage.setItem('eulerfold_lesson_provider', newProvider);
    } catch {
      // Ignore
    }
    fetchLesson(newProvider, true);
  };

  const handleRegenerate = () => {
    fetchLesson(aiProvider, true);
  };

  return (
    <div className="bg-sidebar border border-border rounded-md p-6 sm:p-7 my-6 shadow-xs">
      {/* Goldfish Co-Pilot Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-border">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[12px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-500/10 px-3 py-1 rounded-md border border-orange-500/20 flex items-center gap-1.5">
            <GoldfishIcon variant="happy" className="w-4 h-4 shrink-0" />
            Goldfish AI Co-Pilot Review
          </span>
          <span className="text-[13px] text-text-muted">
            • 2 min read
          </span>
        </div>

        {/* Provider Toggle & Refresh Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center p-0.5 bg-background border border-border rounded-md text-[12px]">
            <button
              type="button"
              onClick={() => handleProviderChange('cloud')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                aiProvider === 'cloud'
                  ? 'bg-sidebar text-text-primary font-medium shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="EulerFold Cloud AI"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Cloud</span>
            </button>
            <button
              type="button"
              onClick={() => handleProviderChange('openrouter')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                aiProvider === 'openrouter'
                  ? 'bg-sidebar text-text-primary font-medium shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="OpenRouter BYOK"
            >
              <Key className="w-3.5 h-3.5" />
              <span>OpenRouter</span>
            </button>
            <button
              type="button"
              onClick={() => handleProviderChange('webgpu')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                aiProvider === 'webgpu'
                  ? 'bg-sidebar text-text-primary font-medium shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Run on-device privately via WebGPU"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>WebGPU</span>
            </button>
          </div>

          {/* WebGPU Model Gallery Button */}
          {aiProvider === 'webgpu' && (
            <button
              type="button"
              onClick={() => setIsLocalModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-text-muted hover:text-text-primary bg-background border border-border rounded-md transition-colors shadow-xs"
              title="Change local WebGPU model or open model gallery"
            >
              <Sparkles className="w-3 h-3 text-accent" />
              <span className="truncate max-w-[120px] sm:max-w-[160px]">{localModelName || localModelId}</span>
              <ChevronDown className="w-3 h-3 text-text-muted shrink-0" />
            </button>
          )}

          <button
            type="button"
            onClick={handleRegenerate}
            disabled={isLoading}
            className="p-1.5 text-text-muted hover:text-text-primary bg-background border border-border rounded-md transition-colors disabled:opacity-50"
            title="Regenerate review"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Local WebGPU Model Gallery Modal */}
      <LocalAIModal
        isOpen={isLocalModalOpen}
        onClose={() => setIsLocalModalOpen(false)}
        onSelectModel={(id, name) => {
          setLocalModelId(id);
          setLocalModelName(name);
          try {
            localStorage.setItem('local_ai_model', id);
            localStorage.setItem('local_ai_model_name', name);
            localStorage.setItem('localAIModelId', id);
            localStorage.setItem('localAIModelName', name);
          } catch {
            // Ignore
          }
          setIsLocalModalOpen(false);
          // If currently in webgpu mode, trigger regenerate with the newly selected model
          if (aiProvider === 'webgpu') {
            fetchLesson('webgpu', true);
          }
        }}
      />

      {/* Error Message */}
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[13px] rounded-md p-3 mb-5 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium">{errorMsg}</p>
            {aiProvider === 'webgpu' && (
              <p className="mt-1 text-[12px] text-text-muted">
                Make sure your browser supports WebGPU, or switch to Cloud / OpenRouter.
              </p>
            )}
            {aiProvider === 'openrouter' && (
              <p className="mt-1 text-[12px] text-text-muted">
                Ensure your OpenRouter key is set in Settings → AI Engine.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="bg-sidebar/50 border border-border rounded-md p-6 my-2 shadow-xs flex flex-col items-center justify-center space-y-2.5 py-10">
          <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
          <p className="text-[12px] text-text-muted font-medium">
            {loadingStatusText || `Goldfish is generating your overview with ${aiProvider === 'webgpu' ? 'WebGPU Local AI' : aiProvider === 'openrouter' ? 'OpenRouter' : 'Cloud AI'}...`}
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
              return (
                <div className="bg-background border border-border rounded-md p-4 my-5 overflow-x-auto shadow-xs">
                  <pre className="text-[13.5px] font-mono leading-relaxed text-text-primary">
                    <code {...props}>{children}</code>
                  </pre>
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
        </div>
      ) : null}
    </div>
  );
}
