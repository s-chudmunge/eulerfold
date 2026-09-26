"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { roadmapsAPI, RoadmapData } from '@/lib/api';
import { 
  Loader, 
  AlertCircle, 
  Mountain,
  Target,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  LogIn,
  Clock,
  Flag,
  X,
  Pause,
  Play,
  CheckCircle2,
  RotateCcw,
  Cpu
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import PaymentModal from '../PaymentModal';
import { OpenRouterModal } from './OpenRouterModal';
import LocalAIModal from './LocalAIModal';
import AiEngineSelector from '@/components/settings/AiEngineSelector';
import { CreateMLCEngine } from '@mlc-ai/web-llm';
import { jsonrepair } from 'jsonrepair';
import { api } from '@/lib/api';
import { logAIUsage } from '@/lib/usageTracker';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  return (
    <div className={`prose-eulerfold inline-math-container ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children }) => <span className="inline leading-relaxed">{children}</span>,
          h1: ({ children }) => <span className="font-bold text-lg inline">{children}</span>,
          h2: ({ children }) => <span className="font-bold text-base inline">{children}</span>,
          h3: ({ children }) => <span className="font-semibold text-base inline">{children}</span>,
          ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-2">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          code: ({ inline, className: codeClass, children, ...props }: any) => {
            const str = String(children || '');
            if (inline || (!codeClass && !str.includes('\n'))) {
              return (
                <code className="bg-background px-1.5 py-0.5 rounded text-[13px] font-mono border border-border text-accent font-medium inline-block mx-0.5" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <pre className="p-3 bg-sidebar text-text-primary rounded-md overflow-x-auto text-[13px] font-mono my-2 border border-border">
                <code>{children}</code>
              </pre>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

interface KnowledgeGapQuizProps {
  onRoadmapGenerated: (data: RoadmapData, formData: any) => void;
  onLoadingChange?: (loading: boolean) => void;
  initialTargetRole?: string;
  initialTimeValue?: number;
  initialEngine?: 'eulerfold' | 'openrouter' | 'local';
  localModelId?: string | null;
  onClose?: () => void;
  hideEngineSelector?: boolean;
}

const KnowledgeGapQuiz: React.FC<KnowledgeGapQuizProps> = ({ 
  onRoadmapGenerated,
  onLoadingChange,
  initialTargetRole,
  initialTimeValue,
  initialEngine,
  localModelId,
  onClose,
  hideEngineSelector
}) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    target_role: initialTargetRole || '',
    known_skills: '',
    time_value: initialTimeValue || 4,
    strict_official_sources: false,
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizActive, setQuizActive] = useState(false);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([]);
  const [flaggedQuestions, setFlaggedQuestions] = useState<boolean[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(600);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState<boolean>(false);
  const [isConfirmSubmitModalOpen, setIsConfirmSubmitModalOpen] = useState<boolean>(false);
  const [quizRound, setQuizRound] = useState<number>(1);
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [diagnosticReason, setDiagnosticReason] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [pendingAssessment, setPendingAssessment] = useState<any | null>(null);
  const isSubmittingRef = useRef<boolean>(false);

  const [openRouterKey, setOpenRouterKey] = useState<string | null>(null);
  const [useOpenRouter, setUseOpenRouter] = useState(false);
  const [openRouterModel, setOpenRouterModel] = useState<string | null>(null);
  const [localAIModelId, setLocalAIModelId] = useState<string | null>(null);
  const [useLocalAI, setUseLocalAI] = useState(false);
  const [localAIStatus, setLocalAIStatus] = useState<string | null>(null);
  const [isOpenRouterModalOpen, setIsOpenRouterModalOpen] = useState<boolean>(false);
  const [isLocalAIModalOpen, setIsLocalAIModalOpen] = useState<boolean>(false);

  const handleSelectEngine = (selected: 'default' | 'openrouter' | 'localai') => {
    if (selected === 'default') {
      localStorage.setItem('use_openrouter', 'false');
      localStorage.setItem('use_local_ai', 'false');
      setUseOpenRouter(false);
      setUseLocalAI(false);
    } else if (selected === 'openrouter') {
      localStorage.setItem('use_openrouter', 'true');
      localStorage.setItem('use_local_ai', 'false');
      setUseOpenRouter(true);
      setUseLocalAI(false);
      if (!openRouterKey) {
        setIsOpenRouterModalOpen(true);
      }
    } else if (selected === 'localai') {
      localStorage.setItem('use_openrouter', 'false');
      localStorage.setItem('use_local_ai', 'true');
      setUseOpenRouter(false);
      setUseLocalAI(true);
      if (!localAIModelId) {
        setIsLocalAIModalOpen(true);
      }
    }
    window.dispatchEvent(new Event('ai_settings_changed'));
  };

  // Check for unfinished diagnostic draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('active_diagnostic_quiz');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.quizQuestions && parsed.quizQuestions.length > 0 && !parsed.courseGenerated) {
          setPendingAssessment(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load saved diagnostic draft:", e);
    }
  }, []);

  // Save active quiz state to localStorage when active
  useEffect(() => {
    if (quizActive && quizQuestions.length > 0) {
      try {
        localStorage.setItem('active_diagnostic_quiz', JSON.stringify({
          formData,
          quizQuestions,
          quizAnswers,
          flaggedQuestions,
          timeLeft,
          quizRound,
          quizHistory,
          diagnosticReason,
          courseGenerated: false,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.error("Failed to save active diagnostic quiz draft:", e);
      }
    }
  }, [quizActive, quizQuestions, quizAnswers, flaggedQuestions, timeLeft, quizRound, quizHistory, diagnosticReason, formData]);

  const resumePendingAssessment = () => {
    if (!pendingAssessment) return;
    setFormData({
      target_role: toRenderableString(pendingAssessment.formData?.target_role || formData.target_role),
      known_skills: toRenderableString(pendingAssessment.formData?.known_skills || formData.known_skills),
      time_value: pendingAssessment.formData?.time_value || formData.time_value,
      strict_official_sources: pendingAssessment.formData?.strict_official_sources || formData.strict_official_sources
    });
    setQuizQuestions(sanitizeQuestions(pendingAssessment.quizQuestions || []));
    setQuizAnswers(pendingAssessment.quizAnswers || []);
    setFlaggedQuestions(pendingAssessment.flaggedQuestions || []);
    setTimeLeft(pendingAssessment.timeLeft || 900);
    setQuizRound(pendingAssessment.quizRound || 1);
    setQuizHistory(pendingAssessment.quizHistory || []);
    setDiagnosticReason(toRenderableString(pendingAssessment.diagnosticReason) || null);
    setQuizActive(true);
  };

  const discardPendingAssessment = () => {
    localStorage.removeItem('active_diagnostic_quiz');
    setPendingAssessment(null);
    setQuizHistory([]);
  };

  useEffect(() => {
    setOpenRouterKey(localStorage.getItem('openrouter_key'));
    setUseOpenRouter(localStorage.getItem('use_openrouter') === 'true');
    setOpenRouterModel(localStorage.getItem('openrouter_model') || 'openai/gpt-4o');
    setLocalAIModelId(localStorage.getItem('local_ai_model'));
    setUseLocalAI(localStorage.getItem('use_local_ai') === 'true');
    
    const handleStorageChange = () => {
        setOpenRouterKey(localStorage.getItem('openrouter_key'));
        setUseOpenRouter(localStorage.getItem('use_openrouter') === 'true');
        setOpenRouterModel(localStorage.getItem('openrouter_model') || 'openai/gpt-4o');
        setLocalAIModelId(localStorage.getItem('local_ai_model'));
        setUseLocalAI(localStorage.getItem('use_local_ai') === 'true');
    };
    window.addEventListener('ai_settings_changed', handleStorageChange);
    return () => window.removeEventListener('ai_settings_changed', handleStorageChange);
  }, []);

  useEffect(() => {
    if (initialTargetRole) {
      setFormData(prev => ({
        ...prev,
        target_role: initialTargetRole,
        time_value: initialTimeValue || prev.time_value
      }));
    }
  }, [initialTargetRole, initialTimeValue]);

  useEffect(() => {
    if (initialEngine === 'local') {
      setUseLocalAI(true);
      setUseOpenRouter(false);
      if (localModelId) setLocalAIModelId(localModelId);
    } else if (initialEngine === 'openrouter') {
      setUseOpenRouter(true);
      setUseLocalAI(false);
    }
  }, [initialEngine, localModelId]);

  const fetchProfileAndCredits = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('roadmap_credits, is_pro')
          .eq('supabase_uid', session.user.id)
          .single();
        if (data) {
          setCredits(data.roadmap_credits);
          setIsPro(data.is_pro);
          setIsLoggedIn(true);
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch (e) {
      console.debug("Failed to fetch profile credits:", e);
    }
  }, []);

  useEffect(() => {
    fetchProfileAndCredits();
  }, [fetchProfileAndCredits]);

  useEffect(() => {
    onLoadingChange?.(isGenerating);
  }, [isGenerating, onLoadingChange]);

  // Timer effect for full-page diagnostic test
  useEffect(() => {
    if (!quizActive || isTimerPaused || isGenerating) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          evaluateOrSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizActive, isTimerPaused, isGenerating]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (!quizActive || isExitModalOpen || isConfirmSubmitModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === '1' || e.key === 'a' || e.key === 'A') {
        selectOption(0);
      } else if (e.key === '2' || e.key === 'b' || e.key === 'B') {
        selectOption(1);
      } else if (e.key === '3' || e.key === 'c' || e.key === 'C') {
        selectOption(2);
      } else if (e.key === '4' || e.key === 'd' || e.key === 'D') {
        selectOption(3);
      } else if (e.key === 'ArrowLeft' || e.key === '[') {
        if (currentQuizIdx > 0) setCurrentQuizIdx(prev => prev - 1);
      } else if (e.key === 'ArrowRight' || e.key === ']') {
        if (currentQuizIdx < quizQuestions.length - 1) setCurrentQuizIdx(prev => prev + 1);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFlagQuestion(currentQuizIdx);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quizActive, currentQuizIdx, quizQuestions.length, isExitModalOpen, isConfirmSubmitModalOpen]);

  const selectOption = (optionIndex: number) => {
    setQuizAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuizIdx] = optionIndex;
      return newAnswers;
    });
  };

  const toggleFlagQuestion = (idx: number) => {
    setFlaggedQuestions(prev => {
      const newFlags = [...prev];
      newFlags[idx] = !newFlags[idx];
      return newFlags;
    });
  };

  const clearSelection = () => {
    setQuizAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuizIdx] = null;
      return newAnswers;
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toRenderableString = (val: any): string => {
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    if (typeof val === 'object' && val !== null) {
      if (typeof val.basics === 'string') return val.basics;
      if (typeof val.text === 'string') return val.text;
      if (typeof val.option === 'string') return val.option;
      if (typeof val.choice === 'string') return val.choice;
      if (typeof val.value === 'string') return val.value;
      if (typeof val.title === 'string') return val.title;
      if (typeof val.label === 'string') return val.label;
      const innerVals = Object.values(val).map(v => typeof v === 'object' ? JSON.stringify(v) : String(v));
      return innerVals.join(' ').trim();
    }
    return '';
  };

  const sanitizeQuestions = (rawArr: any[]): any[] => {
    if (!Array.isArray(rawArr)) return [];
    const sanitized: any[] = [];
    for (let i = 0; i < rawArr.length; i++) {
      const q = rawArr[i];
      if (!q || typeof q !== 'object') continue;
      const question = toRenderableString(q.question);
      if (!question) continue;

      let rawOptions = Array.isArray(q.options) ? q.options : (Array.isArray(q.choices) ? q.choices : []);
      if (!Array.isArray(rawOptions) || rawOptions.length === 0) continue;

      const options = rawOptions.map((opt: any) => toRenderableString(opt)).filter(Boolean);
      if (options.length < 2) continue;

      while (options.length < 4) {
        options.push(`Option ${String.fromCharCode(65 + options.length)}`);
      }

      sanitized.push({
        ...q,
        id: toRenderableString(q.id) || `q${i + 1}`,
        question,
        options: options.slice(0, 4),
        difficulty_tier: toRenderableString(q.difficulty_tier) || undefined,
        tier_number: typeof q.tier_number === 'number' ? q.tier_number : (typeof q.tier === 'number' ? q.tier : undefined),
        correct_answer_index: (typeof q.correct_answer_index === 'number' && q.correct_answer_index >= 0 && q.correct_answer_index < 4)
          ? q.correct_answer_index
          : 0,
        explanation: toRenderableString(q.explanation),
        source: toRenderableString(q.source) || "local_webgpu"
      });
    }
    return sanitized;
  };

  const extractQuestionsFromChunk = (rawText: string) => {
    let text = rawText.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    if (text.startsWith("```json")) text = text.replace(/^```json\n?/, "").replace(/```$/, "");
    else if (text.startsWith("```")) text = text.replace(/^```\n?/, "").replace(/```$/, "");

    // 1. Try whole-block repair first
    try {
      const parsed = JSON.parse(jsonrepair(text));
      let arr: any[] = [];
      if (Array.isArray(parsed)) {
        arr = parsed;
      } else if (typeof parsed === 'object' && parsed !== null) {
        arr = parsed.questions || parsed.data || parsed.quiz || parsed.basics || (Object.values(parsed).find(Array.isArray) as any[]) || [];
      }
      const valid = sanitizeQuestions(arr);
      if (valid.length > 0) return valid;
    } catch (e) {}

    // 2. Regex fallback for partial stream tokens
    const rawQuestions: any[] = [];
    const objectRegex = /\{[^{}]*"question"\s*:\s*(?:"[\s\S]*?"|\{[^{}]*\})[^{}]*"options"\s*:\s*\[[\s\S]*?\][^{}]*\}/gi;
    let match;
    while ((match = objectRegex.exec(text)) !== null) {
      try {
        const parsedObj = JSON.parse(jsonrepair(match[0]));
        if (parsedObj) rawQuestions.push(parsedObj);
      } catch (e) {}
    }

    return sanitizeQuestions(rawQuestions);
  };

  const handleStartQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.target_role || !formData.known_skills) return;

    if (!((openRouterKey && useOpenRouter) || (localAIModelId && useLocalAI)) && credits !== null && credits < 1) {
      setIsPaymentModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setError(null);

    const roleNormalized = (formData.target_role || '').trim().toLowerCase();
    const directCategories = [
      'philosophy', 'college_computer_science', 'computer_security', 'machine_learning',
      'high_school_computer_science', 'college_mathematics', 'high_school_mathematics',
      'high_school_statistics', 'mechanical_engineering', 'electrical_engineering', 'college_physics', 'college_chemistry',
      'medical_genetics', 'college_biology', 'anatomy', 'college_medicine', 'clinical_medicine',
      'professional_accounting', 'management', 'marketing', 'business_ethics', 'professional_law',
      'high_school_psychology', 'sociology', 'code_comprehension', 'cs_algorithms',
      'science_inquiry', 'advanced_reasoning'
    ];

    // Step 1: Classify domain using direct match or selected AI engine
    let resolvedConfig: { category?: string; domain?: string; search_keywords?: string[] } = {};

    if (directCategories.includes(roleNormalized) || roleNormalized === 'mechanical engineering' || roleNormalized === 'mechanical engineer') {
      const catKey = (roleNormalized === 'mechanical engineering' || roleNormalized === 'mechanical engineer') ? 'mechanical_engineering' : roleNormalized;
      resolvedConfig = {
        domain: 'Mechanical Engineering',
        category: catKey,
        search_keywords: ['mechanics', 'thermodynamics', 'force', 'energy', 'torque']
      };
    } else {
      const classifyPrompt = `You are an expert psychometric assessment classifier.
Analyze the target role and skills, then match them to the SINGLE BEST category key from the allowed list:

Allowed Categories:
- philosophy (for philosophy, ethics, epistemology, reasoning)
- college_computer_science (for computer science, systems, programming languages)
- computer_security (for cybersecurity, networks, vulnerabilities)
- machine_learning (for machine learning, AI, data science)
- high_school_computer_science (for basic programming concepts)
- college_mathematics (for calculus, linear algebra, geometry, proofs)
- high_school_mathematics (for algebra, geometry, trigonometry)
- high_school_statistics (for statistics and probability)
- mechanical_engineering (for mechanical engineering, mechanics, thermodynamics, fluid mechanics, CAD, robotics, materials)
- electrical_engineering (for electronics, circuits, hardware, signals)
- college_physics (for physics, mechanics, thermodynamics)
- college_chemistry (for chemistry, biochemistry)
- medical_genetics (for medical genetics and inheritance)
- college_biology (for biology, ecology, evolution)
- anatomy (for human anatomy and physiology)
- college_medicine (for medical principles)
- clinical_medicine (for clinical medicine and pharmacology)
- professional_accounting (for accounting, audits, financial statements)
- management (for operations and business management)
- marketing (for marketing, branding, acquisitions)
- business_ethics (for corporate governance and ethics)
- professional_law (for jurisprudence and legal reasoning)
- high_school_psychology (for behavioral sciences)
- sociology (for social dynamics and sociology)
- code_comprehension (for software engineering and code reading)
- cs_algorithms (for algorithms and data structures)
- science_inquiry (for science inquiry and empirical reasoning)
- advanced_reasoning (for advanced multidisciplinary graduate assessment)

Target Role: "${formData.target_role}"
Known Skills: "${formData.known_skills}"

CRITICAL: "category" must be one of the exact allowed category keys above that fits "${formData.target_role}".

Return JSON ONLY in this format:
{"domain":"<high-level domain>","category":"<selected_category_key>","search_keywords":["keyword1","keyword2"]}`;

      try {
        if (useLocalAI && localAIModelId) {
          // Local WebGPU — stream loading progress to the user
          setLocalAIStatus('Initializing local model...');
          const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
          const engine = await CreateMLCEngine(localAIModelId, {
            initProgressCallback: (r: any) => {
              setLocalAIStatus(r.text || 'Loading model...');
            }
          });
          const res = await engine.chat.completions.create({
            messages: [{ role: 'user', content: classifyPrompt }],
            max_tokens: 256,
          });
          const text = res.choices?.[0]?.message?.content || '';
          resolvedConfig = JSON.parse(jsonrepair(text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()));
        } else if (useOpenRouter && openRouterKey) {
          // OpenRouter
          const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openRouterKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': window.location.origin,
            },
            body: JSON.stringify({
              model: openRouterModel || 'openai/gpt-4o',
              messages: [{ role: 'user', content: classifyPrompt }],
              response_format: { type: 'json_object' },
              max_tokens: 256,
            })
          });
          if (orRes.ok) {
            const orData = await orRes.json();
            const text = orData.choices?.[0]?.message?.content || '';
            resolvedConfig = JSON.parse(jsonrepair(text));
          }
        }
      } catch (classifyErr) {
        console.warn('[Diagnostic] Frontend AI classification failed, backend will classify:', classifyErr);
        resolvedConfig = {};
        setLocalAIStatus(null);
      }
    }

    let accumulatedText = '';
    let testStarted = false;

    const processChunk = (chunkText: string) => {
      accumulatedText += chunkText;
      const extracted = extractQuestionsFromChunk(accumulatedText);
      if (extracted.length > 0) {
        setQuizQuestions(extracted);
        setQuizAnswers(prev => {
          const next = [...prev];
          while (next.length < extracted.length) next.push(null);
          return next;
        });
        setFlaggedQuestions(prev => {
          const next = [...prev];
          while (next.length < extracted.length) next.push(false);
          return next;
        });

        // Launch test immediately as soon as at least 1 question is ready!
        if (!testStarted) {
          testStarted = true;
          setTimeLeft(900);
          setIsTimerPaused(false);
          setQuizActive(true);
          setIsGenerating(false);
        }
      }
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
      const streamResponse = await fetch(`${backendUrl}/roadmaps/generate-diagnostic-quiz-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({
          target_role: formData.target_role,
          known_skills: formData.known_skills,
          question_count: 10,
          ...(resolvedConfig.category ? {
            category: resolvedConfig.category,
            domain: resolvedConfig.domain,
            search_keywords: resolvedConfig.search_keywords,
          } : {})
        })
      });

      if (streamResponse.ok && streamResponse.body) {
        const reader = streamResponse.body.getReader();
        const decoder = new TextDecoder('utf-8');
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunkText = decoder.decode(value, { stream: true });
          if (chunkText) processChunk(chunkText);
        }
      } else {
        // Fallback to standard endpoint if stream is unavailable
        const quizData = await roadmapsAPI.generateDiagnosticQuiz({
          target_role: formData.target_role,
          known_skills: formData.known_skills,
          question_count: 10,
          ...(resolvedConfig.category ? {
            category: resolvedConfig.category,
            domain: resolvedConfig.domain,
            search_keywords: resolvedConfig.search_keywords,
          } : {})
        });
        setQuizQuestions(sanitizeQuestions(quizData));
        setQuizAnswers(new Array(quizData.length).fill(null));
        setFlaggedQuestions(new Array(quizData.length).fill(false));
        setTimeLeft(900);
        setIsTimerPaused(false);
        setQuizActive(true);
      }

      // Ensure final parsing pass if test hasn't started yet
      const finalExtracted = extractQuestionsFromChunk(accumulatedText);
      if (finalExtracted.length > 0) {
        setQuizQuestions(finalExtracted);
        if (!testStarted) {
          setQuizAnswers(new Array(finalExtracted.length).fill(null));
          setFlaggedQuestions(new Array(finalExtracted.length).fill(false));
          setTimeLeft(900);
          setIsTimerPaused(false);
          setQuizActive(true);
        }
      } else if (!testStarted) {
        let errorMsg = 'Failed to generate diagnostic quiz questions. Please try again.';
        try {
          const parsed = JSON.parse(accumulatedText);
          if (parsed.error) errorMsg = parsed.error;
        } catch (_) {}
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      await fetchProfileAndCredits();
      setError(err.response?.data?.detail || err.message || 'Failed to generate diagnostic quiz. No credit was deducted.');
      setQuizActive(false);
    } finally {
      setIsGenerating(false);
      setLocalAIStatus(null);
    }
  };


  const handleAttemptSubmit = () => {
    if (isSubmittingRef.current || isEvaluating || isGenerating) return;
    const unansweredCount = quizAnswers.filter(a => a === null).length;
    if (unansweredCount > 0) {
      setIsConfirmSubmitModalOpen(true);
    } else {
      evaluateOrSubmitQuiz();
    }
  };

  const exitAssessment = () => {
    isSubmittingRef.current = false;
    setQuizActive(false);
    setQuizQuestions([]);
    setQuizAnswers([]);
    setFlaggedQuestions([]);
    setQuizRound(1);
    setQuizHistory([]);
    setDiagnosticReason(null);
    setIsExitModalOpen(false);
    setIsConfirmSubmitModalOpen(false);
    setIsEvaluating(false);
  };

  const evaluateOrSubmitQuiz = async () => {
    if (isSubmittingRef.current || isEvaluating || isGenerating) return;
    isSubmittingRef.current = true;
    setIsConfirmSubmitModalOpen(false);
    setError(null);
    setIsEvaluating(true);

    // Compact scorecard payload: strips redundant full options and verbose text to save 90% prompt tokens
    const compactScorecard = quizQuestions.map((q, i) => ({
      q: i + 1,
      tier: q.tier_number || (i < 2 ? 1 : i < 4 ? 2 : i < 6 ? 3 : i < 8 ? 4 : 5),
      topic: typeof q.question === 'string' ? q.question.substring(0, 100) : "Question",
      correct: quizAnswers[i] === q.correct_answer_index,
      selected: quizAnswers[i] !== null ? q.options[quizAnswers[i]!] : "Unanswered",
      expected: q.options[q.correct_answer_index],
    }));

    try {
      let evalResult: any = null;

      const evalPrompt = `You are an adaptive psychometric evaluator assessing a candidate's diagnostic test for the role of "${formData.target_role}".
Stated prior experience: "${formData.known_skills}".
Current Assessment Round: ${quizRound}.

The assessment framework evaluates candidates across a 5-Tier Difficulty Ladder customized strictly for "${formData.target_role}":
Tier 1: Foundational (Core definitions, basic axioms, elementary terminology of ${formData.target_role})
Tier 2: Core Application (Standard problems, direct formula application, routine operations in ${formData.target_role})
Tier 3: Intermediate (Multi-step problems, structural properties, theorem applications in ${formData.target_role})
Tier 4: Advanced (Complex analytical proofs, subtle invariants, counter-examples, edge configurations in ${formData.target_role})
Tier 5: Expert (Deep theoretical synthesis, non-trivial abstract generalizations in ${formData.target_role})

CRITICAL TOPIC INTEGRITY:
All questions and evaluations MUST remain 100% focused strictly on "${formData.target_role}".

Candidate Test Scorecard:
${JSON.stringify(compactScorecard, null, 2)}

OBJECTIVE:
Act as an analytical psychometric evaluator for "${formData.target_role}". Analyze the candidate's answers across the 5-Tier Difficulty Ladder to identify:
1. The candidate's exact skill level and mastery ceiling in "${formData.target_role}" (the highest tier they reliably understand).
2. The specific concepts and skill gaps they failed or struggled with.
3. A concise summary of their knowledge gaps to seed their personalized learning roadmap.

Return ONLY a JSON object:
{
  "decision": "GENERATE_ROADMAP",
  "reason": "Clear explanation of the candidate's strengths and where their understanding broke down",
  "mastery_ceiling_tier": "Foundational" | "Application" | "Intermediate" | "Advanced" | "Expert" | "Novice",
  "weak_skills": "Concise, precise summary of boundary gaps and missed concepts in ${formData.target_role} so the learning path starts directly at their threshold"
}`;

      if (useLocalAI && localAIModelId) {
        setLocalAIStatus('Evaluating performance on local device...');
        const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
        const engine = await CreateMLCEngine(localAIModelId, {
          initProgressCallback: (r: any) => {
            setLocalAIStatus(r.text || 'Running local model...');
          }
        });
        const res = await engine.chat.completions.create({
          messages: [{ role: 'user', content: evalPrompt }],
          max_tokens: 256,
        });
        const text = res.choices?.[0]?.message?.content || '';
        evalResult = JSON.parse(jsonrepair(text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()));
        await logAIUsage({
          subject: `Diagnostic Evaluation: ${formData.target_role}`,
          model: localAIModelId,
          prompt_tokens: res.usage?.prompt_tokens || 0,
          completion_tokens: res.usage?.completion_tokens || 0,
          total_tokens: res.usage?.total_tokens || 0,
          source: 'local-webgpu'
        });
      } else if (openRouterKey && useOpenRouter) {
        const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openRouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "EulerFold AI"
          },
          body: JSON.stringify({
            model: openRouterModel || 'openai/gpt-4o',
            messages: [{ role: "user", content: evalPrompt }],
            response_format: { type: "json_object" },
            max_tokens: 256
          })
        });
        if (orResponse.ok) {
          const orData = await orResponse.json();
          const text = orData.choices?.[0]?.message?.content || "";
          evalResult = JSON.parse(jsonrepair(text));
          // Log AI usage in settings metrics
          await logAIUsage({
            subject: `Diagnostic Evaluation: ${formData.target_role}`,
            model: orData.model || openRouterModel,
            prompt_tokens: orData.usage?.prompt_tokens || 0,
            completion_tokens: orData.usage?.completion_tokens || 0,
            total_tokens: orData.usage?.total_tokens || 0,
            source: 'openrouter'
          });
        }
      } else {
        evalResult = await roadmapsAPI.evaluateDiagnosticQuiz({
          target_role: formData.target_role,
          known_skills: formData.known_skills,
          round_number: quizRound,
          questions_and_answers: compactScorecard
        });
      }

      setQuizHistory(compactScorecard);
      setIsEvaluating(false);
      setIsGenerating(true);

      const fullDiagnosticEval = [
        evalResult?.mastery_ceiling_tier ? `Mastery Ceiling Tier: ${evalResult.mastery_ceiling_tier}` : null,
        evalResult?.reason ? `Diagnostic Evaluation Assessment: ${evalResult.reason}` : null,
        evalResult?.weak_skills ? `Identified Knowledge Gaps: ${evalResult.weak_skills}` : null
      ].filter(Boolean).join("\n\n");

      await submitQuizAndGenerateGapRoadmap(fullDiagnosticEval || evalResult?.weak_skills, compactScorecard, evalResult, fullDiagnosticEval);
      return;
    } catch (e) {
      console.error("Diagnostic evaluation error:", e);
      setQuizHistory(compactScorecard);
      setIsEvaluating(false);
      setIsGenerating(true);
      await submitQuizAndGenerateGapRoadmap(undefined, compactScorecard);
    }
    setIsEvaluating(false);
  };

  const submitQuizAndGenerateGapRoadmap = async (
    overrideWeakSkills?: string, 
    fullHistory?: any[], 
    evalObject?: any, 
    diagnosticPromptContext?: string
  ) => {
    setIsConfirmSubmitModalOpen(false);
    setIsGenerating(true);
    setError(null);
    let creditDeductedLocally = false;
    const initialCredits = credits;

    try {
      const allHistory = fullHistory || quizHistory;
      let weak_skills = overrideWeakSkills;
      if (!weak_skills) {
        const failedQuestions = allHistory.length > 0
          ? allHistory.filter((item: any) => !item.is_correct)
          : quizQuestions.filter((q, i) => quizAnswers[i] !== q.correct_answer_index);

        if (failedQuestions.length > 0) {
          weak_skills = "Failed to understand: " + failedQuestions.map((q: any) => q.question).join(" | ");
        } else {
          weak_skills = "User passed all diagnostic questions.";
        }
      }

      const systemPrompt = `You are a technical mentor. Generate a technical learning roadmap. Output JSON ONLY matching the required schema.`;
      const userPrompt = `The user wants to become a "${formData.target_role}".
They are proficient in: "${formData.known_skills}"

**DIAGNOSTIC ASSESSMENT EVALUATION:**
"${weak_skills}"

Generate a ${formData.time_value} week learning roadmap that COMPLETELY SKIPS the known skills.
Strictly calibrate the curriculum and Module 1 to start directly at their diagnostic mastery ceiling and bridge the specific gaps identified in the evaluation above.

**RULES:**
1. **Milestone Architecture:** Generate ${formData.time_value} milestone module(s). ONLY Module 1 is detailed with 4-5 focused topics and subtopics. For all subsequent modules (Module 2 through ${formData.time_value}), you MUST set "topics": []. They are locked stubs that will be unlocked adaptively later.
2. **Specific Topics in Module 1:** Provide 4-5 topics using industry-standard technical terms.
3. **Practical Outcomes:** The proof_of_work_instructions must describe a realistic technical task that demonstrates competency.
4. **Conciseness:** Roadmap description max 2 sentences. Module outcome max 1 sentence.
5. **Output JSON ONLY** matching this schema:
   {
     "title": "string", 
     "description": "Concise description (max 2 sentences).",
     "modules": [
       {
         "title": "string",
         "outcome": "One punchy sentence on the specific technical competency achieved.",
         "timeline": "string",
         "workspace_type": "code|research|design",
         "proof_of_work_instructions": {
            "what_to_build": "string",
            "what_counts_as_evidence": "string",
            "eval_criteria": ["string", "string"]
         },
         "topics": [
           { "title": "string", "subtopics": [ { "title": "string" } ] }
         ],
         "optimal_search_query": "string"
       }
     ]
   }`;

      if (openRouterKey && useOpenRouter) {
        const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

        const requestBody = {
          model: openRouterModel || 'openai/gpt-4o',
          messages: [{ role: "user", content: fullPrompt }],
          response_format: { type: "json_object" },
          max_tokens: 8192
        };

        const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openRouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "EulerFold AI"
          },
          body: JSON.stringify(requestBody)
        });

        const orData = await orResponse.json();

        if (!orResponse.ok) {
           throw new Error(orData.error?.message || "OpenRouter generation failed.");
        }

        let generatedText = orData.choices[0].message?.content || "";
        let cleanedText = generatedText.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

        const jsonBlockMatch = cleanedText.match(/```(?:json)?\s*([\s\S]*?)```/i);
        if (jsonBlockMatch && jsonBlockMatch[1]) cleanedText = jsonBlockMatch[1].trim();
        
        const coursePlan = JSON.parse(jsonrepair(cleanedText));

        const backendPayload = {
          subject: coursePlan.title || 'Skill Gap Course',
          goal: `Fill gaps: ${weak_skills.substring(0, 100)}...`,
          time_value: formData.time_value,
          time_unit: 'weeks',
          roadmap_plan: {
            ...coursePlan,
            diagnostic_evaluation: evalObject || { reason: weak_skills, diagnostic_context: diagnosticPromptContext }
          },
          model: openRouterModel || 'openai/gpt-4o',
          is_job_decoded: false
        };

        const saveResponse = await api.post("/roadmaps/save-external", backendPayload);
        
        try {
          await logAIUsage({
            id: saveResponse?.data?.slug,
            subject: coursePlan.title || 'Skill Gap Course',
            model: orData.model || openRouterModel,
            prompt_tokens: orData.usage?.prompt_tokens || 0,
            completion_tokens: orData.usage?.completion_tokens || 0,
            total_tokens: orData.usage?.total_tokens || 0
          });
          
          if (!isPro) {
            const { data: profile } = await supabase.from('profiles').select('roadmap_credits').eq('supabase_uid', (await supabase.auth.getSession()).data.session?.user?.id).single();
            if (profile) {
               await supabase.from('profiles').update({ roadmap_credits: Math.max(0, profile.roadmap_credits - 1) }).eq('supabase_uid', (await supabase.auth.getSession()).data.session?.user?.id);
                setCredits(Math.max(0, profile.roadmap_credits - 1));
                creditDeductedLocally = true;
            }
          }
        } catch (e) {
          console.error("Failed to log AI usage:", e);
        }

        setQuizActive(false);
        onRoadmapGenerated(saveResponse.data, { ...formData, time_unit: 'weeks' });

      } else if (localAIModelId && useLocalAI) {
        let engine;
        try {
          engine = await CreateMLCEngine(localAIModelId, { initProgressCallback: (r) => console.log(r.text) });
          
          const response = await engine.chat.completions.create({
            messages: [
              { role: "system", content: "You are a strict JSON data generator. Reply ONLY with valid JSON." },
              { role: "user", content: userPrompt + "\nCRITICAL: Output ONLY a raw JSON object." }
            ],
            max_tokens: 8192,
          });
          
          let generatedText = response.choices[0].message.content || '';
          let responseUsage = response.usage || null;
          let cleanedText = generatedText.trim();
          if (cleanedText.startsWith("```json")) cleanedText = cleanedText.replace(/^```json\n?/, "").replace(/```$/, "");
          else if (cleanedText.startsWith("```")) cleanedText = cleanedText.replace(/^```\n?/, "").replace(/```$/, "");

          const parsedJSON = JSON.parse(jsonrepair(cleanedText));

          const backendPayload = {
            subject: parsedJSON.title || 'Skill Gap Roadmap',
            goal: `Fill gaps: ${weak_skills.substring(0, 100)}...`,
            time_value: formData.time_value,
            time_unit: 'weeks',
            roadmap_plan: {
              ...parsedJSON,
              diagnostic_evaluation: evalObject || { reason: weak_skills, diagnostic_context: diagnosticPromptContext }
            },
            model: localAIModelId,
            is_job_decoded: false
          };

          const saveResponse = await api.post("/roadmaps/save-external", backendPayload);
          
          try {
            await logAIUsage({
              id: saveResponse?.data?.slug,
              subject: parsedJSON.title || 'Skill Gap Course',
              model: localAIModelId,
              prompt_tokens: responseUsage?.prompt_tokens || 0,
              completion_tokens: responseUsage?.completion_tokens || 0,
              total_tokens: responseUsage?.total_tokens || 0
            });
            
            if (!isPro) {
              const { data: profile } = await supabase.from('profiles').select('roadmap_credits').eq('supabase_uid', (await supabase.auth.getSession()).data.session?.user?.id).single();
              if (profile) {
                 await supabase.from('profiles').update({ roadmap_credits: Math.max(0, profile.roadmap_credits - 1) }).eq('supabase_uid', (await supabase.auth.getSession()).data.session?.user?.id);
                 setCredits(Math.max(0, profile.roadmap_credits - 1));
                 creditDeductedLocally = true;
              }
            }
          } catch (e) {
            console.error("Failed to log AI usage:", e);
          }

          setQuizActive(false);
          onRoadmapGenerated(saveResponse.data, { ...formData, time_unit: 'weeks' });
        } finally {
          if (engine) await engine.unload();
        }
      } else {
        const res = await roadmapsAPI.generateFromGaps({
          target_role: formData.target_role,
          known_skills: formData.known_skills,
          weak_skills: weak_skills,
          diagnostic_prompt_context: diagnosticPromptContext || weak_skills,
          time_value: formData.time_value,
          time_unit: 'weeks',
          strict_official_sources: formData.strict_official_sources
        });
        
        try {
          await logAIUsage({
            id: (res as any)?.slug,
            subject: 'Skill Gap Course',
            model: isPro ? 'models/gemini-2.5-pro' : 'models/gemini-2.5-flash',
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
            source: 'eulerfold-ai'
          });
          
          if (!isPro) {
            const { data: currentProfile } = await supabase.from('profiles').select('roadmap_credits').eq('supabase_uid', (await supabase.auth.getSession()).data.session?.user?.id).single();
            if (currentProfile) {
               setCredits(currentProfile.roadmap_credits);
            }
          }
        } catch (e) {
          console.error("Failed to log AI usage:", e);
        }

        localStorage.removeItem('active_diagnostic_quiz');
        setPendingAssessment(null);
        setQuizActive(false);
        onRoadmapGenerated(res as any, formData);
      }
    } catch (err: any) {
      if (creditDeductedLocally && initialCredits !== null) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) {
            await supabase
              .from('profiles')
              .update({ roadmap_credits: initialCredits })
              .eq('supabase_uid', session.user.id);
            setCredits(initialCredits);
          }
        } catch (refundErr) {
          console.error("Failed to refund credit locally:", refundErr);
        }
      }

      await fetchProfileAndCredits();

      if (err.response?.status === 402 || err.response?.status === 403) {
        setIsPaymentModalOpen(true);
      } else {
        const errorDetail = err.response?.data?.detail || err.message || 'Course generation failed.';
        setError(`${errorDetail} Your credit has been preserved or refunded.`);
      }
    } finally {
      setIsGenerating(false);
      isSubmittingRef.current = false;
    }
  };

  // FULL PAGE DIAGNOSTIC ASSESSMENT VIEW
  if (quizActive && quizQuestions.length > 0) {
    const q = quizQuestions[currentQuizIdx];
    const answeredCount = quizAnswers.filter(a => a !== null).length;
    const flaggedCount = flaggedQuestions.filter(Boolean).length;
    const progressPercent = Math.round((answeredCount / quizQuestions.length) * 100);

    const activeQuizModal = (
      <div className="fixed inset-0 z-[200] bg-black/75 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 overflow-hidden animate-in fade-in duration-150">
        <div className="w-full max-w-5xl h-full max-h-[92vh] bg-background border border-border rounded-md shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 relative">
        {/* Top Assessment Header */}
        <header className="h-16 bg-sidebar border-b border-border px-4 md:px-6 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-[15px] font-bold text-text-heading leading-tight">
              Skill Gap Diagnostic Assessment
            </h1>
            <p className="text-[12px] text-text-muted flex items-center gap-2">
              <span>Target Role: <strong className="font-semibold text-text-primary">{formData.target_role}</strong></span>
              {quizQuestions.length < 5 && (
                <span className="inline-flex items-center text-[11px] font-semibold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-md">
                  Syncing questions ({quizQuestions.length}/5)...
                </span>
              )}
            </p>
          </div>

          {/* Center Timer */}
          <div className="flex items-center gap-2 bg-background border border-border px-3.5 py-1.5 rounded-md shadow-xs">
            <span className="text-[12px] font-bold text-text-muted uppercase tracking-wider">Time Remaining:</span>
            <span className={`font-mono text-[14px] font-bold ${timeLeft <= 60 ? 'text-accent' : 'text-text-heading'}`}>
              {formatTime(timeLeft)}
            </span>
            <button
              onClick={() => setIsTimerPaused(!isTimerPaused)}
              className="ml-1 px-2 py-0.5 rounded-md text-[11px] font-bold text-text-muted hover:text-text-primary hover:bg-sidebar transition-colors border border-border"
            >
              {isTimerPaused ? "Resume" : "Pause"}
            </button>
          </div>

          {/* Right Controls & Exit */}
          <div className="flex items-center gap-3 md:gap-4">
            {isLoggedIn && credits !== null && (
              <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-accent/10 text-accent border border-accent/20">
                <span className="text-[11px]">💎</span>
                <span>{credits} {credits === 1 ? 'Credit' : 'Credits'} Available</span>
              </div>
            )}
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[12px] font-bold text-text-heading">
                Question {currentQuizIdx + 1} of {quizQuestions.length}
              </span>
              <span className="text-[11px] text-text-muted">
                {progressPercent}% Complete
              </span>
            </div>
            <button
              onClick={() => setIsExitModalOpen(true)}
              className="px-3 py-1.5 rounded-md text-[13px] font-semibold text-text-muted hover:text-text-heading hover:bg-background border border-border transition-all"
            >
              Exit Assessment
            </button>
          </div>
        </header>

        {/* Top Progress Bar */}
        <div className="w-full h-1 bg-sidebar border-b border-border/40 overflow-hidden shrink-0">
          <div 
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
            
            {/* Left Question Area */}
            <div className="bg-sidebar rounded-md border border-border p-6 shadow-xs flex flex-col min-h-[500px]">
              {/* Question Header Status */}
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-border mb-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-accent/10 text-accent font-bold text-[12px] rounded-md border border-accent/20">
                    Question {currentQuizIdx + 1}
                  </span>
                  {q.difficulty_tier && (
                    <span className="px-2.5 py-0.5 bg-background text-text-heading font-semibold text-[11px] rounded-md border border-border">
                      Tier {q.tier_number || (currentQuizIdx + 1)}: {toRenderableString(q.difficulty_tier)}
                    </span>
                  )}
                  {q.source && (
                    <span className="px-2 py-0.5 text-[10px] font-medium text-text-muted bg-background border border-border rounded-md">
                      {toRenderableString(q.source).startsWith("benchmark") ? "Standardized Benchmark" : "Adaptive AI"}
                    </span>
                  )}
                  {quizRound > 1 ? (
                    <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-[11px] rounded-md border border-amber-500/20">
                      Round {quizRound}: Targeted Follow-Up
                    </span>
                  ) : (
                    !q.difficulty_tier && (
                      <span className="text-[12px] text-text-muted font-medium">
                        Diagnostic Conceptual Audit
                      </span>
                    )
                  )}
                </div>
                <button
                  onClick={() => toggleFlagQuestion(currentQuizIdx)}
                  className={`px-3 py-1 rounded-md text-[12px] font-semibold border transition-all ${
                    flaggedQuestions[currentQuizIdx]
                      ? 'border-accent/50 bg-accent/10 text-accent'
                      : 'border-border text-text-muted hover:text-text-heading hover:border-accent/40 bg-background'
                  }`}
                >
                  {flaggedQuestions[currentQuizIdx] ? 'Flagged for Review' : 'Flag Question'}
                </button>
              </div>

              {quizRound > 1 && (
                <div className="mb-6 p-3.5 rounded-md bg-accent/10 border border-accent/20">
                  <p className="text-[12px] text-text-primary leading-relaxed">
                    <strong className="text-text-heading font-semibold">Adaptive Follow-Up (Round {quizRound}):</strong> {toRenderableString(diagnosticReason) || "The system is probing boundary concepts to definitively identify your exact skill level."}
                  </p>
                </div>
              )}

              {/* Question Body */}
              <div className="flex-1">
                <div className="text-[16px] md:text-[18px] font-semibold text-text-heading leading-relaxed mb-6 break-words font-sans">
                  {toRenderableString(q.question).includes("Python code:") || toRenderableString(q.question).includes("```") ? (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-accent/10 text-accent border border-accent/20 font-semibold">
                          Code Analysis
                        </span>
                      </div>
                      <div className="p-4 rounded-md bg-sidebar border border-border font-mono text-[13px] md:text-[14px] leading-relaxed overflow-x-auto text-text-primary shadow-xs whitespace-pre-wrap">
                        {toRenderableString(q.question)}
                      </div>
                    </div>
                  ) : (
                    <h2>
                      <MathRenderer content={toRenderableString(q.question)} />
                    </h2>
                  )}
                </div>

                <div className="grid gap-2.5 mb-8">
                  {q.options.map((opt: any, idx: number) => {
                    const isSelected = quizAnswers[currentQuizIdx] === idx;
                    const optionLetter = String.fromCharCode(65 + idx);
                    return (
                      <button
                        key={idx}
                        onClick={() => selectOption(idx)}
                        className={`w-full text-left p-3.5 md:p-4 rounded-md border transition-all flex items-start gap-3.5 text-[14px] ${
                          isSelected
                            ? 'border-accent border-l-4 bg-accent/10 text-text-heading font-semibold shadow-xs'
                            : 'border-border bg-background hover:border-accent/40 text-text-primary hover:bg-sidebar'
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-md font-bold flex items-center justify-center text-[12px] shrink-0 border transition-colors ${
                          isSelected 
                            ? 'bg-accent text-white border-accent' 
                            : 'bg-sidebar text-text-muted border-border'
                        }`}>
                          {optionLetter}
                        </span>
                        <span className="flex-1 font-medium leading-relaxed pt-0.5">
                          <MathRenderer content={toRenderableString(opt)} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="flex items-center justify-between pt-6 border-t border-border mt-auto">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentQuizIdx(p => Math.max(0, p - 1))}
                    disabled={currentQuizIdx === 0}
                    className="px-4 py-2 rounded-md text-[13px] font-semibold text-text-muted hover:text-text-heading hover:bg-background border border-border disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>

                  {quizAnswers[currentQuizIdx] !== null && (
                    <button
                      onClick={clearSelection}
                      className="px-3 py-2 text-[12px] font-medium text-text-muted hover:text-text-heading transition-colors"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                <div>
                  {currentQuizIdx === quizQuestions.length - 1 ? (
                    <button
                      onClick={handleAttemptSubmit}
                      disabled={isEvaluating || isGenerating}
                      className="bg-accent text-white px-6 py-2.5 rounded-md text-[13px] font-bold tracking-wide hover:bg-teal-700 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Submit Assessment
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentQuizIdx(p => p + 1)}
                      className="bg-accent text-white px-6 py-2.5 rounded-md text-[13px] font-bold tracking-wide hover:bg-teal-700 shadow-md transition-all cursor-pointer"
                    >
                      Next Question
                    </button>
                  )}
                </div>
              </div>

              {/* AI Engine Selection Bar below questions and submit button */}
              <div className="mt-4 pt-3.5 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="text-[11px] font-semibold text-text-muted">
                    AI Mode:
                  </span>
                  <select
                    value={useOpenRouter ? 'openrouter' : useLocalAI ? 'localai' : 'default'}
                    onChange={(e) => handleSelectEngine(e.target.value as any)}
                    className="bg-background border border-border rounded-md px-2.5 py-1 text-[11px] font-medium text-text-primary focus:border-accent focus:outline-none cursor-pointer transition-colors"
                  >
                    <option value="default">EulerFold AI (Cloud)</option>
                    <option value="openrouter">OpenRouter (Custom Key / Model)</option>
                    <option value="localai">Local AI (WebGPU In-Browser)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  {useOpenRouter ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10.5px] text-text-muted font-mono truncate max-w-[150px]" title={openRouterModel || 'openai/gpt-4o'}>
                        {openRouterModel || 'openai/gpt-4o'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsOpenRouterModalOpen(true)}
                        className="text-[10.5px] font-semibold text-accent hover:underline cursor-pointer"
                      >
                        {openRouterKey ? 'Configure' : 'Set Key'}
                      </button>
                    </div>
                  ) : useLocalAI ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10.5px] text-text-muted font-mono truncate max-w-[150px]" title={localAIModelId || 'Select model'}>
                        {localAIModelId ? localAIModelId.split('-')[0] : 'WebGPU'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsLocalAIModalOpen(true)}
                        className="text-[10.5px] font-semibold text-accent hover:underline cursor-pointer"
                      >
                        {localAIModelId ? 'Change Model' : 'Select Model'}
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10.5px] text-text-muted">
                      EulerFold Cloud Engine
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Assessment Details */}
              <div className="bg-sidebar rounded-md border border-border p-5 space-y-3">
                <h3 className="text-[14px] font-bold text-text-heading tracking-wide border-b border-border pb-2">
                  Assessment Details
                </h3>
                <div className="space-y-2 text-[12px]">
                  <div>
                    <span className="text-text-muted block font-medium">Target Role:</span>
                    <span className="font-semibold text-text-heading">{toRenderableString(formData.target_role)}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block font-medium">Stated Knowledge:</span>
                    <span className="text-text-primary line-clamp-2">{toRenderableString(formData.known_skills)}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block font-medium">Target Duration:</span>
                    <span className="font-semibold text-text-heading">{formData.time_value} weeks</span>
                  </div>
                </div>
              </div>

              {/* Credits Status */}
              {isLoggedIn && credits !== null && (
                <div className="bg-sidebar rounded-md border border-border p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] font-bold text-text-heading flex items-center gap-1.5">
                      <span>💎</span> Available Credits
                    </span>
                    <span className="font-mono text-[13px] font-bold text-accent px-2 py-0.5 rounded-md bg-accent/10 border border-accent/20">
                      {credits}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    1 credit is used upon course creation. If synthesis fails, it is automatically refunded.
                  </p>
                </div>
              )}

              {/* Question Navigator */}
              <div className="bg-sidebar rounded-md border border-border p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="text-[14px] font-bold text-text-heading tracking-wide">
                    Question Navigator
                  </h3>
                  <span className="text-[11px] font-semibold text-text-muted">
                    {answeredCount}/{quizQuestions.length} Answered
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {quizQuestions.map((_, idx) => {
                    const isCurrent = idx === currentQuizIdx;
                    const isAnswered = quizAnswers[idx] !== null;
                    const isFlagged = flaggedQuestions[idx];

                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentQuizIdx(idx)}
                        className={`h-10 rounded-md border text-[13px] font-bold relative flex items-center justify-center transition-all ${
                          isCurrent
                            ? 'ring-2 ring-accent border-accent bg-background text-text-heading'
                            : isAnswered
                              ? 'bg-accent/15 border-accent/40 text-accent'
                              : 'bg-background border-border text-text-muted hover:border-accent/40'
                        }`}
                      >
                        {idx + 1}
                        {isFlagged && (
                          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-accent/20 border border-accent/40" /> Answered
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" /> Flagged ({flaggedCount})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-background border border-border" /> Pending
                  </span>
                </div>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="bg-sidebar rounded-md border border-border p-4 text-[12px] text-text-muted space-y-2">
                <h4 className="font-bold text-text-heading text-[12px]">Keyboard Shortcuts</h4>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <span><kbd className="px-1.5 py-0.5 bg-background border border-border rounded-xs">1-4</kbd> Select option</span>
                  <span><kbd className="px-1.5 py-0.5 bg-background border border-border rounded-xs">F</kbd> Flag question</span>
                  <span><kbd className="px-1.5 py-0.5 bg-background border border-border rounded-xs">←</kbd> Previous</span>
                  <span><kbd className="px-1.5 py-0.5 bg-background border border-border rounded-xs">→</kbd> Next</span>
                </div>
              </div>
            </div>

          </div>
        </main>

        {/* Exit Confirmation Modal */}
        {isExitModalOpen && (
          <div className="fixed inset-0 z-[120] bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-sidebar border border-border rounded-md p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="text-[17px] font-bold text-text-heading">
                Exit Diagnostic Assessment?
              </h3>
              <p className="text-[13px] text-text-muted leading-relaxed">
                Are you sure you want to exit? Your answers and assessment progress will be lost.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsExitModalOpen(false)}
                  className="px-4 py-2 rounded-md text-[13px] font-semibold text-text-muted hover:text-text-heading border border-border hover:bg-background transition-all"
                >
                  Resume Assessment
                </button>
                <button
                  onClick={exitAssessment}
                  className="px-4 py-2 rounded-md text-[13px] font-semibold bg-red-600 text-white hover:bg-red-700 transition-all"
                >
                  Exit Assessment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Unanswered Questions Confirmation Modal */}
        {isConfirmSubmitModalOpen && (
          <div className="fixed inset-0 z-[120] bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-sidebar border border-border rounded-md p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="text-[17px] font-bold text-text-heading">
                Unanswered Questions Remaining
              </h3>
              <p className="text-[13px] text-text-muted leading-relaxed">
                You have <strong className="text-text-primary">{quizQuestions.length - answeredCount}</strong> unanswered question(s). Submitting now will treat unanswered questions as knowledge gaps.
              </p>
              {isLoggedIn && credits !== null && (
                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-text-muted">
                  <span>Available: <strong className="text-text-primary">{credits} {credits === 1 ? 'Credit' : 'Credits'}</strong></span>
                  <span className="text-accent font-medium">Refunded if synthesis fails</span>
                </div>
              )}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsConfirmSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-md text-[13px] font-semibold text-text-muted hover:text-text-heading border border-border hover:bg-background transition-all"
                >
                  Review Questions
                </button>
                <button
                  onClick={() => evaluateOrSubmitQuiz()}
                  disabled={isEvaluating || isGenerating}
                  className="px-4 py-2 rounded-md text-[13px] font-semibold bg-accent text-white hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Anyway
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Diagnostic Performance Evaluation Overlay */}
        {isEvaluating && (
          <div className="fixed inset-0 z-[160] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full bg-sidebar border border-border rounded-md p-8 shadow-2xl space-y-6">
              <div>
                <h3 className="text-[18px] font-bold text-text-heading mb-2">
                  Evaluating Benchmark Responses
                </h3>
                <p className="text-[13px] text-text-muted leading-relaxed">
                  Mapping your answers across Foundational to Expert tiers to pinpoint exact knowledge gaps...
                </p>
              </div>
              <div className="flex justify-center gap-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Full-Page Course Generation / Local Model Loading Overlay */}
        {isGenerating && (
          <div className="fixed inset-0 z-[150] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full bg-sidebar border border-border rounded-md p-8 shadow-2xl space-y-6">
              <div>
                <h3 className="text-[18px] font-bold text-text-heading mb-2">
                  {useLocalAI && localAIStatus ? 'Running Local Model' : 'Synthesizing Learning Path'}
                </h3>
                <p className="text-[13px] text-text-muted leading-relaxed">
                  {useLocalAI && localAIStatus
                    ? 'The model is running locally on your device. No data is sent to any server.'
                    : `Designing your custom ${formData.time_value}-week curriculum to bridge identified knowledge gaps...`}
                </p>
              </div>
              {useLocalAI && localAIStatus && (
                <div className="bg-callout-bg border border-border rounded-md px-4 py-3 text-left">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">Status</p>
                  <p className="text-[11px] text-accent font-mono break-words leading-relaxed">{localAIStatus}</p>
                </div>
              )}
              <div className="flex justify-center gap-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
              <p className="text-[11px] text-text-muted border-t border-border/60 pt-4">
                {useLocalAI
                  ? 'Model runs entirely in your browser using WebGPU. This may take a moment on first load.'
                  : 'Curriculum synthesis in progress (about 15–25 seconds). You will be redirected as soon as it is ready.'}
              </p>
            </div>
          </div>
          )}

          {/* OpenRouter Configuration Modal */}
          <OpenRouterModal 
            isOpen={isOpenRouterModalOpen}
            onClose={() => setIsOpenRouterModalOpen(false)}
            onSave={(key, model) => {
              localStorage.setItem('openrouter_key', key);
              localStorage.setItem('openrouter_model', model);
              setOpenRouterKey(key);
              setOpenRouterModel(model);
              setUseOpenRouter(true);
              setUseLocalAI(false);
              setIsOpenRouterModalOpen(false);
              window.dispatchEvent(new Event('ai_settings_changed'));
            }}
            onRemove={() => {
              localStorage.removeItem('openrouter_key');
              localStorage.removeItem('openrouter_model');
              setOpenRouterKey(null);
              setUseOpenRouter(false);
              setIsOpenRouterModalOpen(false);
              window.dispatchEvent(new Event('ai_settings_changed'));
            }}
          />

          {/* Local AI Configuration Modal */}
          <LocalAIModal
            isOpen={isLocalAIModalOpen}
            onClose={() => setIsLocalAIModalOpen(false)}
            onSelectModel={(modelId) => {
              localStorage.setItem('local_ai_model', modelId);
              setLocalAIModelId(modelId);
              setUseLocalAI(true);
              setUseOpenRouter(false);
              setIsLocalAIModalOpen(false);
              window.dispatchEvent(new Event('ai_settings_changed'));
            }}
          />
        </div>
      </div>
    );

    if (!mounted) return null;
    return createPortal(activeQuizModal, document.body);
  }


  // STANDARD FORM VIEW
  const setupModal = (
    <div 
      className="fixed inset-0 z-[200] bg-black/75 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div className="bg-sidebar rounded-md border border-border overflow-hidden shadow-2xl max-w-lg mx-auto w-full relative animate-in fade-in zoom-in-95 duration-150">
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        onSuccess={() => setIsPaymentModalOpen(false)} 
        featureTitle="Skill Gap Audit is an EulerFold Pro feature." 
      />
      
      {isLoggedIn && isPro === false && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/80 backdrop-blur-xs rounded-md border border-border/50 text-center p-6">
            <div className="w-10 h-10 bg-accent/10 rounded-md flex items-center justify-center mb-3 border border-accent/20">
                <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-inter text-[15px] font-semibold text-text-heading mb-1.5">Pro Exclusive Feature</h3>
            <p className="font-medium text-[12px] text-text-muted max-w-md mb-4 leading-relaxed px-4">
                <strong className="text-text-primary">Unlock the Diagnostic Audit.</strong> Take a quick assessment to find your weak spots, then get a custom course built specifically to fix them.
            </p>
            <Link 
                href="/pricing"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-md font-bold text-[11px] uppercase tracking-wider shadow-md hover:bg-teal-700 transition-all"
            >
                Upgrade to Pro
            </Link>
        </div>
      )}
      
      {isGenerating && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xs z-50 flex flex-col items-center justify-center rounded-md border border-accent/20 p-6 text-center">
          <p className="text-[13px] font-bold text-accent tracking-wider uppercase mb-3">
            {useLocalAI ? 'Running Local Model...' : 'Generating Diagnostic Assessment...'}
          </p>
          <div className="flex justify-center gap-1.5 mb-4">
             {[0, 1, 2].map(i => (
               <div key={i} className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}></div>
             ))}
          </div>

          <div className="max-w-xs w-full text-center">
            <div className="bg-callout-bg border border-border px-3.5 py-2.5 rounded-md shadow-xs">
              {localAIStatus ? (
                <p className="text-[10px] text-accent leading-relaxed font-mono break-words">{localAIStatus}</p>
              ) : (
                <p className="text-[10px] text-text-muted leading-relaxed font-medium">
                  Calibrating 5-tier diagnostic questions...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleStartQuiz} className="p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between pb-3 border-b border-border/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[15px] font-bold text-text-heading leading-tight">
                  Skill Gap Diagnostic
                </h2>
                {isLoggedIn && credits !== null && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-accent/10 text-accent border border-accent/20">
                    <span className="text-[11px]">💎</span>
                    <span>{credits} {credits === 1 ? 'Credit' : 'Credits'} Available</span>
                  </span>
                )}
              </div>
              <p className="text-[12px] text-text-muted mt-0.5">
                Pinpoint your knowledge boundary before course generation.
              </p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-text-muted hover:text-text-primary rounded-md hover:bg-background transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {pendingAssessment && !quizActive && (
          <div className="mb-4 p-3 rounded-md bg-callout-bg border border-callout-border space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5 text-accent" />
                <h3 className="text-[12px] font-bold text-text-heading">
                  Unfinished Assessment Found
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-md">
                {pendingAssessment.quizQuestions?.length || 5} Questions
              </span>
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Pending diagnostic for <strong className="text-text-primary">{toRenderableString(pendingAssessment.formData?.target_role) || "your target role"}</strong>.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={resumePendingAssessment}
                className="px-3 py-1.5 rounded-md bg-accent text-white font-bold text-[11px] tracking-wide hover:bg-teal-700 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-3 h-3" /> Resume Assessment
              </button>
              <button
                type="button"
                onClick={discardPendingAssessment}
                className="px-3 py-1.5 rounded-md text-[11px] font-semibold text-text-muted hover:text-text-heading border border-border hover:bg-background transition-all"
              >
                Discard & Start New
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-[12px] text-red-600 font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-3.5">
          <div>
            <label className="block text-[10.5px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
              Target Role
            </label>
            <input
              type="text"
              name="target_role"
              value={formData.target_role}
              onChange={handleInputChange}
              placeholder="e.g. Senior Frontend Engineer"
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-[13px] text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-[10.5px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
              What you ALREADY know well
            </label>
            <textarea
              name="known_skills"
              value={formData.known_skills}
              onChange={handleInputChange}
              placeholder="e.g. Comfortable with basic Python, pandas, basic SQL"
              rows={2}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-[13px] text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-all resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-[10.5px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
              Timeline Setup
            </label>
            <div className="flex items-center gap-2 bg-background border border-border rounded-md px-3 py-1.5">
              <span className="text-[12px] font-bold text-text-primary">I want to study for</span>
              <select
                name="time_value"
                value={formData.time_value}
                onChange={handleInputChange}
                className="bg-sidebar border border-border text-text-heading text-[12px] font-bold rounded-md px-2 py-0.5 outline-none focus:border-accent"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 12].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
              <span className="text-[12px] font-bold text-text-primary">weeks.</span>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          {!isLoggedIn ? (
            <button
              type="button"
              onClick={() => router.push(`/login?message=auth_required_to_generate&next=${window.location.pathname}`)}
              className="w-full bg-accent text-white rounded-md py-2.5 px-4 font-bold text-[13px] tracking-wide hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <LogIn className="w-4 h-4" /> Authenticate
            </button>
          ) : (
            <>
              <button
                type="submit"
                disabled={isGenerating}
                className={`w-full ${!((openRouterKey && useOpenRouter) || (localAIModelId && useLocalAI)) && credits !== null && credits < 1 ? 'bg-background border-2 border-border text-text-muted hover:border-accent/40' : 'bg-accent text-white hover:bg-teal-700'} rounded-md py-2.5 px-4 font-bold text-[13px] tracking-wide transition-all flex items-center justify-center gap-2 shadow-sm`}
              >
                {((openRouterKey && useOpenRouter) || (localAIModelId && useLocalAI)) ? (
                  <>
                    <Mountain className="w-4 h-4" /> {isGenerating ? 'Calibrating Test...' : `Start Diagnostic Quiz ${useLocalAI ? '(Local)' : '(OpenRouter)'}`}
                  </>
                ) : (
                  <>
                    <span className={`text-[12px] ${credits !== null && credits < 1 ? 'grayscale opacity-50' : ''}`}>💎</span>
                    {credits !== null && credits < 1 ? 'Get More Credits' : (isGenerating ? 'Calibrating Test...' : 'Start Diagnostic Quiz')}
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-[11px] text-text-muted px-1 pt-0.5">
                <span>Diagnostic questions are free</span>
                {credits !== null && (
                  <span className="font-medium text-text-primary">
                    1 credit upon course creation (refunded if failed)
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </form>
      {isLoggedIn && !hideEngineSelector && !onClose && <AiEngineSelector />}
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(setupModal, document.body);
};

export default KnowledgeGapQuiz;
