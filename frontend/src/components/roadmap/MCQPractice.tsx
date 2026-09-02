'use client';

import React, { useState } from 'react';
import { logAIUsage } from '@/lib/usageTracker';
import { practiceAPI, authAPI, MCQSessionRead } from '@/lib/api';
import { OpenRouterModal } from '@/components/landing/OpenRouterModal';
import { LocalAIModal } from '@/components/landing/LocalAIModal';
import { CreateMLCEngine } from '@mlc-ai/web-llm';
import MCQSetup from '@/components/roadmap/MCQSetup';
import MCQQuestionView from '@/components/roadmap/MCQQuestionView';
import MCQResults from '@/components/roadmap/MCQResults';

interface MCQPracticeProps {
    roadmapId?: number;
    subtopicId?: string;
    topicName: string;
    topics?: string[]; // All topics in current module
    moduleTitle?: string;
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
    const [mcqAnswers, setMcqAnswers] = useState<number[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [questionCount, setQuestionCount] = useState(10);
    const [showResults, setShowResults] = useState(false);

    // Engine Selection State
    const [useOpenRouter, setUseOpenRouter] = useState(true);
    const [openRouterKey, setOpenRouterKey] = useState<string | null>(null);
    const [openRouterModel, setOpenRouterModel] = useState<string>('openai/gpt-4o');
    const [isOpenRouterModalOpen, setIsOpenRouterModalOpen] = useState(false);

    const [useLocalAI, setUseLocalAI] = useState(false);
    const [localAIModelId, setLocalAIModelId] = useState<string | null>(null);
    const [localAIModelName, setLocalAIModelName] = useState<string | null>(null);
    const [isLocalAIModalOpen, setIsLocalAIModalOpen] = useState(false);

    React.useEffect(() => {
        setOpenRouterKey(localStorage.getItem('openRouterKey'));
        setOpenRouterModel(localStorage.getItem('openRouterModel') || 'openai/gpt-4o');
        setLocalAIModelId(localStorage.getItem('localAIModelId'));
        setLocalAIModelName(localStorage.getItem('localAIModelName'));
    }, []);

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
        if (!useOpenRouter && !useLocalAI && !isPro) return;
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
        const topicsStr = moduleTopicsList.map((t, idx) => `${idx + 1}. ${t}`).join('\n');

        // Build context on learner past performance & top skills
        let learnerContext = '';
        if (pastHistory && pastHistory.length > 0) {
            const completedAttempts = pastHistory.filter(h => h.status === 'completed' && h.score !== undefined);
            const totalSetsSolved = completedAttempts.length;
            
            // Summarize recent attempts
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
        
        const systemPrompt = `You are a subject matter expert in "${subject}".
Generate ${questionCount} Multiple Choice Questions (MCQs) for a learner currently in Module/Week ${weekNumber}${moduleTitle ? ` ("${moduleTitle}")` : ''}.

The questions MUST comprehensively cover and be distributed across ALL the following topics of this module:
${topicsStr}
${learnerContext ? `\nLearner Background Context (use this to tailor difficulty and cognitive challenge without referencing it explicitly in the questions):${learnerContext}\n` : ''}
CRITICAL QUALITY STANDARDS:
- Questions must be distributed across the module topics listed above, testing holistic understanding of this module.
- Questions must be CONCEPTUAL and SITUATIONAL. Avoid simple recall or rote memorization.
- Focus on application of principles, cross-topic connections, and "what would happen if" scenarios.
- Each question must have exactly 4 options.
- Only one option must be clearly correct.
- Options should be plausible but distinct.
- Do not generate questions that can be answered by simply recalling a definition. Every question must require the learner to think, apply, or reason.
- Provide a detailed explanation for why the correct answer is right.

Return ONLY a JSON array of objects. Each object must have:
- id: a unique string ID for the question (e.g. "q1", "q2")
- question: string
- options: array of 4 strings
- correct_answer_index: integer (0-3)
- explanation: a concise one-line explanation of the correct choice`;

        try {
            let session;
            
            if (openRouterKey && useOpenRouter) {
                const requestBody = {
                    model: openRouterModel || 'openai/gpt-4o',
                    messages: [
                        { role: "system", content: systemPrompt }
                    ],
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
                if (!orResponse.ok) throw new Error(orData.error?.message || "OpenRouter generation failed.");

                if (orData.error) {
                    throw new Error(orData.error.message || "OpenRouter internal model error.");
                }

                if (!orData.choices || orData.choices.length === 0) {
                    throw new Error("The AI model failed to return a valid response (possibly due to a content filter). Please try again or select a different model.");
                }

                let questions;
                try {
                    let content = orData.choices[0].message?.content?.trim() || "";
                    content = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

                    const jsonBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
                    if (jsonBlockMatch && jsonBlockMatch[1]) {
                        content = jsonBlockMatch[1].trim();
                    } else {
                        const firstBrace = content.indexOf('[');
                        const firstObj = content.indexOf('{');
                        const start = (firstBrace !== -1 && (firstObj === -1 || firstBrace < firstObj)) ? firstBrace : firstObj;
                        
                        const lastBrace = content.lastIndexOf(']');
                        const lastObj = content.lastIndexOf('}');
                        const end = (lastBrace !== -1 && (lastObj === -1 || lastBrace > lastObj)) ? lastBrace : lastObj;
                        
                        if (start !== -1 && end !== -1 && end >= start) {
                            content = content.substring(start, end + 1);
                        }
                    }

                    questions = JSON.parse(content);
                    if (questions.questions) questions = questions.questions; // Handle nested json
                } catch (e: any) {
                    throw new Error("The AI model returned an incomplete or corrupt response. Please try generating again, or select a different model from the settings.");
                }

                session = await practiceAPI.saveExternalMCQSession({
                    roadmap_id: roadmapId,
                    subtopic_id: subtopicId,
                    topic_name: topicName,
                    subject: subject,
                    week_number: weekNumber,
                    questions: questions
                });
                
                try {
                    logAIUsage({
                        id: session?.id,
                        subject: `Practice: ${topicName}`,
                        model: orData.model || openRouterModel,
                        prompt_tokens: orData.usage?.prompt_tokens || 0,
                        completion_tokens: orData.usage?.completion_tokens || 0,
                        total_tokens: orData.usage?.total_tokens || 0
                    });
                } catch (e) {}
            } else if (localAIModelId && useLocalAI) {
                let engine;
                try {
                    const initProgressCallback = (report: { text: string }) => {
                        console.log("Local AI Init:", report.text);
                    };
                    engine = await CreateMLCEngine(localAIModelId, { initProgressCallback });
                } catch (err) {
                    throw new Error("Hardware Crash: Failed to load the local AI engine. Please try a different model.");
                }

                let generatedText = '';
                let parseSuccess = false;
                let parsedJSON = null;

                let responseUsage = null;

                for (let attempt = 1; attempt <= 2; attempt++) {
                    try {
                        const response = await engine.chat.completions.create({
                            messages: [
                                { role: "user", content: systemPrompt }
                            ]
                        });
                        
                        generatedText = response.choices[0].message.content || '';
                        responseUsage = response.usage || null;
                        
                        let cleanedText = generatedText.replace(/```json/gi, '').replace(/```/g, '').trim();
                        const startIdx = cleanedText.indexOf('[');
                        const endIdx = cleanedText.lastIndexOf(']');
                        if (startIdx !== -1 && endIdx !== -1) {
                            cleanedText = cleanedText.substring(startIdx, endIdx + 1);
                        }
                        
                        parsedJSON = JSON.parse(cleanedText);
                        if (parsedJSON.questions) parsedJSON = parsedJSON.questions; // Handle nested json
                        parseSuccess = true;
                        break;
                    } catch (err: any) {
                        console.error("Local AI JSON parse attempt failed", err, generatedText);
                        if (attempt === 2) throw new Error("Local AI failed to generate valid JSON after 2 attempts. Try a different model or use EulerFold AI.");
                    }
                }

                if (!parseSuccess || !parsedJSON) {
                    throw new Error("Local AI failed to generate valid JSON.");
                }

                session = await practiceAPI.saveExternalMCQSession({
                    roadmap_id: roadmapId,
                    subtopic_id: subtopicId,
                    topic_name: topicName,
                    topics: moduleTopicsList,
                    module_title: moduleTitle,
                    subject: subject,
                    week_number: weekNumber,
                    questions: parsedJSON
                });

                try {
                    logAIUsage({
                        id: session?.id,
                        subject: `Practice: ${topicName}`,
                        model: localAIModelId,
                        prompt_tokens: responseUsage?.prompt_tokens || 0,
                        completion_tokens: responseUsage?.completion_tokens || 0,
                        total_tokens: responseUsage?.total_tokens || 0
                    });
                } catch (e) {}
            } else {
                session = await practiceAPI.generateMCQSession({
                    roadmap_id: roadmapId,
                    subtopic_id: subtopicId,
                    topic_name: topicName,
                    topics: moduleTopicsList,
                    module_title: moduleTitle,
                    learner_context: learnerContext,
                    subject: subject,
                    week_number: weekNumber,
                    num_questions: questionCount
                });
            }

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

    const handleSubmit = async () => {
        const validAnswers = mcqAnswers.filter(a => a !== undefined && a !== null);
        if (!mcqSession || validAnswers.length !== mcqSession.questions.length) return;
        
        if (!confirm('Are you sure you want to submit your answers for grading?')) {
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await practiceAPI.submitMCQSession(mcqSession.id, mcqAnswers);
            setMcqSession(result);
            setShowResults(true);
            
            // Calculate points earned (1 per correct answer)
            const correctCount = result.questions.filter((q, i) => result.user_answers?.[i] === q.correct_answer_index).length;
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
        <div className="flex flex-col p-5 border border-[var(--accent)] rounded-lg bg-accent-muted/5 shadow-sm h-full relative group">
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
                    questionCount={questionCount}
                    setQuestionCount={setQuestionCount}
                    useOpenRouter={useOpenRouter}
                    setUseOpenRouter={setUseOpenRouter}
                    useLocalAI={useLocalAI}
                    setUseLocalAI={setUseLocalAI}
                    isPro={isPro}
                    userCredits={userCredits}
                    openRouterKey={openRouterKey}
                    localAIModelId={localAIModelId}
                    setIsOpenRouterModalOpen={setIsOpenRouterModalOpen}
                    setIsLocalAIModalOpen={setIsLocalAIModalOpen}
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
                        <div className="mb-4">
                        </div>
                        <p className="appropriate-sans text-[11px] font-bold text-accent mb-4">
                            Please give us a few seconds...crafting custom questions across all topics in {moduleTitle || `Module ${weekNumber}`}.
                        </p>
                    </div>
                </div>
            )}

            <OpenRouterModal 
                isOpen={isOpenRouterModalOpen} 
                onClose={() => {
                    setIsOpenRouterModalOpen(false);
                    setOpenRouterKey(localStorage.getItem('openRouterKey'));
                    setOpenRouterModel(localStorage.getItem('openRouterModel') || 'openai/gpt-4o');
                }} 
                formData={{ subject, time_value: weekNumber, goal: topicName }}
                onSuccess={() => {}}
            />
            <LocalAIModal
                isOpen={isLocalAIModalOpen}
                onClose={() => setIsLocalAIModalOpen(false)}
                onSelectModel={(modelId, modelName) => {
                    localStorage.setItem('localAIModelId', modelId);
                    localStorage.setItem('localAIModelName', modelName);
                    setLocalAIModelId(modelId);
                    setLocalAIModelName(modelName);
                    setUseLocalAI(true);
                    setUseOpenRouter(false);
                }}
            />

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
