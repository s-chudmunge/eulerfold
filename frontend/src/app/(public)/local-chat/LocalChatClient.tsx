'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Send, Layers, Loader2, ArrowLeft,
  Trash2, StopCircle, Globe, LayoutPanelLeft
} from 'lucide-react';
import Link from 'next/link';
import { CreateMLCEngine } from '@mlc-ai/web-llm';
import { LocalAIModal } from '@/components/landing/LocalAIModal';

// Lib
import { buildSystemPrompt } from './lib/prompts';
import { detectArtifact } from './lib/artifacts';
import { runWebSearch, runFetchUrl, cleanSearchQuery } from './lib/tools';
import { IDLE_MS, STARTER_PROMPTS, modelSupportsFunctionCalling, TOOLS } from './lib/constants';
import type { Message, Artifact, ToolActivity, ApiMessage } from './lib/types';

// Hooks
import { useFaviconBlink } from './hooks/useFaviconBlink';

// Components
import { CopyButton } from './components/CopyButton';
import { ToolCallCard } from './components/ToolCallCard';
import { ArtifactCard, ArtifactPanel } from './components/ArtifactViews';
import { MarkdownMessage } from './components/MarkdownMessage';

export default function LocalChatClient() {
  const [modelId,   setModelId]   = useState('Llama-3.2-1B-Instruct-q4f16_1-MLC');
  const [modelName, setModelName] = useState('Llama 3.2 1B');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [engine, setEngine] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [isLoadingEngine, setIsLoadingEngine] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [activeArtifactId, setActiveArtifactId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingIndex, setStreamingIndex] = useState<number | null>(null);
  const [idleWarning, setIdleWarning] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef    = useRef<HTMLTextAreaElement>(null);
  const abortRef       = useRef(false);
  const idleTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const apiHistoryRef  = useRef<ApiMessage[]>([]);

  const activeArtifact = useMemo(
    () => artifacts.find(a => a.id === activeArtifactId) ?? null,
    [artifacts, activeArtifactId]
  );

  // ── Init
  useEffect(() => {
    const id   = localStorage.getItem('localAIModelId') || localStorage.getItem('local_ai_model');
    const name = localStorage.getItem('localAIModelName') || localStorage.getItem('local_ai_model_name');
    
    // Prevent loading embedding models for chat
    if (id && !id.toLowerCase().includes('embed')) {
      setModelId(id);
      if (name) setModelName(name);
    } else if (id && id.toLowerCase().includes('embed')) {
      localStorage.removeItem('localAIModelId');
      localStorage.removeItem('local_ai_model');
      localStorage.removeItem('localAIModelName');
      localStorage.removeItem('local_ai_model_name');
    }

    // Read initial query parameter 'q'
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const initialQuery = params.get('q');
      if (initialQuery) {
        setInputValue(initialQuery);
      }
    }
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 180) + 'px';
  }, [inputValue]);

  useEffect(() => () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); }, []);

  useFaviconBlink(isGenerating);

  const resetIdleTimer = useCallback((e: any) => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    setIdleWarning(false);
    idleTimerRef.current = setTimeout(async () => {
      try { await e.unload(); } catch {}
      setEngine(null);
      setIdleWarning(true);
    }, IDLE_MS);
  }, []);

  // ── Engine
  const ensureEngine = async (id: string) => {
    if (engine) return engine;
    setIsLoadingEngine(true);
    try {
      const e = await CreateMLCEngine(id, {
        initProgressCallback: (r: { text: string }) => setLoadingStatus(r.text)
      });
      setEngine(e);
      setLoadingStatus('');
      setIdleWarning(false);
      resetIdleTimer(e);
      return e;
    } finally {
      setIsLoadingEngine(false);
    }
  };

  // ── Clear
  const clearConversation = () => {
    setMessages([]);
    setArtifacts([]);
    setActiveArtifactId(null);
    apiHistoryRef.current = [];
  };

  // ── Send / Native tool-calling agentic loop
  //
  // Architecture mirrors ChatGPT / Claude:
  //  1. Stream with tools=[web_search, fetch_url] — model decides if it needs them
  //  2. If finish_reason='tool_calls': execute tool, inject result, stream final answer
  //  3. If finish_reason='stop':       render streamed content directly
  //  No keyword heuristics — the LLM decides based on semantic understanding.
  //
  const send = async (text: string) => {
    if (!text.trim() || isGenerating) return;
    abortRef.current = false;

    let activeEngine: any;
    try { activeEngine = await ensureEngine(modelId); }
    catch { setLoadingStatus('Failed to load model. Check device memory.'); return; }

    let apiPrompt = text.trim();
    if (/artifact/i.test(apiPrompt) && !/(html|react|svg|code|component|ui|app)/i.test(apiPrompt)) {
      apiPrompt += ' (Please build an interactive React component or HTML/SVG web artifact with full working code in a code block.)';
    }

    setMessages(prev => [...prev, { role: 'user', content: text.trim() }]);
    setInputValue('');
    apiHistoryRef.current.push({ role: 'user', content: apiPrompt });

    setMessages(prev => [...prev, { role: 'assistant', content: '', toolActivities: [] }]);

    const assistantIndexRef = { current: -1 };
    setMessages(prev => { assistantIndexRef.current = prev.length - 1; return prev; });
    setIsGenerating(true);

    const updateAssistant = (updater: (m: Message) => Message) => {
      setMessages(prev => {
        const idx = assistantIndexRef.current >= 0 ? assistantIndexRef.current : prev.length - 1;
        const updated = [...prev];
        if (updated[idx]?.role === 'assistant') updated[idx] = updater(updated[idx]);
        return updated;
      });
    };

    await new Promise(r => setTimeout(r, 0));
    setMessages(prev => {
      assistantIndexRef.current = prev.findLastIndex(m => m.role === 'assistant');
      return prev;
    });
    setStreamingIndex(assistantIndexRef.current >= 0 ? assistantIndexRef.current : messages.length + 1);

    const supportsTools = modelSupportsFunctionCalling(modelId);

    // Tool call pairs appended each round: [assistant tool_calls msg, tool result msg, ...]
    const toolTurns: ApiMessage[] = [];
    let toolSystemContext: string | undefined;

    const buildMessages = (): ApiMessage[] => [
      { role: 'system', content: buildSystemPrompt(toolSystemContext) },
      ...apiHistoryRef.current,
      ...toolTurns,
    ];

    // Helper: stream one pass, accumulate content + tool call deltas
    const streamPass = async (useNativeTools: boolean) => {
      const toolCallsMap = new Map<number, { id: string; name: string; args: string }>();
      let content = '';
      let finishReason = '';

      const stream = await activeEngine.chat.completions.create({
        messages: buildMessages(),
        ...(useNativeTools ? { tools: TOOLS, tool_choice: 'auto' } : {}),
        temperature: 0.5,
        repetition_penalty: 1.15,
        max_tokens: useNativeTools ? 512 : 1024, // shorter for routing pass
        stream: true,
      });

      for await (const chunk of stream) {
        if (abortRef.current) break;
        const delta = chunk.choices[0]?.delta;
        const reason = chunk.choices[0]?.finish_reason;
        if (reason) finishReason = reason;

        // Accumulate text
        if (delta?.content) {
          content += delta.content;
          updateAssistant(m => ({ ...m, content }));
        }

        // Accumulate streaming tool call deltas
        if (delta?.tool_calls) {
          for (const tc of delta.tool_calls) {
            if (!toolCallsMap.has(tc.index)) {
              toolCallsMap.set(tc.index, { id: '', name: '', args: '' });
            }
            const acc = toolCallsMap.get(tc.index)!;
            if (tc.id)                  acc.id   += tc.id;
            if (tc.function?.name)      acc.name += tc.function.name;
            if (tc.function?.arguments) acc.args += tc.function.arguments;
          }
        }
      }

      return { content, finishReason, toolCalls: Array.from(toolCallsMap.values()) };
    };

    try {
      let fullContent = '';

      // ── Heuristic Tool Detection (Fallback for Llama models that WebLLM rejects for native tools)
      let heuristicPass = false;
      if (!supportsTools) {
        const urlMatch = text.match(/https?:\/\/[^\s)>"]+/i);
        const isFetch  = !!urlMatch;
        // Refined heuristics: removed 'what is/who is' to avoid basic knowledge false positives
        // Added 'current|today|now|price|weather|rate' for real-time/factual queries
        const isSearch = !isFetch && /(?:search|lookup|find|google|latest|recent|benchmark|news|documentation|current|today|now|price|weather|rate)/i.test(text);

        if ((isFetch || isSearch) && !abortRef.current) {
          heuristicPass = true;
          const callId = 'auto_' + Math.random().toString(36).slice(2, 8);
          const toolName = isFetch ? 'fetch_url' : 'web_search';
          const displayInput = isFetch ? { url: urlMatch![0] } : { query: cleanSearchQuery(text) };

          updateAssistant(m => ({
            ...m,
            toolActivities: [{ callId, type: toolName, input: displayInput, status: 'running' as const }]
          }));

          try {
            let result: string;
            let activityUpdate: Partial<ToolActivity>;
            if (isFetch) {
              const out = await runFetchUrl(urlMatch![0]);
              result = out.result;
              activityUpdate = { fetchResult: out.fetchResult };
            } else {
              const out = await runWebSearch(text);
              result = out.result;
              activityUpdate = { searchResults: out.searchResults };
            }
            toolSystemContext = result;
            updateAssistant(m => ({
              ...m,
              toolActivities: (m.toolActivities || []).map(a => a.callId === callId ? { ...a, status: 'done', ...activityUpdate } : a)
            }));
          } catch (toolErr: any) {
            toolSystemContext = `Tool call failed: ${toolErr.message}. Do NOT guess. Tell the user the search failed.`;
            updateAssistant(m => ({
              ...m,
              toolActivities: (m.toolActivities || []).map(a => a.callId === callId ? { ...a, status: 'error', error: toolErr.message } : a)
            }));
          }
        }
      }

      if (abortRef.current) { setIsGenerating(false); setStreamingIndex(null); return; }

      // ── Round 1: stream with tools (if supported) or just stream if using heuristics
      const pass1 = await streamPass(supportsTools);
      fullContent = pass1.content;

      if (supportsTools && pass1.finishReason === 'tool_calls' && pass1.toolCalls.length > 0) {
        // Model natively decided to call a tool

        toolTurns.push({
          role: 'assistant',
          content: null,
          tool_calls: pass1.toolCalls.map(tc => ({
            id: tc.id || `call_${Math.random().toString(36).slice(2)}`,
            type: 'function',
            function: { name: tc.name, arguments: tc.args },
          })),
        });

        // Execute each tool call
        for (const tc of pass1.toolCalls) {
          const callId = tc.id || `call_${Math.random().toString(36).slice(2)}`;
          const toolName = tc.name as 'web_search' | 'fetch_url';
          let toolArgs: Record<string, string> = {};
          try { toolArgs = JSON.parse(tc.args || '{}'); } catch {}

          const displayInput = toolName === 'fetch_url'
            ? { url: toolArgs.url }
            : { query: toolArgs.query };

          updateAssistant(m => ({
            ...m,
            toolActivities: [...(m.toolActivities || []), {
              callId, type: toolName, input: displayInput, status: 'running' as const,
            }],
          }));

          try {
            let result: string;
            let activityUpdate: Partial<ToolActivity>;

            if (toolName === 'fetch_url') {
              const out = await runFetchUrl(toolArgs.url);
              result = out.result;
              activityUpdate = { fetchResult: out.fetchResult };
            } else {
              const out = await runWebSearch(toolArgs.query);
              result = out.result;
              activityUpdate = { searchResults: out.searchResults };
            }

            toolTurns.push({ role: 'tool', tool_call_id: callId, content: result });

            updateAssistant(m => ({
              ...m,
              toolActivities: (m.toolActivities || []).map(a =>
                a.callId === callId ? { ...a, status: 'done', ...activityUpdate } : a
              ),
            }));
          } catch (toolErr: any) {
            toolTurns.push({
              role: 'tool',
              tool_call_id: callId,
              content: `Tool failed: ${toolErr.message}. Tell the user the search failed; do not guess.`,
            });
            updateAssistant(m => ({
              ...m,
              toolActivities: (m.toolActivities || []).map(a =>
                a.callId === callId ? { ...a, status: 'error', error: toolErr.message } : a
              ),
            }));
          }
        }

        if (abortRef.current) { setIsGenerating(false); setStreamingIndex(null); return; }

        // Reset streamed content and stream the final answer (no tools this time)
        updateAssistant(m => ({ ...m, content: '' }));
        const pass2 = await streamPass(false);
        fullContent = pass2.content;
      }

      apiHistoryRef.current.push({ role: 'assistant', content: fullContent });

      // ── Artifact detection
      const detected = detectArtifact(fullContent);
      if (detected) {
        const artifact: Artifact = {
          ...detected,
          id: Math.random().toString(36).slice(2, 10),
          messageIndex: assistantIndexRef.current,
        };
        setArtifacts(prev => [...prev, artifact]);
        setActiveArtifactId(artifact.id);
        updateAssistant(m => ({ ...m, artifactId: artifact.id }));
      }

      resetIdleTimer(activeEngine);
    } catch (err: any) {
      console.error('Local AI Inference error:', err);
      const msg = err?.message || String(err);

      // GPUBuffer unmapped = WebGPU watchdog killed the context during tool latency.
      // Retry once — the engine must be completely reloaded to remap the buffer.
      const isGPUBufferErr = msg.toLowerCase().includes('gpubuffer') || msg.toLowerCase().includes('unmapped');
      if (isGPUBufferErr) {
        updateAssistant(m => ({ ...m, content: '⟳ GPU context reset — retrying…' }));
        await new Promise(r => setTimeout(r, 800));
        try {
          try { await activeEngine.unload(); } catch {}
          setEngine(null);
          activeEngine = await ensureEngine(modelId);

          const retryStream = await activeEngine.chat.completions.create({
            messages: [
              { role: 'system', content: buildSystemPrompt() },
              ...apiHistoryRef.current,
            ],
            temperature: 0.5,
            repetition_penalty: 1.15,
            max_tokens: 1024,
            stream: true,
          });
          let retryContent = '';
          for await (const chunk of retryStream) {
            if (abortRef.current) break;
            retryContent += chunk.choices[0]?.delta?.content || '';
            updateAssistant(m => ({ ...m, content: retryContent }));
          }
          apiHistoryRef.current.push({ role: 'assistant', content: retryContent });
          resetIdleTimer(activeEngine);
          return;
        } catch (retryErr: any) {
          updateAssistant(m => ({ ...m, content: `GPU error persists: ${retryErr?.message}. Reload the page or pick a smaller model.` }));
          return;
        }
      }

      updateAssistant(m => ({
        ...m,
        content: `Inference error: ${msg}. If this persists, try a smaller model.`,
      }));
    } finally {
      setIsGenerating(false);
      setStreamingIndex(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(inputValue); }
  };

  const supportsTools = modelSupportsFunctionCalling(modelId);

  // ── Render
  return (
    <div className="flex flex-col bg-background" style={{ height: '100dvh' }}>

      {/* Header */}
      <header className="h-11 border-b border-border/40 px-4 flex items-center justify-between bg-sidebar/20 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-text-muted/50 hover:text-text-muted transition-colors" title="Back">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="h-3.5 w-px bg-border/60" />
          <div className="flex items-center gap-1.5 opacity-50">
            <img src="/apple-touch-icon.png" alt="" className="w-4 h-4 grayscale" />
            <span className="text-[12px] font-bold text-text-heading tracking-tight">EulerFold AI</span>
          </div>
          {supportsTools && (
            <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 bg-accent/8 border border-accent/20 rounded text-[9px] font-bold uppercase tracking-widest text-accent">
              <Globe className="w-2.5 h-2.5" /> Tools
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeArtifact && (
            <button onClick={() => setActiveArtifactId(null)} title="Hide artifact panel" className="p-1.5 hover:bg-border/50 rounded text-accent/60 hover:text-accent transition-colors">
              <LayoutPanelLeft className="w-3.5 h-3.5" />
            </button>
          )}
          {messages.length > 0 && (
            <button onClick={clearConversation} title="Clear conversation" className="p-1.5 hover:bg-border/50 rounded text-text-muted/40 hover:text-text-muted transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-[10px] font-mono text-text-muted/40 tracking-wider hidden sm:block">LOCAL PLAYGROUND</span>
        </div>
      </header>

      {/* Loading overlay */}
      {isLoadingEngine && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-50 flex items-center justify-center p-6 text-center" style={{ top: '44px' }}>
          <div className="max-w-sm space-y-5">
            <Loader2 className="w-7 h-7 text-accent animate-spin mx-auto" />
            <div>
              <h3 className="text-[13px] font-bold text-text-heading uppercase tracking-wider mb-2">Loading Model</h3>
              <p className="text-[11.5px] font-mono text-accent bg-sidebar border border-border p-3 rounded leading-relaxed text-left select-all break-all">{loadingStatus}</p>
            </div>
            <p className="text-[11px] text-text-muted/70">Weights are cached in IndexedDB after first download.</p>
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">

        {/* Chat */}
        <div className={`flex flex-col overflow-hidden transition-all duration-300 ${activeArtifact ? 'w-[42%] min-w-[320px]' : 'w-full'}`}>
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-4 gap-8 max-w-2xl mx-auto">
                <div className="text-center space-y-2">
                  <div className="w-11 h-11 mx-auto bg-sidebar border border-border rounded-lg flex items-center justify-center mb-4">
                    <img src="/apple-touch-icon.png" alt="EulerFold" className="w-7 h-7" />
                  </div>
                  <h2 className="text-[17px] font-bold text-text-heading">{modelName}</h2>
                  <p className="text-[13px] text-text-muted leading-relaxed">
                    Running locally on your GPU. Private, offline, free.
                    {supportsTools && <span className="block mt-0.5 text-accent/80">Web search, URL reading, and live artifact preview are enabled.</span>}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                  {STARTER_PROMPTS.map(item => (
                    <button
                      key={item.label}
                      onClick={() => send(item.prompt)}
                      className="group text-left p-4 rounded-lg border border-border hover:border-accent/30 bg-sidebar/30 hover:bg-sidebar/60 transition-all"
                    >
                      <p className="text-[12px] font-bold text-text-muted/70 uppercase tracking-wider mb-1 group-hover:text-accent transition-colors">{item.label}</p>
                      <p className="text-[13px] text-text-primary leading-snug line-clamp-2">{item.prompt}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`mx-auto px-4 pt-6 pb-2 space-y-8 ${activeArtifact ? 'max-w-full' : 'max-w-3xl'}`}>
                {messages.map((message, i) => (
                  <div key={i}>
                    {message.role === 'user' ? (
                      <div className="flex justify-end">
                        <div className="max-w-[85%]">
                          <div className="bg-sidebar border border-border/80 rounded-2xl rounded-br-sm px-4 py-3">
                            <p className="text-[14px] text-text-primary leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-lg bg-sidebar border border-border/60 flex items-center justify-center shrink-0 mt-0.5">
                          <img src="/apple-touch-icon.png" alt="EulerFold" className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted/50 mb-2">{modelName}</p>

                          {message.toolActivities?.map(a => <ToolCallCard key={a.callId} activity={a} />)}

                          {!message.content && streamingIndex === i && (
                            <div className="flex items-center gap-1.5">
                              {[0, 150, 300].map(d => (
                                <span key={d} className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                              ))}
                            </div>
                          )}

                          {message.artifactId ? (
                            <>
                              {message.content.replace(/```[\s\S]*?```/gi, '').trim() && (
                                <MarkdownMessage
                                  content={message.content.replace(/```[\s\S]*?```/gi, '').trim()}
                                  streaming={streamingIndex === i}
                                />
                              )}
                              {artifacts.find(a => a.id === message.artifactId) && (
                                <ArtifactCard
                                  artifact={artifacts.find(a => a.id === message.artifactId)!}
                                  isActive={activeArtifactId === message.artifactId}
                                  onClick={() => setActiveArtifactId(
                                    activeArtifactId === message.artifactId ? null : message.artifactId!
                                  )}
                                />
                              )}
                            </>
                          ) : (
                            message.content && (
                              <MarkdownMessage content={message.content} streaming={streamingIndex === i} />
                            )
                          )}

                          {!isGenerating && message.content && !message.artifactId && (
                            <div className="flex items-center gap-1 mt-2">
                              <CopyButton text={message.content} />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Artifact panel */}
        {activeArtifact && (
          <div className="flex-1 min-w-0 overflow-hidden">
            <ArtifactPanel artifact={activeArtifact} onClose={() => setActiveArtifactId(null)} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border/40 bg-background px-4 pt-3 pb-4">
        <div className="max-w-3xl mx-auto space-y-2">
          {idleWarning && (
            <div className="flex items-center justify-between gap-2 px-3 py-2 bg-amber-500/8 border border-amber-500/20 rounded-lg text-[11px] text-amber-600 font-medium">
              <span>Model unloaded after 15 min of inactivity. It will reload on your next message.</span>
              <button onClick={() => setIdleWarning(false)} className="shrink-0 text-amber-500/70 hover:text-amber-500 transition-colors">✕</button>
            </div>
          )}
          <form
            onSubmit={e => { e.preventDefault(); send(inputValue); }}
            className="relative flex items-end gap-2 bg-sidebar border border-border rounded-xl px-4 py-3 focus-within:border-accent/40 transition-colors"
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-text-muted/70 hover:text-accent transition-colors shrink-0 pb-0.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline max-w-[110px] truncate">{modelName}</span>
            </button>
            <div className="h-4 w-px bg-border/70 self-center" />
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={supportsTools ? 'Ask anything or say "build me a ..."' : 'Message (Shift+Enter for new line)'}
              rows={1}
              className="flex-1 bg-transparent resize-none text-[13.5px] text-text-primary placeholder-text-muted/40 focus:outline-none leading-relaxed max-h-[180px] overflow-y-auto"
            />
            {isGenerating ? (
              <button
                type="button"
                onClick={() => { abortRef.current = true; setIsGenerating(false); setStreamingIndex(null); }}
                className="p-1.5 bg-border/60 hover:bg-border rounded-lg text-text-muted transition-colors shrink-0 self-end"
              >
                <StopCircle className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="p-1.5 bg-accent hover:opacity-90 disabled:opacity-30 text-white rounded-lg transition-all shrink-0 self-end"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>
          <div className="flex items-center justify-between px-1 text-[10px] text-text-muted/40 font-medium">
            <span className="flex items-center gap-1.5">
              {engine ? (
                <><span className="w-1.5 h-1.5 bg-green-500 rounded-full" />Ready{supportsTools && <span className="text-accent/60 ml-1">· tools on</span>}</>
              ) : isLoadingEngine ? (
                <><Loader2 className="w-2.5 h-2.5 animate-spin text-accent" />Loading</>
              ) : (
                <><span className="w-1.5 h-1.5 bg-border rounded-full" />Unloaded</>
              )}
            </span>
            <span>IndexedDB · Private · WebGPU</span>
          </div>
        </div>
      </div>

      <LocalAIModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectModel={(id, name) => {
          localStorage.setItem('localAIModelId', id);
          localStorage.setItem('localAIModelName', name);
          localStorage.setItem('local_ai_model', id);
          localStorage.setItem('local_ai_model_name', name);
          setModelId(id);
          setModelName(name);
          setEngine(null);
          clearConversation();
        }}
      />
    </div>
  );
}
