'use client';

import React, { useState } from 'react';
import { practiceAPI, authAPI, MCQSessionRead } from '@/lib/api';
import MCQSetup from '@/components/roadmap/MCQSetup';
import MCQQuestionView from '@/components/roadmap/MCQQuestionView';
import MCQResults from '@/components/roadmap/MCQResults';

interface MCQPracticeProps {
    roadmapId?: number;
    subtopicId?: string;
    topicName: string;
    topics?: string[]; // All topics in current module
    moduleTitle?: string;
    learningObjectives?: string;
    subject: string;
    weekNumber: number;
    isPro: boolean;
    userCredits: number;
    onPointsEarned: (amount: number) => void;
    onRefreshProfile: () => Promise<void>;
    onClose?: () => void;
}

export default function MCQPractice({
    roadmapId,
    subtopicId,
    topicName,
    topics = [],
    moduleTitle,
    learningObjectives,
    subject,
    weekNumber,
    isPro,
    userCredits,
    onPointsEarned,
    onRefreshProfile,
    onClose
}: MCQPracticeProps) {
    const [mcqSession, setMcqSession] = useState<MCQSessionRead | null>(null);
    const [incompleteSession, setIncompleteSession] = useState<MCQSessionRead | null>(null);
    const [mcqHistory, setMcqHistory] = useState<MCQSessionRead[]>([]);
    const [learnerProfile, setLearnerProfile] = useState<any | null>(null);
    const [currentMcqIdx, setCurrentMcqIdx] = useState(0);
    const [mcqAnswers, setMcqAnswers] = useState<(number | string)[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [questionCount, setQuestionCount] = useState(18);
    const [showResults, setShowResults] = useState(false);

    // Check for incomplete sessions when modal or subtopic opens
    React.useEffect(() => {
        if (isPro && subtopicId) {
            practiceAPI.getIncompleteMCQSession(subtopicId)
                .then(session => {
                    if (session) setIncompleteSession(session);
                })
                .catch(err => console.error('Error checking for incomplete MCQ:', err));
        }
    }, [isPro, subtopicId]);

    const handleResume = () => {
        if (!incompleteSession) return;
        setMcqSession(incompleteSession);
        setIncompleteSession(null);
        setCurrentMcqIdx(0);
        setMcqAnswers([]);
        setShowResults(false);
    };

    const handleAbandonAndFresh = async () => {
        if (incompleteSession) {
            try {
                await practiceAPI.abandonMCQSession(incompleteSession.id);
                setIncompleteSession(null);
            } catch (err) {
                console.error('Error abandoning session:', err);
            }
        }
        handleGenerate();
    };

    const handleGenerate = async () => {
        if (!isPro) return;
        setIsGenerating(true);

        // Fetch learner profile & practice history on demand in parallel
        let pastHistory: MCQSessionRead[] = [];
        let profileData: any = null;
        try {
            const [historyRes, profileRes] = await Promise.allSettled([
                practiceAPI.getAllMCQHistory(),
                authAPI.getMe()
            ]);
            if (historyRes.status === 'fulfilled' && Array.isArray(historyRes.value)) {
                pastHistory = historyRes.value;
                setMcqHistory(pastHistory);
            }
            if (profileRes.status === 'fulfilled' && profileRes.value) {
                profileData = profileRes.value;
                setLearnerProfile(profileData);
            }
        } catch (fetchErr) {
            console.debug('Optional learner context fetch skipped:', fetchErr);
        }

        // Build list of topics covered by the module
        const moduleTopicsList = (topics && topics.length > 0)
            ? topics
            : [topicName];

        // Build context on learner past performance & top skills
        let learnerContext = '';
        if (pastHistory && pastHistory.length > 0) {
            const completedAttempts = pastHistory.filter(h => h.status === 'completed' && h.score !== undefined);
            const totalSetsSolved = completedAttempts.length;
            
            const recentAttempts = completedAttempts.slice(0, 5).map(h => {
                const pct = Math.round((h.score || 0) * 100);
                return `- ${h.topic_name || 'Practice Set'}: Score ${pct}%`;
            }).join('\n');

            learnerContext += `\nLearner Practice History:
- Total completed practice sets: ${totalSetsSolved}
- Recent attempt overview:
${recentAttempts || 'No previous attempts'}`;
        }

        if (profileData?.skills && Array.isArray(profileData.skills) && profileData.skills.length > 0) {
            const topSkills = profileData.skills
                .slice()
                .sort((a: any, b: any) => (b.confidence_score || 0) - (a.confidence_score || 0))
                .slice(0, 4)
                .map((s: any) => `- ${s.name || s.canonical_skill_id}: ${s.tier || 'developing'} (${Math.round(s.confidence_score || 0)}% confidence, ${s.practice_score || 0} practice score)`)
                .join('\n');

            learnerContext += `\nLearner's Top Skills:
${topSkills}`;
        }

        try {
            const session = await practiceAPI.generateMCQSession({
                roadmap_id: roadmapId,
                subtopic_id: subtopicId,
                topic_name: topicName,
                topics: moduleTopicsList,
                module_title: moduleTitle,
                learning_objectives: learningObjectives,
                learner_context: learnerContext,
                subject: subject,
                week_number: weekNumber,
                num_questions: questionCount
            });

            setMcqSession(session);
            setCurrentMcqIdx(0);
            setMcqAnswers([]);
            setShowResults(false);
            await onRefreshProfile(); // Update credits display
        } catch (err: any) {
            console.error('Error generating MCQ:', err);
            alert(err.response?.data?.detail || err.message || 'Failed to generate assessment');
        } finally {
            setIsGenerating(false);
        }
    };

    const isAnswerCorrect = (q: any, ans: any): boolean => {
        if (ans === null || ans === undefined) return false;
        const isOpen = !q.options || q.options.length === 0 || q.format === 'open_ended' || q.format === 'open_ended_coding';
        if (isOpen) {
            if (typeof ans !== 'string' || !q.ground_truth_answer) return false;
            const normAns = ans.trim().replace(/^['"]|['"]$/g, '').trim().toLowerCase();
            const normGroundTruth = String(q.ground_truth_answer).trim().replace(/^['"]|['"]$/g, '').trim().toLowerCase();
            return normAns === normGroundTruth;
        }
        return ans === q.correct_answer_index;
    };

    const handleSubmit = async (customQuestions?: any[]) => {
        const questionsToSubmit = customQuestions || mcqSession?.questions || [];
        const validAnswers = mcqAnswers.filter(a => a !== undefined && a !== null);
        if (!mcqSession || validAnswers.length === 0) return;

        setIsSubmitting(true);
        try {
            const result = await practiceAPI.submitMCQSession(mcqSession.id, mcqAnswers, questionsToSubmit);
            setMcqSession(result);
            setShowResults(true);
            
            // Calculate points earned (1 per correct answer)
            const correctCount = result.questions.filter((q, i) => isAnswerCorrect(q, result.user_answers?.[i])).length;
            if (correctCount > 0) {
                onPointsEarned(correctCount);
            }
            
            await onRefreshProfile();
        } catch (err: any) {
            console.error('Error submitting MCQ:', err);
            alert(err.response?.data?.detail || err.message || 'Failed to submit MCQ. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const reset = () => {
        setMcqSession(null);
        setShowResults(false);
        if (onClose) onClose();
    };

    return (
        <div className="flex flex-col p-5 border border-[var(--accent)] rounded-md bg-accent-muted/5 shadow-sm h-full relative group">
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="appropriate-sans text-[8px] font-bold text-accent uppercase tracking-[0.2em]">Targeted Practice</span>
                    {isPro && (
                        <div className="flex items-center gap-1 opacity-60">
                            <span className="text-[10px]">💎</span>
                            <span className="appropriate-sans text-[8px] font-bold text-text-heading">{userCredits} Credits</span>
                        </div>
                    )}
                </div>
                <div className="flex items-baseline justify-between mb-0.5">
                    <span className="appropriate-sans text-[15px] font-bold text-text-heading uppercase tracking-tight">Curated Questions</span>
                </div>
                <p className="appropriate-sans text-[11px] text-text-muted italic opacity-70">Practice some MCQ questions.</p>
            </div>

            <div className="flex-1 flex flex-col">
                <MCQSetup
                    incompleteSession={incompleteSession}
                    handleResume={handleResume}
                    handleAbandonAndFresh={handleAbandonAndFresh}
                    isGenerating={isGenerating}
                    isPro={isPro}
                    handleGenerate={handleGenerate}
                    mcqHistory={mcqHistory}
                    setMcqSession={setMcqSession}
                    setCurrentMcqIdx={setCurrentMcqIdx}
                    setMcqAnswers={setMcqAnswers}
                    setShowResults={setShowResults}
                />
            </div>

            {isGenerating && (
                <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6 text-center">
                    <div className="animate-in fade-in zoom-in duration-300 flex flex-col items-center">
                        <p className="appropriate-sans text-[11px] font-bold text-accent mb-4">
                            Please give us a few seconds...crafting custom questions across all topics in {moduleTitle || `Module ${weekNumber}`}.
                        </p>
                    </div>
                </div>
            )}

            {/* MCQ Active Session Overlay */}
            {mcqSession && !showResults && (
                <MCQQuestionView
                    mcqSession={mcqSession}
                    currentMcqIdx={currentMcqIdx}
                    mcqAnswers={mcqAnswers}
                    setMcqAnswers={setMcqAnswers}
                    setCurrentMcqIdx={setCurrentMcqIdx}
                    setMcqSession={setMcqSession}
                    subject={subject}
                    moduleTitle={moduleTitle || ''}
                    topicName={topicName}
                    handleSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                />
            )}

            {/* MCQ Results Overlay */}
            {showResults && mcqSession && (
                <MCQResults
                    mcqSession={mcqSession}
                    mcqAnswers={mcqAnswers}
                    topicName={topicName}
                    reset={reset}
                />
            )}
        </div>
    );
}
