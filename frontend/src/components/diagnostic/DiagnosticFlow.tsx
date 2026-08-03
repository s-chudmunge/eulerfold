'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronRight, SkipForward, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface QuestionOption {
  text: string;
  tag: string;
}

interface DiagnosticQuestion {
  id: number;
  domain_slug: string;
  domain_name: string;
  tier: number;
  stem: string;
  options: QuestionOption[];
}

interface DomainMapping {
  domain_slug: string;
  domain_name: string;
  weight: number;
}

interface DomainResult {
  level: string;
  known_concepts: string[];
  misconceptions: { id: string; question_id: number }[];
  gaps: string[];
}

interface KnowledgeProfile {
  [domain: string]: DomainResult;
}

interface AnswerResponse {
  is_correct: boolean;
  misconception_detected: string | null;
  next_question: DiagnosticQuestion | null;
  progress: { answered: number; total_estimated: number; domains_completed: number; total_domains: number };
  is_complete: boolean;
  knowledge_profile?: KnowledgeProfile;
  prompt_context?: string;
}

export interface DiagnosticResult {
  session_id: string;
  knowledge_profile: KnowledgeProfile;
  prompt_context: string;
  skipped: boolean;
}

interface DiagnosticFlowProps {
  topic: string;
  onComplete: (result: DiagnosticResult) => void;
  onSkip: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TIER_LABELS: Record<number, string> = {
  1: 'Foundational',
  2: 'Conceptual',
  3: 'Applied',
};

const LEVEL_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  beginner: { color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', label: 'Beginner' },
  foundational: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', label: 'Foundational' },
  intermediate: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'Intermediate' },
  advanced: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', label: 'Advanced' },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function DiagnosticFlow({ topic, onComplete, onSkip }: DiagnosticFlowProps) {
  // Stage: 'intro' | 'loading' | 'questioning' | 'answering' | 'results'
  const [stage, setStage] = useState<'intro' | 'loading' | 'questioning' | 'answering' | 'results'>('intro');

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [mappedDomains, setMappedDomains] = useState<DomainMapping[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<DiagnosticQuestion | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [progress, setProgress] = useState({ answered: 0, total_estimated: 0, domains_completed: 0, total_domains: 0 });
  const [feedback, setFeedback] = useState<{ is_correct: boolean; misconception: string | null } | null>(null);
  const [knowledgeProfile, setKnowledgeProfile] = useState<KnowledgeProfile | null>(null);
  const [promptContext, setPromptContext] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Answer history for showing the result domain breakdown
  const [answeredQuestions, setAnsweredQuestions] = useState<number>(0);

  // ─── Start diagnostic session ──────────────────────────────────────────────

  const startDiagnostic = useCallback(async () => {
    setStage('loading');
    setError(null);

    try {
      const res = await api.post('/diagnostics/start', { topic });
      const data = res.data;

      setSessionId(data.session_id);
      setMappedDomains(data.mapped_domains);
      setCurrentQuestion(data.first_question);
      setProgress({ answered: 0, total_estimated: data.total_questions, domains_completed: 0, total_domains: data.mapped_domains.length });
      setQuestionStartTime(Date.now());
      setStage('questioning');
    } catch (err: any) {
      console.error('Failed to start diagnostic:', err);
      setError(err?.response?.data?.detail || 'Failed to start the diagnostic. Please try again.');
      setStage('intro');
    }
  }, [topic]);

  // ─── Submit answer ─────────────────────────────────────────────────────────

  const submitAnswer = useCallback(async () => {
    if (selectedIndex === null || !currentQuestion || !sessionId) return;

    setStage('answering');
    const timeTaken = Date.now() - questionStartTime;

    try {
      const res = await api.post('/diagnostics/answer', {
        session_id: sessionId,
        question_id: currentQuestion.id,
        selected_index: selectedIndex,
        time_taken_ms: timeTaken,
      });

      const data: AnswerResponse = res.data;
      setAnsweredQuestions(prev => prev + 1);

      // Show brief feedback
      setFeedback({ is_correct: data.is_correct, misconception: data.misconception_detected });

      if (data.progress) {
        setProgress(data.progress);
      }

      // After a short delay, move to next question or results
      setTimeout(() => {
        setFeedback(null);
        setSelectedIndex(null);

        if (data.is_complete) {
          setKnowledgeProfile(data.knowledge_profile || null);
          setPromptContext(data.prompt_context || '');
          setStage('results');
        } else if (data.next_question) {
          setCurrentQuestion(data.next_question);
          setQuestionStartTime(Date.now());
          setStage('questioning');
        } else {
          // Edge case: not complete but no next question
          setStage('results');
        }
      }, 1200);
    } catch (err: any) {
      console.error('Failed to submit answer:', err);
      setError(err?.response?.data?.detail || 'Failed to submit answer.');
      setStage('questioning');
    }
  }, [selectedIndex, currentQuestion, sessionId, questionStartTime]);

  // ─── Skip diagnostic ──────────────────────────────────────────────────────

  const skipDiagnostic = useCallback(async () => {
    if (sessionId) {
      try {
        await api.post('/diagnostics/skip', { session_id: sessionId });
      } catch {
        // Non-critical, proceed anyway
      }
    }
    onSkip();
  }, [sessionId, onSkip]);

  // ─── Complete and proceed ──────────────────────────────────────────────────

  const handleProceed = useCallback(() => {
    if (!sessionId) return;
    onComplete({
      session_id: sessionId,
      knowledge_profile: knowledgeProfile || {},
      prompt_context: promptContext,
      skipped: false,
    });
  }, [sessionId, knowledgeProfile, promptContext, onComplete]);

  // ─── Keyboard shortcuts ────────────────────────────────────────────────────

  useEffect(() => {
    if (stage !== 'questioning') return;

    const handler = (e: KeyboardEvent) => {
      const key = e.key;
      if (['1', '2', '3', '4'].includes(key)) {
        const idx = parseInt(key) - 1;
        if (currentQuestion && idx < currentQuestion.options.length) {
          setSelectedIndex(idx);
        }
      } else if (key === 'Enter' && selectedIndex !== null) {
        submitAnswer();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [stage, currentQuestion, selectedIndex, submitAnswer]);

  // ─── Render: Intro ─────────────────────────────────────────────────────────

  if (stage === 'intro') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-xl mx-auto"
      >
        <div className="bg-surface border border-border/50 rounded-lg p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-heading">Diagnostic Assessment</h3>
              <p className="text-sm text-text-muted">Takes 2-3 minutes</p>
            </div>
          </div>

          <p className="text-text-secondary text-sm leading-relaxed mb-4">
            Before crafting your course on <span className="font-medium text-text-primary">&ldquo;{topic}&rdquo;</span>,
            a quick assessment helps us understand what you already know. This way, the course:
          </p>

          <ul className="space-y-2 mb-6">
            {[
              'Skips topics you\'ve already mastered',
              'Addresses any misconceptions early',
              'Connects new concepts to your existing knowledge',
              'Starts at the right difficulty level',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>



          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={startDiagnostic}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors"
            >
              <Brain className="w-4 h-4" />
              Start Assessment
            </button>
            <button
              onClick={skipDiagnostic}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-md border border-border text-text-secondary text-sm hover:bg-sidebar transition-colors"
            >
              <SkipForward className="w-4 h-4" />
              Skip
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ─── Render: Loading ───────────────────────────────────────────────────────

  if (stage === 'loading') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-xl mx-auto"
      >
        <div className="bg-surface border border-border/50 rounded-lg p-8 text-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
          <p className="text-text-primary font-medium">Analyzing prerequisite domains...</p>
          <p className="text-sm text-text-muted mt-1">
            Mapping &ldquo;{topic}&rdquo; to relevant knowledge areas
          </p>
        </div>
      </motion.div>
    );
  }

  // ─── Render: Question ──────────────────────────────────────────────────────

  if ((stage === 'questioning' || stage === 'answering') && currentQuestion) {
    const progressPercent = progress.total_estimated > 0
      ? Math.round((progress.answered / progress.total_estimated) * 100)
      : 0;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="bg-surface border border-border/50 rounded-lg overflow-hidden">
          {/* Header bar */}
          <div className="px-4 sm:px-6 py-3 border-b border-border/50 flex items-center justify-between bg-sidebar/50">
            <div className="flex items-center gap-3">
              <Brain className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-text-heading">
                {currentQuestion.domain_name}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-accent/10 text-accent font-medium">
                {TIER_LABELS[currentQuestion.tier] || `Tier ${currentQuestion.tier}`}
              </span>
            </div>
            <button
              onClick={skipDiagnostic}
              className="text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              Skip remaining
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 bg-border/30">
            <motion.div
              className="h-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Question */}
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-text-muted">
                Question {progress.answered + 1}
                {progress.total_estimated > 0 ? ` of ~${progress.total_estimated}` : ''}
              </p>
              <p className="text-xs text-text-muted">
                Domain {progress.domains_completed + 1} of {progress.total_domains}
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-text-primary font-medium text-[15px] leading-relaxed mb-5 whitespace-pre-line">
                  {currentQuestion.stem}
                </p>

                {/* Options */}
                <div className="space-y-2.5">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedIndex === idx;
                    const showFeedback = feedback !== null;
                    const isCorrectAnswer = showFeedback && feedback.is_correct && isSelected;
                    const isWrongAnswer = showFeedback && !feedback.is_correct && isSelected;
                    const letterLabel = String.fromCharCode(65 + idx); // A, B, C, D

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (!showFeedback) setSelectedIndex(idx);
                        }}
                        disabled={showFeedback}
                        className={`
                          w-full text-left px-4 py-3 rounded-md border text-sm transition-all duration-200
                          ${isCorrectAnswer
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200'
                            : isWrongAnswer
                              ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                              : isSelected
                                ? 'border-accent bg-accent/5 text-text-primary'
                                : 'border-border/60 hover:border-accent/40 hover:bg-sidebar/50 text-text-secondary'
                          }
                          ${showFeedback ? 'cursor-default' : 'cursor-pointer'}
                        `}
                      >
                        <span className="flex items-start gap-3">
                          <span className={`
                            shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-medium mt-px
                            ${isSelected
                              ? 'bg-accent text-white'
                              : 'bg-border/30 text-text-muted'
                            }
                            ${isCorrectAnswer ? 'bg-emerald-500 text-white' : ''}
                            ${isWrongAnswer ? 'bg-red-400 text-white' : ''}
                          `}>
                            {letterLabel}
                          </span>
                          <span className="leading-relaxed">{option.text}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback overlay */}
                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`mt-4 p-3 rounded-md text-sm flex items-start gap-2 ${
                        feedback.is_correct
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {feedback.is_correct ? (
                        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                      )}
                      <span>
                        {feedback.is_correct
                          ? 'Correct — moving to the next level.'
                          : feedback.misconception
                            ? `Noted — this tells us about your understanding. Moving on.`
                            : 'Noted — moving to the next area.'}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>

            {/* Submit button */}
            {!feedback && (
              <div className="mt-5 flex items-center justify-between">
                <p className="text-xs text-text-muted">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-border/40 text-text-muted font-mono text-[11px]">1</kbd>-<kbd className="px-1.5 py-0.5 rounded bg-border/40 text-text-muted font-mono text-[11px]">4</kbd> to select, <kbd className="px-1.5 py-0.5 rounded bg-border/40 text-text-muted font-mono text-[11px]">Enter</kbd> to confirm
                </p>
                <button
                  onClick={submitAnswer}
                  disabled={selectedIndex === null || stage === 'answering'}
                  className={`
                    flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-all
                    ${selectedIndex !== null
                      ? 'bg-accent text-white hover:bg-accent/90'
                      : 'bg-border/30 text-text-muted cursor-not-allowed'}
                  `}
                >
                  {stage === 'answering' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  Confirm
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // ─── Render: Results ───────────────────────────────────────────────────────

  if (stage === 'results' && knowledgeProfile) {
    const domains = Object.entries(knowledgeProfile);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="bg-surface border border-border/50 rounded-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-border/50 bg-sidebar/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-heading">Assessment Complete</h3>
                <p className="text-xs text-text-muted">{answeredQuestions} questions answered across {domains.length} domains</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <p className="text-sm text-text-secondary mb-4">
              Your knowledge profile will be used to personalize the course structure, difficulty, and content.
            </p>

            {/* Domain breakdown */}
            <div className="space-y-3 mb-6">
              {domains.map(([slug, result]) => {
                const config = LEVEL_CONFIG[result.level] || LEVEL_CONFIG.beginner;
                const domainName = mappedDomains.find(d => d.domain_slug === slug)?.domain_name || slug;

                return (
                  <div key={slug} className="border border-border/50 rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-text-primary">{domainName}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                    </div>

                    {result.known_concepts.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        {result.known_concepts.slice(0, 5).map(c => (
                          <span key={c} className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">
                            ✓ {c.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    )}

                    {result.misconceptions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        {result.misconceptions.map(m => (
                          <span key={m.id} className="text-[11px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
                            ⚠ {m.id.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    )}

                    {result.gaps.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {result.gaps.slice(0, 4).map(g => (
                          <span key={g} className="text-[11px] px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                            Gap: {g.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleProceed}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Craft Personalized Course
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ─── Fallback ──────────────────────────────────────────────────────────────

  return null;
}
