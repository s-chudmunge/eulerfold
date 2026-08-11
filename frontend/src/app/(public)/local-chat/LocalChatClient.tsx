"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send, Layers, RefreshCw, Loader2, ArrowLeft,
  Copy, Check, Trash2, ChevronDown, StopCircle
} from 'lucide-react';
import { LocalAIModal } from '@/components/landing/LocalAIModal';
import { CreateMLCEngine } from '@mlc-ai/web-llm';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STARTER_PROMPTS = [
  { label: 'Explain a concept', prompt: 'Explain how transformers work in machine learning, step by step.' },
  { label: 'Write code', prompt: 'Write a Python function to implement binary search with type annotations.' },
  { label: 'Summarize text', prompt: 'Summarize the key ideas of the paper "Attention Is All You Need" in 5 bullet points.' },
  { label: 'Debug help', prompt: 'What are the most common causes of memory leaks in JavaScript, and how do I fix them?' },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button onClick={copy} className="p-1.5 hover:bg-border/60 rounded text-text-muted/60 hover:text-text-muted transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function MarkdownMessage({ content, streaming }: { content: string; streaming?: boolean }) {
  return (
    <div className="prose-chat text-[14px] leading-[1.7] text-text-primary">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const inline = !match;
            if (inline) {
              return (
                <code
                  className="bg-border/50 text-text-heading px-1.5 py-0.5 rounded text-[13px] font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <div className="my-3 rounded-lg overflow-hidden border border-border/60 text-[13px]">
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#1a1a2e] border-b border-white/10">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/50">
                    {match?.[1] || 'code'}
                  </span>
                  <CopyButton text={String(children).replace(/\n$/, '')} />
                </div>
                <SyntaxHighlighter
                  style={oneDark}
                  language={match?.[1] || 'text'}
                  PreTag="div"
                  customStyle={{ margin: 0, borderRadius: 0, fontSize: '13px', padding: '14px' }}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            );
          },
          p({ children }) {
            return <p className="mb-3 last:mb-0 leading-[1.75]">{children}</p>;
          },
          ul({ children }) {
            return <ul className="list-disc list-outside ml-4 mb-3 space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-outside ml-4 mb-3 space-y-1">{children}</ol>;
          },
          li({ children }) {
            return <li className="text-text-primary leading-relaxed">{children}</li>;
          },
          h1({ children }) { return <h1 className="text-lg font-bold text-text-heading mb-2 mt-4">{children}</h1>; },
          h2({ children }) { return <h2 className="text-base font-bold text-text-heading mb-2 mt-4">{children}</h2>; },
          h3({ children }) { return <h3 className="text-[14px] font-bold text-text-heading mb-1.5 mt-3">{children}</h3>; },
          blockquote({ children }) {
            return <blockquote className="border-l-2 border-accent/40 pl-4 my-3 text-text-muted italic">{children}</blockquote>;
          },
          table({ children }) {
            return <div className="overflow-x-auto my-3"><table className="border-collapse text-[13px] w-full">{children}</table></div>;
          },
          th({ children }) {
            return <th className="border border-border px-3 py-1.5 text-left text-[12px] font-bold uppercase tracking-wide text-text-muted bg-sidebar">{children}</th>;
          },
          td({ children }) {
            return <td className="border border-border px-3 py-1.5 text-text-primary">{children}</td>;
          },
          hr() { return <hr className="border-border/50 my-4" />; },
          strong({ children }) { return <strong className="font-semibold text-text-heading">{children}</strong>; },
          a({ href, children }) {
            return <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2 hover:opacity-80">{children}</a>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
      {streaming && (
        <span className="inline-block w-[2px] h-[1em] bg-accent ml-0.5 align-middle animate-pulse rounded" />
      )}
    </div>
  );
}

export default function LocalChatClient() {
  const [modelId, setModelId] = useState('Llama-3.2-1B-Instruct-q4f16_1-MLC');
  const [modelName, setModelName] = useState('Llama 3.2 1B');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [engine, setEngine] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [isLoadingEngine, setIsLoadingEngine] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingIndex, setStreamingIndex] = useState<number | null>(null);
  const [idleWarning, setIdleWarning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<boolean>(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const IDLE_MS = 15 * 60 * 1000; // 15 minutes

  const resetIdleTimer = useCallback((currentEngine: any) => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    setIdleWarning(false);
    idleTimerRef.current = setTimeout(async () => {
      try { await currentEngine.unload(); } catch {}
      setEngine(null);
      setIdleWarning(true);
    }, IDLE_MS);
  }, []);

  useEffect(() => {
    const savedId = localStorage.getItem('localAIModelId') || localStorage.getItem('local_ai_model');
    const savedName = localStorage.getItem('localAIModelName') || localStorage.getItem('local_ai_model_name');
    if (savedId) setModelId(savedId);
    if (savedName) setModelName(savedName);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clear idle timer on unmount
  useEffect(() => {
    return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 180) + 'px';
  }, [inputValue]);

  const initEngine = async (selectedModelId: string) => {
    setIsLoadingEngine(true);
    setLoadingStatus('Initializing WebGPU adapter...');
    if (engine) {
      try { await engine.unload(); } catch {}
      setEngine(null);
    }
    try {
      const webLlmEngine = await CreateMLCEngine(selectedModelId, {
        initProgressCallback: (r: { text: string }) => setLoadingStatus(r.text),
      });
      setEngine(webLlmEngine);
      setLoadingStatus('');
      setIdleWarning(false);
      resetIdleTimer(webLlmEngine);
    } catch (err: any) {
      console.error(err);
      setLoadingStatus('Failed to load model. Check device memory.');
    } finally {
      setIsLoadingEngine(false);
    }
  };

  const send = async (text: string) => {
    if (!text.trim() || isGenerating) return;

    let activeEngine = engine;
    if (!activeEngine) {
      setIsLoadingEngine(true);
      try {
        activeEngine = await CreateMLCEngine(modelId, {
          initProgressCallback: (r: { text: string }) => setLoadingStatus(r.text),
        });
        setEngine(activeEngine);
        setLoadingStatus('');
        setIdleWarning(false);
      } catch (err) {
        setLoadingStatus('Failed to load model. Check device memory.');
        setIsLoadingEngine(false);
        return;
      } finally {
        setIsLoadingEngine(false);
      }
    }

    resetIdleTimer(activeEngine);

    const userMessage: Message = { role: 'user', content: text.trim() };
    const chatHistory = [...messages, userMessage];
    const assistantIdx = chatHistory.length;
    setMessages([...chatHistory, { role: 'assistant', content: '' }]);
    setInputValue('');
    setIsGenerating(true);
    setStreamingIndex(assistantIdx);
    abortRef.current = false;

    try {
      const responseStream = await activeEngine.chat.completions.create({
        messages: chatHistory.map(m => ({ role: m.role, content: m.content })),
        stream: true,
      });

      let fullContent = '';
      for await (const chunk of responseStream) {
        if (abortRef.current) break;
        const delta = chunk.choices[0]?.delta?.content || '';
        fullContent += delta;
        setMessages(prev => {
          const updated = [...prev];
          updated[assistantIdx] = { role: 'assistant', content: fullContent };
          return updated;
        });
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[assistantIdx] = {
          role: 'assistant',
          content: 'Error: Inference failed. This usually occurs when browser VRAM limits are exceeded. Try a smaller model.'
        };
        return updated;
      });
    } finally {
      setIsGenerating(false);
      setStreamingIndex(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(inputValue);
    }
  };

  const handleStop = () => {
    abortRef.current = true;
    setIsGenerating(false);
    setStreamingIndex(null);
  };

  return (
    <div className="flex flex-col bg-background" style={{ height: '100dvh' }}>

      {/* Slim branding bar */}
      <header className="h-11 border-b border-border/40 px-4 flex items-center justify-between bg-sidebar/20 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-text-muted/50 hover:text-text-muted transition-colors" title="Back">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="h-3.5 w-px bg-border/60" />
          <div className="flex items-center gap-1.5 opacity-50">
            <img src="/apple-touch-icon.png" alt="" className="w-4 h-4 grayscale" />
            <span className="text-[12px] font-bold text-text-heading tracking-tight">EulerFold AI</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              title="Clear conversation"
              className="p-1.5 hover:bg-border/50 rounded text-text-muted/40 hover:text-text-muted transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-[10px] font-mono text-text-muted/40 tracking-wider hidden sm:block">
            LOCAL PLAYGROUND
          </span>
        </div>
      </header>

      {/* Loading overlay */}
      {isLoadingEngine && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-50 flex items-center justify-center p-6 text-center" style={{ top: '44px' }}>
          <div className="max-w-sm space-y-5">
            <Loader2 className="w-7 h-7 text-accent animate-spin mx-auto" />
            <div>
              <h3 className="text-[13px] font-bold text-text-heading uppercase tracking-wider mb-2">Loading Model</h3>
              <p className="text-[11.5px] font-mono text-accent bg-sidebar border border-border p-3 rounded leading-relaxed text-left select-all break-all">
                {loadingStatus}
              </p>
            </div>
            <p className="text-[11px] text-text-muted/70">
              Weights are cached in IndexedDB after the first download.
            </p>
          </div>
        </div>
      )}

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full px-4 gap-8 max-w-2xl mx-auto">
            <div className="text-center space-y-2">
              <div className="w-11 h-11 mx-auto bg-sidebar border border-border rounded-lg flex items-center justify-center mb-4">
                <img src="/apple-touch-icon.png" alt="EulerFold" className="w-7 h-7" />
              </div>
              <h2 className="text-[17px] font-bold text-text-heading">
                {modelName}
              </h2>
              <p className="text-[13px] text-text-muted leading-relaxed">
                Running locally on your GPU via WebGPU. Private, offline, and free.
              </p>
            </div>

            {/* Starter prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
              {STARTER_PROMPTS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => send(item.prompt)}
                  className="group text-left p-4 rounded-lg border border-border hover:border-accent/30 bg-sidebar/30 hover:bg-sidebar/60 transition-all"
                >
                  <p className="text-[12px] font-bold text-text-muted/70 uppercase tracking-wider mb-1 group-hover:text-accent transition-colors">
                    {item.label}
                  </p>
                  <p className="text-[13px] text-text-primary leading-snug line-clamp-2">
                    {item.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Message thread
          <div className="max-w-3xl mx-auto px-4 pt-6 pb-2 space-y-8">
            {messages.map((message, i) => (
              <div key={i}>
                {message.role === 'user' ? (
                  // User message
                  <div className="flex justify-end">
                    <div className="max-w-[82%]">
                      <div className="bg-sidebar border border-border/80 rounded-2xl rounded-br-sm px-4 py-3">
                        <p className="text-[14px] text-text-primary leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Assistant message
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-sidebar border border-border/60 flex items-center justify-center shrink-0 mt-0.5">
                      <img src="/apple-touch-icon.png" alt="EulerFold" className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted/50 mb-2">
                        {modelName}
                      </p>
                      {message.content ? (
                        <MarkdownMessage
                          content={message.content}
                          streaming={streamingIndex === i}
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-text-muted">
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      )}
                      {!isGenerating && message.content && (
                        <div className="flex items-center gap-1 mt-2 opacity-0 hover:opacity-100 transition-opacity group-hover:opacity-100">
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

      {/* Input area */}
      <div className="shrink-0 border-t border-border/40 bg-background px-4 pt-3 pb-4">
        <div className="max-w-3xl mx-auto space-y-2">
          {idleWarning && (
            <div className="flex items-center justify-between gap-2 px-3 py-2 bg-amber-500/8 border border-amber-500/20 rounded-lg text-[11px] text-amber-600 font-medium">
              <span>Model unloaded after 15 min of inactivity. It will reload automatically on your next message.</span>
              <button onClick={() => setIdleWarning(false)} className="shrink-0 text-amber-500/70 hover:text-amber-500 transition-colors">✕</button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-sidebar border border-border rounded-xl px-4 py-3 focus-within:border-accent/40 transition-colors">
            
            {/* Model switcher */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-text-muted/70 hover:text-accent transition-colors shrink-0 pb-0.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline max-w-[100px] truncate">{modelName}</span>
            </button>

            <div className="h-4 w-px bg-border/70 self-center" />

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message (Shift+Enter for new line)"
              rows={1}
              className="flex-1 bg-transparent resize-none text-[13.5px] text-text-primary placeholder-text-muted/40 focus:outline-none leading-relaxed max-h-[180px] overflow-y-auto"
            />

            {/* Stop / Send */}
            {isGenerating ? (
              <button
                type="button"
                onClick={handleStop}
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

          {/* Footer */}
          <div className="flex items-center justify-between px-1 text-[10px] text-text-muted/40 font-medium">
            <span className="flex items-center gap-1.5">
              {engine ? (
                <><span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />Ready</>
              ) : isLoadingEngine ? (
                <><Loader2 className="w-2.5 h-2.5 animate-spin text-accent" />Loading</>
              ) : (
                <><span className="w-1.5 h-1.5 bg-border rounded-full inline-block" />Unloaded</>
              )}
            </span>
            <span>IndexedDB Cache · Private · WebGPU</span>
          </div>
        </div>
      </div>

      <LocalAIModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectModel={(selectedId, selectedName) => {
          localStorage.setItem('localAIModelId', selectedId);
          localStorage.setItem('localAIModelName', selectedName);
          localStorage.setItem('local_ai_model', selectedId);
          localStorage.setItem('local_ai_model_name', selectedName);
          setModelId(selectedId);
          setModelName(selectedName);
          setEngine(null);
        }}
      />
    </div>
  );
}
