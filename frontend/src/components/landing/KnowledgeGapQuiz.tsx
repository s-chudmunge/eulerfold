"use client";

import React, { useState, useEffect } from 'react';
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
  RotateCcw
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import PaymentModal from '../PaymentModal';
import AiEngineSelector from '@/components/settings/AiEngineSelector';
import { CreateMLCEngine } from '@mlc-ai/web-llm';
import { jsonrepair } from 'jsonrepair';
import { api } from '@/lib/api';
import { logAIUsage } from '@/lib/usageTracker';

interface KnowledgeGapQuizProps {
  onRoadmapGenerated: (data: RoadmapData, formData: any) => void;
  onLoadingChange?: (loading: boolean) => void;
}

const KnowledgeGapQuiz: React.FC<KnowledgeGapQuizProps> = ({ 
  onRoadmapGenerated,
  onLoadingChange
}) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    target_role: '',
    known_skills: '',
    time_value: 4,
    strict_official_sources: false,
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  
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
  const [diagnosticReason, setDiagnosticReason] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [pendingAssessment, setPendingAssessment] = useState<any | null>(null);

  const [openRouterKey, setOpenRouterKey] = useState<string | null>(null);
  const [useOpenRouter, setUseOpenRouter] = useState(false);
  const [openRouterModel, setOpenRouterModel] = useState<string | null>(null);
  const [localAIModelId, setLocalAIModelId] = useState<string | null>(null);
  const [useLocalAI, setUseLocalAI] = useState(false);

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
          diagnosticReason,
          courseGenerated: false,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.error("Failed to save active diagnostic quiz draft:", e);
      }
    }
  }, [quizActive, quizQuestions, quizAnswers, flaggedQuestions, timeLeft, quizRound, diagnosticReason, formData]);

  const resumePendingAssessment = () => {
    if (!pendingAssessment) return;
    setFormData(pendingAssessment.formData || formData);
    setQuizQuestions(pendingAssessment.quizQuestions || []);
    setQuizAnswers(pendingAssessment.quizAnswers || []);
    setFlaggedQuestions(pendingAssessment.flaggedQuestions || []);
    setTimeLeft(pendingAssessment.timeLeft || 600);
    setQuizRound(pendingAssessment.quizRound || 1);
    setDiagnosticReason(pendingAssessment.diagnosticReason || null);
    setQuizActive(true);
  };

  const discardPendingAssessment = () => {
    localStorage.removeItem('active_diagnostic_quiz');
    setPendingAssessment(null);
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
    const fetchProfileAndCredits = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('supabase_uid', session.user.id)
          .single();
        if (data) {
          setCredits(data.roadmap_credits);
          setIsPro(data.is_pro);
        }
      } else {
        setIsLoggedIn(false);
      }
    };
    fetchProfileAndCredits();
  }, []);

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
          submitQuizAndGenerateGapRoadmap();
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

  const extractQuestionsFromChunk = (rawText: string) => {
    let text = rawText.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    if (text.startsWith("```json")) text = text.replace(/^```json\n?/, "").replace(/```$/, "");
    else if (text.startsWith("```")) text = text.replace(/^```\n?/, "").replace(/```$/, "");

    const questions: any[] = [];
    const objectRegex = /\{\s*"id"\s*:\s*"[^"]+"\s*,\s*"question"\s*:\s*"[\s\S]*?"\s*,\s*"options"\s*:\s*\[[\s\S]*?\]\s*,\s*"correct_answer_index"\s*:\s*\d+[\s\S]*?\}/gi;
    
    let match;
    while ((match = objectRegex.exec(text)) !== null) {
      try {
        const parsedObj = JSON.parse(jsonrepair(match[0]));
        if (parsedObj && parsedObj.question && Array.isArray(parsedObj.options) && parsedObj.options.length === 4) {
          questions.push(parsedObj);
        }
      } catch (e) {}
    }

    if (questions.length === 0) {
      try {
        const parsed = JSON.parse(jsonrepair(text));
        const arr = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.data || parsed.quiz || []);
        return arr.filter((q: any) => q && q.question && Array.isArray(q.options) && q.options.length === 4);
      } catch (e) {
        return [];
      }
    }
    return questions;
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

    const systemPrompt = "You are a technical subject matter expert. Output JSON ONLY.";
    const userPrompt = `The user is aspiring to be a "${formData.target_role}".
They already know: "${formData.known_skills}".

Your goal is to generate 5 Multiple Choice Questions (MCQs) that test their knowledge on ADVANCED or MISSING concepts required for ${formData.target_role} that they might NOT know yet. 
Do not test them on what they already know.

CRITICAL QUALITY STANDARDS:
- Questions must be CONCEPTUAL and SITUATIONAL. Avoid simple recall.
- Focus on application of principles.
- Each question must have exactly 4 options.
- Only one option must be clearly correct.

Return ONLY a JSON array of objects. Each object must have:
- id: a unique string ID for the question (e.g. "q1")
- question: string
- options: array of 4 strings
- correct_answer_index: integer (0-3)
- explanation: a concise one-line explanation of the correct choice`;

    let accumulatedText = "";
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
          setTimeLeft(600);
          setIsTimerPaused(false);
          setQuizActive(true);
          setIsGenerating(false);
        }
      }
    };

    try {
      if (openRouterKey && useOpenRouter) {
        const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
        const requestBody = {
          model: openRouterModel || 'openai/gpt-4o',
          messages: [{ role: "user", content: fullPrompt }],
          response_format: { type: "json_object" },
          max_tokens: 4096,
          stream: true
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

        if (!orResponse.ok) {
          const errorData = await orResponse.json();
          throw new Error(errorData.error?.message || "OpenRouter generation failed.");
        }

        const reader = orResponse.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        let lineBuffer = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            lineBuffer += decoder.decode(value, { stream: true });
            const lines = lineBuffer.split("\n");
            lineBuffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const dataStr = line.slice(6).trim();
                if (dataStr === "[DONE]") continue;
                try {
                  const parsedChunk = JSON.parse(dataStr);
                  const token = parsedChunk.choices?.[0]?.delta?.content || "";
                  if (token) processChunk(token);
                } catch (e) {}
              }
            }
          }
        }
      } else if (localAIModelId && useLocalAI) {
        let engine;
        try {
          engine = await CreateMLCEngine(localAIModelId, { initProgressCallback: (r) => console.log(r.text) });
          const asyncGenerator = await engine.chat.completions.create({
            messages: [
              { role: "system", content: "You are a strict JSON data generator. Reply ONLY with valid JSON." },
              { role: "user", content: userPrompt + "\nCRITICAL: Output ONLY a raw JSON array of objects." }
            ],
            max_tokens: 4096,
            stream: true
          });

          for await (const chunk of asyncGenerator) {
            const token = chunk.choices[0]?.delta?.content || "";
            if (token) processChunk(token);
          }
        } finally {
          if (engine) await engine.unload();
        }
      } else {
        // Backend streaming endpoint call
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
            question_count: 5
          })
        });

        if (streamResponse.ok && streamResponse.body) {
          const reader = streamResponse.body.getReader();
          const decoder = new TextDecoder("utf-8");
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
            question_count: 5
          });
          setQuizQuestions(quizData);
          setQuizAnswers(new Array(quizData.length).fill(null));
          setFlaggedQuestions(new Array(quizData.length).fill(false));
          setTimeLeft(600);
          setIsTimerPaused(false);
          setQuizActive(true);
        }
      }

      // Ensure final parsing pass if test hasn't started yet
      const finalExtracted = extractQuestionsFromChunk(accumulatedText);
      if (finalExtracted.length > 0) {
        setQuizQuestions(finalExtracted);
        if (!testStarted) {
          setQuizAnswers(new Array(finalExtracted.length).fill(null));
          setFlaggedQuestions(new Array(finalExtracted.length).fill(false));
          setTimeLeft(600);
          setIsTimerPaused(false);
          setQuizActive(true);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to generate diagnostic quiz.');
      setQuizActive(false);
    } finally {
      setIsGenerating(false);
    }
  };


  const handleAttemptSubmit = () => {
    const unansweredCount = quizAnswers.filter(a => a === null).length;
    if (unansweredCount > 0) {
      setIsConfirmSubmitModalOpen(true);
    } else {
      evaluateOrSubmitQuiz();
    }
  };

  const exitAssessment = () => {
    setQuizActive(false);
    setQuizQuestions([]);
    setQuizAnswers([]);
    setFlaggedQuestions([]);
    setQuizRound(1);
    setDiagnosticReason(null);
    setIsExitModalOpen(false);
    setIsConfirmSubmitModalOpen(false);
    setIsEvaluating(false);
  };

  const evaluateOrSubmitQuiz = async () => {
    setIsConfirmSubmitModalOpen(false);
    setError(null);

    if (quizRound === 1) {
      setIsEvaluating(true);
      const qaPayload = quizQuestions.map((q, i) => ({
        question: q.question,
        options: q.options,
        selected_option: quizAnswers[i] !== null ? q.options[quizAnswers[i]!] : "Unanswered",
        correct_option: q.options[q.correct_answer_index],
        is_correct: quizAnswers[i] === q.correct_answer_index,
        explanation: q.explanation
      }));

      try {
        let evalResult: any = null;

        if (openRouterKey && useOpenRouter) {
          const evalPrompt = `You are a technical mentor evaluating a learner's diagnostic test for the role of "${formData.target_role}".
Stated prior experience: "${formData.known_skills}".

Test Results:
${JSON.stringify(qaPayload, null, 2)}

Determine if deeper diagnostic probing is required or if you have sufficient evidence to build their custom gap-filling roadmap.

RULES:
1. If user answered between 1 and 4 questions incorrectly, AND those incorrect answers point to specific sub-topics that require deeper diagnosis:
   Set "decision": "DEEPER_DIAGNOSIS".
   Generate 2 or 3 targeted follow-up MCQs in "follow_up_questions" that probe those exact weak spots at a deeper level.
2. If user got 0 incorrect (passed all) OR user got all 5 incorrect (failed all):
   Set "decision": "GENERATE_ROADMAP".

Return ONLY a JSON object:
{
  "decision": "DEEPER_DIAGNOSIS" | "GENERATE_ROADMAP",
  "reason": "Concise explanation of decision",
  "weak_skills": "Concise summary of missing competencies and knowledge gaps identified",
  "follow_up_questions": [
    {
      "id": "f1",
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correct_answer_index": 0,
      "explanation": "string"
    }
  ]
}`;
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
              response_format: { type: "json_object" }
            })
          });
          if (orResponse.ok) {
            const orData = await orResponse.json();
            const text = orData.choices?.[0]?.message?.content || "";
            evalResult = JSON.parse(jsonrepair(text));
          }
        } else {
          evalResult = await roadmapsAPI.evaluateDiagnosticQuiz({
            target_role: formData.target_role,
            known_skills: formData.known_skills,
            round_number: 1,
            questions_and_answers: qaPayload
          });
        }

        if (evalResult && evalResult.decision === "DEEPER_DIAGNOSIS" && Array.isArray(evalResult.follow_up_questions) && evalResult.follow_up_questions.length > 0) {
          setQuizRound(2);
          setQuizQuestions(evalResult.follow_up_questions);
          setQuizAnswers(new Array(evalResult.follow_up_questions.length).fill(null));
          setFlaggedQuestions(new Array(evalResult.follow_up_questions.length).fill(false));
          setCurrentQuizIdx(0);
          setDiagnosticReason(evalResult.reason || "AI detected specific weak spots requiring follow-up probing.");
          setTimeLeft(600);
          setIsEvaluating(false);
          setQuizActive(true);
          return;
        }

        await submitQuizAndGenerateGapRoadmap(evalResult?.weak_skills);
        setIsEvaluating(false);
        return;
      } catch (e) {
        console.error("Diagnostic evaluation error:", e);
      }
      setIsEvaluating(false);
    }

    await submitQuizAndGenerateGapRoadmap();
  };

  const submitQuizAndGenerateGapRoadmap = async (overrideWeakSkills?: string) => {
    setIsConfirmSubmitModalOpen(false);
    setIsGenerating(true);
    setError(null);

    try {
      const failedQuestions = quizQuestions.filter((q, i) => quizAnswers[i] !== q.correct_answer_index);
      
      let weak_skills = overrideWeakSkills || "User passed all diagnostic questions.";
      if (!overrideWeakSkills && failedQuestions.length > 0) {
        weak_skills = "Failed to understand: " + failedQuestions.map(q => q.question).join(" | ");
      }

      const systemPrompt = `You are a technical mentor. Generate a technical learning roadmap. Output JSON ONLY matching the required schema.`;
      const userPrompt = `The user wants to become a "${formData.target_role}".
They are proficient in: "${formData.known_skills}"
However, they struggle with or failed diagnostics on: "${weak_skills}"

Generate a ${formData.time_value} week learning roadmap that COMPLETELY SKIPS the known skills.
Strictly focus the entire roadmap on bridging the gap in their weak areas.

**RULES:**
1. **Logical Progression:** Structure modules to bridge the gap.
2. **Specific Topics:** Each module must have 3-5 specific topics using industry-standard technical terms.
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
          roadmap_plan: coursePlan,
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
            roadmap_plan: parsedJSON,
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
      if (err.response?.status === 402) {
        setIsPaymentModalOpen(true);
      } else {
        setError(err.response?.data?.detail || err.message || 'Generation failed.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // FULL PAGE DIAGNOSTIC ASSESSMENT VIEW
  if (quizActive && quizQuestions.length > 0) {
    const q = quizQuestions[currentQuizIdx];
    const answeredCount = quizAnswers.filter(a => a !== null).length;
    const flaggedCount = flaggedQuestions.filter(Boolean).length;
    const progressPercent = Math.round((answeredCount / quizQuestions.length) * 100);

    return (
      <div className="fixed inset-0 z-[100] bg-background text-text-primary flex flex-col font-sans overflow-hidden animate-in fade-in duration-300">
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
          <div className="flex items-center gap-4">
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
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-accent/10 text-accent font-bold text-[12px] rounded-md border border-accent/20">
                    Question {currentQuizIdx + 1}
                  </span>
                  {quizRound === 2 ? (
                    <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-[11px] rounded-md border border-amber-500/20">
                      Round 2: Follow-Up Assessment
                    </span>
                  ) : (
                    <span className="text-[12px] text-text-muted font-medium">
                      Diagnostic Conceptual Audit
                    </span>
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

              {quizRound === 2 && (
                <div className="mb-6 p-3.5 rounded-md bg-accent/10 border border-accent/20">
                  <p className="text-[12px] text-text-primary leading-relaxed">
                    <strong className="text-text-heading font-semibold">Targeted Follow-Up Assessment:</strong> {diagnosticReason || "The AI detected specific weak spots in Round 1. Answer these follow-up questions to pinpoint your exact knowledge gaps."}
                  </p>
                </div>
              )}

              {/* Question Body */}
              <div className="flex-1">
                <h2 className="text-[17px] md:text-[19px] font-semibold text-text-heading leading-relaxed mb-6">
                  {q.question}
                </h2>

                <div className="grid gap-3 mb-8">
                  {q.options.map((opt: string, idx: number) => {
                    const isSelected = quizAnswers[currentQuizIdx] === idx;
                    const optionLetter = String.fromCharCode(65 + idx);
                    return (
                      <button
                        key={idx}
                        onClick={() => selectOption(idx)}
                        className={`w-full text-left p-4 rounded-md border transition-all flex items-start gap-3.5 text-[14px] ${
                          isSelected
                            ? 'border-accent bg-accent/10 text-text-heading font-semibold shadow-xs'
                            : 'border-border bg-background hover:border-accent/50 text-text-primary hover:bg-sidebar'
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-md font-bold flex items-center justify-center text-[13px] shrink-0 border ${
                          isSelected 
                            ? 'bg-accent text-white border-accent' 
                            : 'bg-sidebar text-text-muted border-border'
                        }`}>
                          {optionLetter}
                        </span>
                        <span className="flex-1 font-medium leading-relaxed pt-0.5">
                          {opt}
                        </span>
                        <span className="text-[11px] text-text-muted font-mono opacity-60 shrink-0 pt-1">
                          [{idx + 1}]
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
                      className="bg-accent text-white px-6 py-2.5 rounded-md text-[13px] font-bold tracking-wide hover:bg-teal-700 shadow-md transition-all"
                    >
                      Submit Assessment
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentQuizIdx(p => p + 1)}
                      className="bg-accent text-white px-6 py-2.5 rounded-md text-[13px] font-bold tracking-wide hover:bg-teal-700 shadow-md transition-all"
                    >
                      Next Question
                    </button>
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
                    <span className="font-semibold text-text-heading">{formData.target_role}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block font-medium">Stated Knowledge:</span>
                    <span className="text-text-primary line-clamp-2">{formData.known_skills}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block font-medium">Target Duration:</span>
                    <span className="font-semibold text-text-heading">{formData.time_value} weeks</span>
                  </div>
                </div>
              </div>

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
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsConfirmSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-md text-[13px] font-semibold text-text-muted hover:text-text-heading border border-border hover:bg-background transition-all"
                >
                  Review Questions
                </button>
                <button
                  onClick={submitQuizAndGenerateGapRoadmap}
                  className="px-4 py-2 rounded-md text-[13px] font-semibold bg-accent text-white hover:bg-teal-700 transition-all"
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
                  Evaluating Diagnostic Performance
                </h3>
                <p className="text-[13px] text-text-muted leading-relaxed">
                  Analyzing your test answers to determine if follow-up probing is needed...
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

        {/* Full-Page Course Generation Overlay */}
        {isGenerating && (
          <div className="fixed inset-0 z-[150] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full bg-sidebar border border-border rounded-md p-8 shadow-2xl space-y-6">
              <div>
                <h3 className="text-[18px] font-bold text-text-heading mb-2">
                  Analyzing Knowledge Gaps
                </h3>
                <p className="text-[13px] text-text-muted leading-relaxed">
                  Evaluating diagnostic responses to build your custom {formData.time_value}-week curriculum...
                </p>
              </div>
              <div className="flex justify-center gap-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
              <p className="text-[11px] text-text-muted border-t border-border/60 pt-4">
                Course Generation In Progress (takes about 20-40 seconds). Please stay on this page.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }


  // STANDARD FORM VIEW
  return (
    <div className="bg-background rounded-md border border-border/50 overflow-hidden shadow-xs max-w-2xl mx-auto w-full relative">
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} onSuccess={() => setIsPaymentModalOpen(false)} />
      
      {isLoggedIn && isPro === false && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/80 backdrop-blur-xs rounded-md border border-border/50 text-center p-6">
            <div className="w-12 h-12 bg-accent/10 rounded-md flex items-center justify-center mb-4 border border-accent/20">
                <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-inter text-[16px] font-semibold text-text-heading mb-2">Pro Exclusive Feature</h3>
            <p className="font-medium text-[13px] text-text-muted max-w-md mb-6 leading-relaxed px-4">
                <strong className="text-text-primary">Unlock the Diagnostic Audit.</strong> Take a quick assessment to find your weak spots, then get a custom course built specifically to fix them.
            </p>
            <Link 
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-md font-bold text-[12px] uppercase tracking-wider shadow-md hover:bg-teal-700 transition-all"
            >
                Upgrade to Pro
            </Link>
        </div>
      )}
      
      {isGenerating && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xs z-50 flex flex-col items-center justify-center rounded-md border border-accent/20">
          <p className="text-[14px] font-bold text-accent tracking-wider uppercase mb-4">
            Generating Diagnostic Assessment...
          </p>
          <div className="flex justify-center gap-1.5 mb-6">
             {[0, 1, 2].map(i => (
               <div key={i} className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}></div>
             ))}
          </div>
          
          <div className="max-w-sm w-full text-center px-4">
            <div className="bg-callout-bg border border-border px-4 py-3 rounded-md shadow-xs">
              <p className="text-[11px] font-bold text-text-heading mb-1 flex items-center justify-center gap-1.5 tracking-wider uppercase">
                <AlertCircle className="w-3.5 h-3.5 text-accent" /> Course Generation In Progress
              </p>
              <p className="text-[10px] text-text-muted leading-relaxed font-medium">
                Course Generation In Progress (takes about 20-40 seconds). Please keep this tab open.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleStartQuiz} className="p-6 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-text-heading leading-tight">
                Knowledge Gap Quiz
              </h2>
              <p className="text-[13px] text-text-muted mt-0.5">
                Take a diagnostic quiz to find what you don't know.
              </p>
            </div>
          </div>
        </div>

        {pendingAssessment && !quizActive && (
          <div className="mb-6 p-4 rounded-md bg-callout-bg border border-callout-border space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-accent" />
                <h3 className="text-[13px] font-bold text-text-heading">
                  Unfinished Assessment Found
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-md">
                {pendingAssessment.quizQuestions?.length || 5} Questions
              </span>
            </div>
            <p className="text-[12px] text-text-muted leading-relaxed">
              You have a pending diagnostic assessment for <strong className="text-text-primary">{pendingAssessment.formData?.target_role || "your target role"}</strong> where no course was generated yet.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={resumePendingAssessment}
                className="px-4 py-2 rounded-md bg-accent text-white font-bold text-[12px] tracking-wide hover:bg-teal-700 transition-all flex items-center gap-2 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" /> Retake / Resume Assessment
              </button>
              <button
                type="button"
                onClick={discardPendingAssessment}
                className="px-3.5 py-2 rounded-md text-[12px] font-semibold text-text-muted hover:text-text-heading border border-border hover:bg-background transition-all"
              >
                Discard & Start New
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-[12px] text-red-600 font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">
              Target Role
            </label>
            <input
              type="text"
              name="target_role"
              value={formData.target_role}
              onChange={handleInputChange}
              placeholder="e.g. Senior Frontend Engineer"
              className="w-full bg-sidebar border border-border rounded-md px-4 py-3 text-[14px] text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">
              What you ALREADY know well
            </label>
            <textarea
              name="known_skills"
              value={formData.known_skills}
              onChange={handleInputChange}
              placeholder="I am comfortable with React basics, useState, useEffect, and CSS."
              rows={3}
              className="w-full bg-sidebar border border-border rounded-md px-4 py-3 text-[14px] text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">
              Timeline Setup
            </label>
            <div className="flex items-center gap-3 bg-sidebar border border-border rounded-md px-4 py-2">
              <span className="text-[13px] font-bold text-text-primary">I want to study for</span>
              <select
                name="time_value"
                value={formData.time_value}
                onChange={handleInputChange}
                className="bg-background border border-border text-text-heading text-[13px] font-bold rounded-md px-2 py-1 outline-none focus:border-accent"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
              <span className="text-[13px] font-bold text-text-primary">weeks.</span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          {!isLoggedIn ? (
            <button
              type="button"
              onClick={() => router.push(`/login?message=auth_required_to_generate&next=${window.location.pathname}`)}
              className="w-full bg-accent text-white rounded-md py-3.5 px-4 font-bold text-[14px] tracking-wide hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <LogIn className="w-4 h-4" /> Authenticate
            </button>
          ) : (
            <button
              type="submit"
              disabled={isGenerating}
              className={`w-full ${!((openRouterKey && useOpenRouter) || (localAIModelId && useLocalAI)) && credits !== null && credits < 1 ? 'bg-sidebar border-2 border-border text-text-muted hover:border-accent/40' : 'bg-accent text-white hover:bg-teal-700'} rounded-md py-3.5 px-4 font-bold text-[14px] tracking-wide transition-all flex items-center justify-center gap-2 shadow-md`}
            >
              {((openRouterKey && useOpenRouter) || (localAIModelId && useLocalAI)) ? (
                <>
                  <Mountain className="w-4 h-4" /> Start Diagnostic Quiz {useLocalAI ? '(Local)' : '(OpenRouter)'}
                </>
              ) : (
                <>
                  <span className={`text-[12px] ${credits !== null && credits < 1 ? 'grayscale opacity-50' : ''}`}>💎</span>
                  {credits !== null && credits < 1 ? 'Get More Credits' : 'Start Diagnostic Quiz (-1 Credit)'}
                </>
              )}
            </button>
          )}
        </div>
      </form>
      {isLoggedIn && <AiEngineSelector />}
    </div>
  );
};

export default KnowledgeGapQuiz;
