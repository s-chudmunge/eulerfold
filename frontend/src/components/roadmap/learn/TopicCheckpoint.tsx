'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Sparkles, ArrowRight, Loader2, HelpCircle, Lock } from 'lucide-react';
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
  hasVideo?: boolean;
  videoProgress?: number;
  isVideoCheckpointUnlocked?: boolean;
  isModuleCompleted?: boolean;
  nextModuleLocked?: boolean;
  onUnlockNextModule?: () => void;
  onSuccess: (coinsEarned: number) => void;
  onNext: () => void;
  onBridgeCreated?: (topic: Record<string, any>, moduleNumber: number, topicIndex: number) => void;
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
  hasVideo = false,
  videoProgress = 0,
  isVideoCheckpointUnlocked = false,
  isModuleCompleted = false,
  nextModuleLocked = false,
  onUnlockNextModule,
  onSuccess,
  onNext,
  onBridgeCreated
}: TopicCheckpointProps) {
  const [checkpoint, setCheckpoint] = useState<CheckpointItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<CheckpointEvaluateResponse | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

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

  // Cache availability must never unlock a video checkpoint. A topic can briefly
  // render without its video ID while the session initializes, which may warm the
  // cache before the video is known. Only playback can unlock this check.
  const isVideoGated = hasVideo && !isCompleted && !isVideoCheckpointUnlocked;

  useEffect(() => {
    // If cached, load immediately without debounce
    if (checkpointMemoryCache.has(cacheKey)) {
      setCheckpoint(checkpointMemoryCache.get(cacheKey)!);
      setEvaluation(null);
      setSelectedOption(null);
      setLoading(false);
      return;
    }

    // If a video exists for this topic, only trigger AI generation once user watches >= 50% (or if already completed)
    if (hasVideo && !isCompleted && !isVideoCheckpointUnlocked) {
      setLoading(false);
      setCheckpoint(null);
      setEvaluation(null);
      setSelectedOption(null);
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
  }, [roadmapId, moduleNumber, topicIndex, topicTitle, hasVideo, isCompleted, isVideoCheckpointUnlocked]);

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

          {isReviewOpen && (
            <div className="rounded-md border border-border bg-background/60 p-4 space-y-3">
              {loading ? (
                <div className="flex items-center gap-2 text-[12px] text-text-muted">
                  <Loader2 className="w-4 h-4 animate-spin text-accent" />
                  Loading completed question...
                </div>
              ) : checkpoint ? (
                <>
                  <p className="text-[14px] font-semibold text-text-heading leading-relaxed">
                    {checkpoint.question}
                  </p>
                  <div className="space-y-2">
                    {checkpoint.options.map((option, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-3 rounded-md border p-3 text-[13px] ${
                          index === checkpoint.correct_index
                            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                            : 'border-border bg-sidebar text-text-muted'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-md border border-current/20 flex items-center justify-center shrink-0 text-[11px] font-mono">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="leading-snug">{option}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[12px] text-text-muted leading-relaxed pt-1">
                    {checkpoint.explanation}
                  </p>
                </>
              ) : (
                <p className="text-[12px] text-text-muted">
                  This topic was completed without a saved concept check.
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <span className="text-[11px] text-text-muted">
              {isModuleCompleted && nextModuleLocked
                ? "Ready to unlock your next milestone?"
                : "Ready to continue through your roadmap?"}
            </span>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsReviewOpen((open) => !open)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-border bg-background text-text-primary text-[12px] font-bold hover:border-accent/50 transition-colors"
              >
                <span>{isReviewOpen ? 'Hide Question' : 'Review Question'}</span>
              </button>
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
        </div>
      ) : isVideoGated ? (
        <div className="py-6 px-4 rounded-md border border-border bg-background/60 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-text-heading">
                Check unlocks halfway through
              </h4>
              <p className="text-[12px] text-text-muted mt-0.5">
                Take in the first half of the video, then test what you learned.
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto flex items-center gap-3 shrink-0">
            <div className="flex-1 sm:w-28 bg-sidebar border border-border h-2 rounded-full overflow-hidden">
              <div
                className="bg-accent h-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((videoProgress / 0.5) * 100))}%` }}
              />
            </div>
            <span className="inconsolata-ui text-[11px] font-bold text-text-muted shrink-0">
              {Math.min(50, Math.round(videoProgress * 100))}% / 50%
            </span>
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
                  {evaluation.is_correct ? "Correct! +0.5 Skill" : evaluation.bridge_topic ? "Quick review ready (-0.1 Skill)" : "Incorrect (-0.1 Skill)"}
                </span>
                <span className={`ml-auto text-[10px] font-mono uppercase px-2 py-0.5 rounded-md font-bold border ${
                  evaluation.is_correct
                    ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                    : evaluation.bridge_topic
                      ? "bg-accent/20 text-accent border-accent/30"
                      : "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30"
                }`}>
                  {evaluation.is_correct ? "Passed" : evaluation.bridge_topic ? "Review Ready" : "Try Next Question"}
                </span>
              </div>

              <div className="space-y-1.5">
                {evaluation.feedback && (
                  <p className="text-[13px] font-medium text-text-heading leading-relaxed">
                    {evaluation.feedback}
                  </p>
                )}
                <p className="text-[12px] text-text-primary leading-relaxed">
                  {evaluation.explanation}
                </p>
              </div>

              <div className="pt-2 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-[11px] text-text-muted">
                  {evaluation.is_correct
                    ? "Great momentum. Ready for the next lesson?"
                    : evaluation.bridge_topic
                      ? "We've added a short review lesson to help you lock in the basics before retrying."
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
                ) : evaluation.bridge_topic ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (evaluation.bridge_topic && evaluation.bridge_module_number && evaluation.bridge_topic_index !== null && evaluation.bridge_topic_index !== undefined) {
                        onBridgeCreated?.(evaluation.bridge_topic, evaluation.bridge_module_number, evaluation.bridge_topic_index);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-accent text-background text-[12px] font-bold hover:opacity-90 transition-opacity shrink-0 ml-auto shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Take a quick review</span>
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
