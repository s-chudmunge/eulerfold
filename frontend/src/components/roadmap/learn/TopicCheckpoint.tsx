'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Sparkles, ArrowRight, Loader2, HelpCircle } from 'lucide-react';
import { checkpointsAPI, CheckpointItem, CheckpointEvaluateResponse } from '@/lib/api';

interface TopicCheckpointProps {
  roadmapId: number;
  roadmapSlug?: string;
  moduleNumber: number;
  topicIndex: number;
  subject: string;
  topicTitle: string;
  subtopics?: string[];
  isCompleted: boolean;
  isModuleCompleted?: boolean;
  nextModuleLocked?: boolean;
  onUnlockNextModule?: () => void;
  onSuccess: (coinsEarned: number) => void;
  onNext: () => void;
}

// In-memory module/topic checkpoint cache to avoid re-fetching previously visited topics
const checkpointMemoryCache = new Map<string, CheckpointItem>();

export default function TopicCheckpoint({
  roadmapId,
  roadmapSlug,
  moduleNumber,
  topicIndex,
  subject,
  topicTitle,
  subtopics = [],
  isCompleted,
  isModuleCompleted = false,
  nextModuleLocked = false,
  onUnlockNextModule,
  onSuccess,
  onNext
}: TopicCheckpointProps) {
  const [checkpoint, setCheckpoint] = useState<CheckpointItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<CheckpointEvaluateResponse | null>(null);

  const cacheKey = `${roadmapId}_${moduleNumber}_${topicIndex}_${topicTitle}`;

  const fetchCheckpoint = async (previousAttempt?: any, signal?: AbortSignal) => {
    try {
      setLoading(true);
      setEvaluation(null);
      setSelectedOption(null);

      // Check client-side memory cache first if not a remedial retry
      if (!previousAttempt && checkpointMemoryCache.has(cacheKey)) {
        setCheckpoint(checkpointMemoryCache.get(cacheKey)!);
        setLoading(false);
        return;
      }

      const data = await checkpointsAPI.getOrGenerate({
        roadmap_id: roadmapId,
        roadmap_slug: roadmapSlug,
        module_number: moduleNumber,
        topic_index: topicIndex,
        subject,
        topic_title: topicTitle,
        subtopics,
        previous_attempt: previousAttempt
      }, signal);

      if (!previousAttempt && data) {
        checkpointMemoryCache.set(cacheKey, data);
      }

      setCheckpoint(data);
    } catch (err: any) {
      // Ignore AbortError caused by rapid topic navigation
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED' || err?.name === 'AbortError') {
        return;
      }
      console.error("Failed to load checkpoint:", err);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // If cached, load immediately without debounce
    if (checkpointMemoryCache.has(cacheKey)) {
      setCheckpoint(checkpointMemoryCache.get(cacheKey)!);
      setEvaluation(null);
      setSelectedOption(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setEvaluation(null);
    setSelectedOption(null);
    setCheckpoint(null);

    const abortController = new AbortController();

    // Debounce dwell delay: 1200ms ensures rapid topic browsing doesn't trigger AI calls
    const timer = setTimeout(() => {
      fetchCheckpoint(undefined, abortController.signal);
    }, 1200);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [roadmapId, moduleNumber, topicIndex, topicTitle]);

  const [evaluatedCheckpointId, setEvaluatedCheckpointId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (selectedOption === null || !checkpoint) return;
    setIsSubmitting(true);

    try {
      const result = await checkpointsAPI.evaluateAndAdapt({
        roadmap_id: roadmapId,
        module_number: moduleNumber,
        topic_index: topicIndex,
        checkpoint_id: checkpoint.id,
        selected_option: selectedOption,
        subject,
        topic_title: topicTitle,
        question: checkpoint.question,
        options: checkpoint.options,
        correct_index: checkpoint.correct_index,
        explanation: checkpoint.explanation,
        concept_key: checkpoint.concept_key,
        roadmap_slug: roadmapSlug
      });

      setEvaluation(result);
      setEvaluatedCheckpointId(checkpoint.id);
      if (result.is_correct && result.coins_earned > 0) {
        onSuccess(result.coins_earned);
      }
    } catch (err) {
      console.error("Error evaluating checkpoint:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryNextQuestion = () => {
    // Clear evaluation and selected choice first so the new question starts clean
    setSelectedOption(null);
    setEvaluation(null);
    setEvaluatedCheckpointId(null);

    if (evaluation?.retry_checkpoint) {
      setCheckpoint(evaluation.retry_checkpoint);
    } else {
      // Fallback: fetch a fresh checkpoint passing prior attempt
      fetchCheckpoint({
        question: checkpoint?.question,
        selected_choice: selectedOption !== null && checkpoint ? checkpoint.options[selectedOption] : "",
        explanation: checkpoint?.explanation
      });
    }
  };

  // Only consider submitted if evaluation matches the currently visible checkpoint ID
  const isSubmitted = evaluation !== null && evaluatedCheckpointId === checkpoint?.id;

  const archetypeLabels: Record<string, string> = {
    predict_output: "Predict Output",
    spot_bug: "Spot the Bug",
    concept_application: "Concept Application"
  };

  return (
    <div className="bg-sidebar border border-border rounded-md p-5 sm:p-6 my-8 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-text-heading">
            Concept Check
          </h3>
          {checkpoint?.archetype && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-accent/10 text-accent border border-accent/20 font-bold">
              {archetypeLabels[checkpoint.archetype] || "Checkpoint"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-text-muted flex items-center gap-1 bg-background px-2.5 py-1 rounded-md border border-border">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            +1 EulerCoin
          </span>
        </div>
      </div>

      {/* Already Mastered Banner */}
      {isCompleted && !evaluation ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-md border bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100 flex items-start gap-3.5">
            <div className="p-2 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-[14px] font-bold text-text-heading">
                  {isModuleCompleted ? "Module Complete" : "Topic Complete"}
                </h4>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  Completed
                </span>
              </div>
              <p className="text-[13px] text-text-primary leading-relaxed">
                {isModuleCompleted
                  ? "Nicely done! You’ve finished all topics in this module."
                  : "Nicely done! You’ve finished this topic."}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-[11px] text-text-muted">
              {isModuleCompleted && nextModuleLocked
                ? "Ready to unlock your next milestone?"
                : "Ready to continue through your roadmap?"}
            </span>
            {isModuleCompleted && nextModuleLocked && onUnlockNextModule ? (
              <button
                type="button"
                onClick={onUnlockNextModule}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-accent text-background text-[12px] font-bold hover:opacity-90 transition-opacity shrink-0 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Unlock Next Module</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onNext}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-text-heading text-background text-[12px] font-bold hover:opacity-90 transition-opacity shrink-0 shadow-xs"
              >
                <span>Next Lesson</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : loading ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
          <Loader2 className="w-5 h-5 text-accent animate-spin" />
          <p className="text-[12px] text-text-muted">Preparing concept check for {topicTitle}...</p>
        </div>
      ) : checkpoint ? (
        <div className="space-y-4">
          {/* Question */}
          <p className="text-[14px] md:text-[15px] font-semibold text-text-heading leading-relaxed">
            {checkpoint.question}
          </p>

          {/* Optional Code Snippet */}
          {checkpoint.code_snippet && (
            <div className="bg-[#18181b] text-zinc-100 rounded-md p-3.5 font-mono text-[12px] leading-relaxed overflow-x-auto border border-zinc-800">
              <pre className="m-0 font-mono">{checkpoint.code_snippet}</pre>
            </div>
          )}

          {/* Options */}
          <div className="space-y-2 pt-1">
            {checkpoint.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isSubmitted = evaluation !== null;
              const isCorrectAnswer = checkpoint.correct_index === idx;

              let optionStyle = "bg-background border-border text-text-primary hover:border-accent/40";
              if (isSelected && !isSubmitted) {
                optionStyle = "bg-accent/5 border-accent text-accent font-semibold shadow-xs";
              }
              if (isSubmitted) {
                if (isCorrectAnswer) {
                  optionStyle = "bg-emerald-500/10 border-emerald-500/50 text-emerald-600 font-semibold";
                } else if (isSelected && !isCorrectAnswer) {
                  optionStyle = "bg-red-500/10 border-red-500/50 text-red-600 font-semibold";
                } else {
                  optionStyle = "bg-background/40 border-border/50 text-text-muted opacity-60";
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isSubmitted}
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full text-left p-3 rounded-md border text-[13px] transition-all flex items-start gap-3 ${optionStyle}`}
                >
                  <span className="w-5 h-5 rounded-md border border-current/20 flex items-center justify-center shrink-0 text-[11px] font-mono mt-0.5">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 leading-snug">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Evaluation Banner */}
          {isSubmitted && evaluation && (
            <div className={`p-4 rounded-md border space-y-3 mt-4 animate-in fade-in duration-200 ${
              evaluation.is_correct
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-950 dark:text-emerald-100"
                : "bg-amber-500/10 dark:bg-amber-950/30 border-amber-500/40 dark:border-amber-500/30 text-amber-950 dark:text-amber-100"
            }`}>
              <div className="flex items-center gap-2">
                {evaluation.is_correct ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                )}
                <span className="text-[13px] font-bold text-text-heading">
                  {evaluation.is_correct ? "Correct! +0.5 Skill" : "Incorrect (-0.1 Skill)"}
                </span>
                <span className={`ml-auto text-[10px] font-mono uppercase px-2 py-0.5 rounded-md font-bold border ${
                  evaluation.is_correct
                    ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30"
                }`}>
                  {evaluation.is_correct ? "Passed" : "Try Next Question"}
                </span>
              </div>

              <p className="text-[13px] text-text-primary leading-relaxed">
                {evaluation.explanation}
              </p>

              <div className="pt-2 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-[11px] text-text-muted">
                  {evaluation.is_correct
                    ? "Great momentum. Ready for the next lesson?"
                    : "Review the explanation above, then try this follow-up question to lock in the concept."}
                </span>
                {evaluation.is_correct ? (
                  <button
                    type="button"
                    onClick={onNext}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-text-heading text-background text-[12px] font-bold hover:opacity-90 transition-opacity shrink-0 ml-auto"
                  >
                    <span>Next Lesson</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRetryNextQuestion}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent text-background text-[12px] font-bold hover:opacity-90 transition-opacity shrink-0 ml-auto shadow-xs"
                  >
                    <span>Try Follow-up Question</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Action Button */}
          {!isSubmitted && (
            <div className="pt-2 flex items-center justify-between gap-3">
              <span className="text-[11px] text-text-muted italic flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" />
                Select the option you believe is right
              </span>
              <button
                type="button"
                disabled={selectedOption === null || isSubmitting}
                onClick={handleSubmit}
                className="px-4 py-2 bg-accent text-background rounded-md text-[13px] font-bold hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-2 shadow-xs"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Check Answer</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4 text-text-muted text-[12px]">
          Unable to load check. You may proceed directly to the next topic.
        </div>
      )}
    </div>
  );
}
