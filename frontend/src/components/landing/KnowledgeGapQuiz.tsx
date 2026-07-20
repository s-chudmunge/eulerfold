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
  LogIn
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
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);

  const [openRouterKey, setOpenRouterKey] = useState<string | null>(null);
  const [useOpenRouter, setUseOpenRouter] = useState(false);
  const [openRouterModel, setOpenRouterModel] = useState<string | null>(null);
  const [localAIModelId, setLocalAIModelId] = useState<string | null>(null);
  const [useLocalAI, setUseLocalAI] = useState(false);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
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

    try {
      let quizData = [];
      if (openRouterKey && useOpenRouter) {
        const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
        const requestBody = {
          model: openRouterModel || 'openai/gpt-4o',
          messages: [{ role: "user", content: fullPrompt }],
          response_format: { type: "json_object" },
          max_tokens: 4096
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
        let generatedText = orData.choices[0].message?.content || "";
        let cleanedText = generatedText.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
        const jsonBlockMatch = cleanedText.match(/```(?:json)?\s*([\s\S]*?)```/i);
        if (jsonBlockMatch && jsonBlockMatch[1]) cleanedText = jsonBlockMatch[1].trim();
        const parsed = JSON.parse(jsonrepair(cleanedText));
        quizData = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.data || parsed.quiz || []);
        
        try {
          await logAIUsage({
            id: 'quiz',
            subject: `Diagnostic Quiz: ${formData.target_role}`,
            model: orData.model || openRouterModel,
            prompt_tokens: orData.usage?.prompt_tokens || 0,
            completion_tokens: orData.usage?.completion_tokens || 0,
            total_tokens: orData.usage?.total_tokens || 0
          });
        } catch (e) {
          console.error("Failed to log AI usage:", e);
        }

      } else if (localAIModelId && useLocalAI) {
        let engine;
        try {
          engine = await CreateMLCEngine(localAIModelId, { initProgressCallback: (r) => console.log(r.text) });
          const response = await engine.chat.completions.create({
            messages: [
              { role: "system", content: "You are a strict JSON data generator. Reply ONLY with valid JSON." },
              { role: "user", content: userPrompt + "\nCRITICAL: Output ONLY a raw JSON array of objects." }
            ],
            max_tokens: 4096,
          });
          let generatedText = response.choices[0].message.content || '';
          let responseUsage = response.usage || null;
          let cleanedText = generatedText.trim();
          if (cleanedText.startsWith("```json")) cleanedText = cleanedText.replace(/^```json\n?/, "").replace(/```$/, "");
          else if (cleanedText.startsWith("```")) cleanedText = cleanedText.replace(/^```\n?/, "").replace(/```$/, "");
          const parsed = JSON.parse(jsonrepair(cleanedText));
          quizData = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.data || parsed.quiz || []);
          
          try {
            await logAIUsage({
              id: 'quiz',
              subject: `Diagnostic Quiz: ${formData.target_role}`,
              model: localAIModelId,
              prompt_tokens: responseUsage?.prompt_tokens || 0,
              completion_tokens: responseUsage?.completion_tokens || 0,
              total_tokens: responseUsage?.total_tokens || 0
            });
          } catch (e) {
            console.error("Failed to log AI usage:", e);
          }
        } finally {
          if (engine) await engine.unload();
        }
      } else {
        quizData = await roadmapsAPI.generateDiagnosticQuiz({
          target_role: formData.target_role,
          known_skills: formData.known_skills,
          question_count: 5
        });
      }
      setQuizQuestions(quizData);
      setQuizAnswers(new Array(quizData.length).fill(null));
      setQuizActive(true);
      setCurrentQuizIdx(0);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to generate diagnostic quiz.');
    } finally {
      setIsGenerating(false);
    }
  };

  const submitQuizAndGenerateGapRoadmap = async () => {
    setIsGenerating(true);
    setQuizActive(false);
    setError(null);

    try {
      const failedQuestions = quizQuestions.filter((q, i) => quizAnswers[i] !== q.correct_answer_index);
      
      let weak_skills = "User passed all diagnostic questions.";
      if (failedQuestions.length > 0) {
        weak_skills = "Failed to understand: " + failedQuestions.map(q => q.question).join(" | ");
      }

      const systemPrompt = `You are a technical mentor. Generate a rigorous technical learning roadmap. Output JSON ONLY matching the required schema.`;
      const userPrompt = `The user wants to become a "${formData.target_role}".
They are already proficient in: "${formData.known_skills}"
However, they struggle with or failed diagnostics on: "${weak_skills}"

Generate a ${formData.time_value} week learning roadmap that COMPLETELY SKIPS the known skills.
Strictly focus the entire roadmap on bridging the gap in their weak areas.

**RULES:**
1. **Logical Progression:** Structure modules to bridge the gap.
2. **Specific Topics:** Each module must have 3-5 specific topics using industry-standard technical terms.
3. **Practical Outcomes:** The proof_of_work_instructions must describe a realistic technical task that demonstrates competency.
4. **Conciseness:** Roadmap description must be max 2 sentences. Each module 'outcome' must be max 1 sentence.
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
            subject: roadmapPlan.title || 'Skill Gap Course',
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

  if (quizActive) {
    const q = quizQuestions[currentQuizIdx];
    return (
      <div className="bg-background rounded-lg border border-border/50 overflow-hidden shadow-sm p-6 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="inconsolata-ui text-[14px] font-bold text-text-heading tracking-widest uppercase">
            Diagnostic Quiz: {formData.target_role}
          </h2>
          <span className="text-[12px] font-bold text-accent">
            {currentQuizIdx + 1} / {quizQuestions.length}
          </span>
        </div>

        <div className="mb-6">
          <p className="text-[15px] font-medium text-text-primary mb-4 leading-relaxed">
            {q.question}
          </p>
          <div className="grid gap-2">
            {q.options.map((opt: string, idx: number) => (
              <button
                key={idx}
                onClick={() => {
                  const newAnswers = [...quizAnswers];
                  newAnswers[currentQuizIdx] = idx;
                  setQuizAnswers(newAnswers);
                }}
                className={`w-full text-left p-3 rounded-lg border transition-all text-[13px] ${
                  quizAnswers[currentQuizIdx] === idx
                    ? 'border-accent bg-accent/10 text-text-heading font-bold'
                    : 'border-border bg-sidebar hover:border-accent/50 text-text-primary'
                }`}
              >
                {String.fromCharCode(65 + idx)}. {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 pt-4 border-t border-border">
          <button
            onClick={() => setCurrentQuizIdx(p => Math.max(0, p - 1))}
            disabled={currentQuizIdx === 0}
            className="flex items-center gap-2 px-4 py-2 text-[12px] font-bold text-text-muted hover:text-text-primary disabled:opacity-50"
          >
            <ArrowLeft className="w-3 h-3" /> Previous
          </button>

          {currentQuizIdx === quizQuestions.length - 1 ? (
            <button
              onClick={submitQuizAndGenerateGapRoadmap}
              disabled={quizAnswers.includes(null)}
              className="flex items-center gap-2 bg-text-heading text-background px-6 py-2 rounded-lg text-[12px] font-bold tracking-wider hover:opacity-90 disabled:opacity-50"
            >
              Analyze Gaps & Generate
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuizIdx(p => p + 1)}
              disabled={quizAnswers[currentQuizIdx] === null}
              className="flex items-center gap-2 bg-accent text-white px-6 py-2 rounded-lg text-[12px] font-bold tracking-wider hover:bg-teal-500 disabled:opacity-50"
            >
              Next <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg border border-border/50 overflow-hidden shadow-sm max-w-2xl mx-auto w-full relative">
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} onSuccess={() => setIsPaymentModalOpen(false)} />
      
      {isLoggedIn && isPro === false && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/80 backdrop-blur-[3px] rounded-lg border border-border/50 text-center p-6">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-inter text-[16px] font-semibold text-text-heading mb-2">Pro Exclusive Feature</h3>
            <p className="manrope-body font-medium text-[13px] text-text-muted max-w-md mb-6 leading-relaxed px-4">
                <strong className="text-text-primary">Unlock the Diagnostic Audit.</strong> Take a quick quiz to find your weak spots, then get a custom course built specifically to fix them.
            </p>
            <Link 
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#111] dark:bg-accent text-white rounded-lg font-bold text-[12px] uppercase tracking-[0.2em] shadow-xl hover:opacity-90 transition-opacity"
            >
                Upgrade to Pro
            </Link>
        </div>
      )}
      
      {isGenerating && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-lg border border-accent/20">
          <p className="inconsolata-ui text-[14px] font-bold text-accent tracking-[0.2em] uppercase mb-4">
            Analyzing Skill Gaps...
          </p>
          <div className="flex justify-center gap-1.5 mb-6">
             {[0, 1, 2].map(i => (
               <div key={i} className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}></div>
             ))}
          </div>
          
          <div className="max-w-sm w-full text-center px-4">
            <div className="bg-callout-bg border border-border px-4 py-3 rounded-lg animate-in fade-in slide-in-from-bottom-4 shadow-sm">
              <p className="text-[11px] font-bold text-text-heading mb-1 flex items-center justify-center gap-1.5 uppercase tracking-widest">
                <AlertCircle className="w-3.5 h-3.5 text-accent" /> Generation Takes Time
              </p>
              <p className="text-[10px] text-text-muted leading-relaxed font-medium">
                Our AI requires about 20-40 seconds to architect a complete course. Please be patient after clicking generate.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleStartQuiz} className="p-6 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
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

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
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
              className="w-full bg-sidebar border border-border rounded-lg px-4 py-3 text-[14px] text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
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
              className="w-full bg-sidebar border border-border rounded-lg px-4 py-3 text-[14px] text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">
              Timeline Setup
            </label>
            <div className="flex items-center gap-3 bg-sidebar border border-border rounded-lg px-4 py-2">
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
              className="w-full bg-accent text-white rounded-lg py-3.5 px-4 font-bold text-[14px] tracking-wide hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <LogIn className="w-4 h-4" /> Authenticate
            </button>
          ) : (
            <button
              type="submit"
              disabled={isGenerating}
              className={`w-full ${!((openRouterKey && useOpenRouter) || (localAIModelId && useLocalAI)) && credits !== null && credits < 1 ? 'bg-sidebar border-2 border-border text-text-muted hover:border-accent/40' : 'bg-text-heading text-background'} rounded-lg py-3.5 px-4 font-bold text-[14px] tracking-wide hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg`}
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
