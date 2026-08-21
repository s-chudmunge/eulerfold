"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, roadmapsAPI, RoadmapData } from '@/lib/api';
import { 
  Loader, 
  Sparkles, 
  SearchCode, 
  Cpu, 
  AlertCircle, 
  Mountain,
  Unlink,
  ShieldCheck,
  History,
  Hourglass,
  LogIn,
  PlayCircle,
  Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import PaymentModal from '../PaymentModal';
import { OpenRouterModal } from '../landing/OpenRouterModal';
import { LocalAIModal } from '../landing/LocalAIModal';
import { logAIUsage } from '@/lib/usageTracker';
import { CreateMLCEngine } from '@mlc-ai/web-llm';
import { jsonrepair } from 'jsonrepair';
import DiagnosticFlow, { DiagnosticResult } from '../diagnostic/DiagnosticFlow';

interface JobDecodedGeneratorProps {
  onRoadmapGenerated: (data: RoadmapData, formData: any) => void;
  onLoadingChange?: (loading: boolean) => void;
}

const JobDecodedGenerator: React.FC<JobDecodedGeneratorProps> = ({ 
  onRoadmapGenerated,
  onLoadingChange
}) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    job_description: '',
    current_experience: '',
    generation_type: 'full' as 'incremental' | 'full',
    time_value: 4,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [openRouterKey, setOpenRouterKey] = useState<string | null>(null);
  const [useOpenRouter, setUseOpenRouter] = useState<boolean>(true);
  const [openRouterModel, setOpenRouterModel] = useState<string | null>(null);
  const [usageHistory, setUsageHistory] = useState<any[]>([]);
  const [isOpenRouterModalOpen, setIsOpenRouterModalOpen] = useState(false);
  const [isLocalAIModalOpen, setIsLocalAIModalOpen] = useState(false);
  const [localAIModelId, setLocalAIModelId] = useState<string | null>(null);
  const [localAIModelName, setLocalAIModelName] = useState<string | null>(null);
  const [useLocalAI, setUseLocalAI] = useState<boolean>(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);

  const fetchProfileAndCredits = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('supabase_uid', session.user.id)
        .single();
      if (data) {
        setProfile(data);
        setCredits(data.roadmap_credits);
      }
    }
  };

  useEffect(() => {
    fetchProfileAndCredits();
    setOpenRouterKey(localStorage.getItem('openRouterKey'));
    setOpenRouterModel(localStorage.getItem('openRouterModel') || 'openai/gpt-4o');
    
    // Fetch unified AI usage from backend if session exists, else fallback
    const fetchUsage = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession) {
        try {
          const res = await api.get('/ai-usage?limit=3');
          const mappedHistory = res.data.map((log: any) => ({
            subject: log.subject,
            model: log.model_name,
            total_tokens: log.total_tokens,
            date: log.created_at
          }));
          setUsageHistory(mappedHistory);
        } catch (err) {
          console.error("Failed to load AI usage history", err);
        }
      } else {
        try {
          const history = JSON.parse(localStorage.getItem('openRouterUsageHistory') || '[]');
          setUsageHistory(history);
        } catch { }
      }
    };
    fetchUsage();

    setLocalAIModelId(localStorage.getItem('localAIModelId'));
    setLocalAIModelName(localStorage.getItem('localAIModelName'));
  }, []);

  const loadingMessages = [
    "Reading the JD so you don't have to... 👀",
    "Extracting the actual requirements... 🔍",
    "Calibrating career bridge... 🌉",
    "Mapping skill gaps... 🗺️",
    "Cooking your learning plan... 🍳",
    "Almost there, trust... 🫡",
    "Refactoring the sequence... ⚙️",
    "Locking in your path... 🔒",
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
      }, 2500);
    }
    onLoadingChange?.(isGenerating);
    return () => clearInterval(interval);
  }, [isGenerating, onLoadingChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Called when user clicks Generate — shows diagnostic first if not already done
  const handleGenerateClick = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.job_description || !formData.current_experience) return;

    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (!currentSession) {
      router.push(`/login?message=auth_required_to_generate&next=${window.location.pathname}`);
      return;
    }

    if (!((openRouterKey && useOpenRouter) || (localAIModelId && useLocalAI)) && credits !== null && credits < 1) {
      setIsPaymentModalOpen(true);
      return;
    }

    if (!diagnosticResult) {
      setShowDiagnostic(true);
      return;
    }

    await generateRoadmap();
  };

  const handleDiagnosticComplete = async (result: DiagnosticResult) => {
    setDiagnosticResult(result);
    setShowDiagnostic(false);
    await generateRoadmapWithDiagnostic(result);
  };

  const handleDiagnosticSkip = async () => {
    const skippedResult: DiagnosticResult = { session_id: '', knowledge_profile: {}, prompt_context: '', skipped: true };
    setDiagnosticResult(skippedResult);
    setShowDiagnostic(false);
    await generateRoadmapWithDiagnostic(skippedResult);
  };

  const generateRoadmapWithDiagnostic = async (diagResult: DiagnosticResult) => {
    await generateRoadmap(diagResult);
  };

  const generateRoadmap = async (diagResult?: DiagnosticResult, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.job_description || !formData.current_experience) return;
    
    const resolvedDiag = diagResult || diagnosticResult;

    setIsGenerating(true);
    setError(null);

    const diagContext = resolvedDiag?.prompt_context || '';

    const generation_strategy = `**Rules:**
1. **Engaging Title:** The "title" must be catchy, SEO-friendly, and natural (e.g., "The Complete Guide to Data Engineering"). Do NOT use dry, robotic formats like "Intensive 4-Week X Roadmap". Do NOT include the time duration in the title.
2. **Actionable Roadmap:** Translate the JD into a step-by-step technical course for this role over ${formData.time_value} weeks.\nAnalyze the user's current experience against the Job Description and identify precise technical gaps.\nThe roadmap must bridge these gaps with rigorous modules that lead to demonstrable mastery.${diagContext ? `\n\n**DIAGNOSTIC ASSESSMENT RESULTS:**\n${diagContext}` : ''}`;

    const systemPrompt = `You are a technical lead. Generate a rigorous technical learning roadmap. Output JSON ONLY matching the required schema.`;

    const userPrompt = `Your task is to convert a Job Description into a rigorous learning roadmap.

**JOB DESCRIPTION:**
${formData.job_description}

**USER'S CURRENT EXPERIENCE:**
${formData.current_experience}

**CONSTRAINTS:**
Duration: ${formData.time_value} weeks.
${generation_strategy}

**RULES:**
1. **Logical Progression:** Structure modules from foundational technical gaps to advanced implementation.
2. **Technical Rigor:** Prioritize hard skills, tools, and theoretical knowledge required for the role.
3. **Specific Topics:** Each module must have 3-5 specific topics. Avoid generic titles like "Introduction to X". Use industry-standard technical terms (e.g., "Memory-Mapped I/O" or "Asynchronous Event Loops").
4. **Practical Outcomes:** The \`proof_of_work_instructions\` must describe a realistic technical task or project that demonstrates competency in that module's specific skills.
5. **Applied Knowledge:** Ensure the user learns not just what a tool is, but how to apply it to solve role-specific problems.
6. **Conciseness:** Roadmap description must be max 2 sentences. Each module 'outcome' must be max 1 sentence.
7. **Output JSON ONLY** matching this schema:
   {
     "title": "string", 
     "description": "Concise analysis of the chosen learning strategy (max 2 sentences).",
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
         "resources": [
            { "title": "string", "url": "string", "type": "docs|article" }
         ]
       }
     ]
   }`;

    const localSystemPrompt = `You are a strict JSON data generator. You must reply ONLY with valid JSON. Do not include markdown, explanations, or any conversational text.`;

    const localUserPrompt = `
Convert the Job Description into a technical learning roadmap for a user.

**JOB DESCRIPTION:**
${formData.job_description}

**USER'S CURRENT EXPERIENCE:**
${formData.current_experience}

**CONSTRAINTS:**
Duration: ${formData.time_value} weeks.

Generate a catchy, SEO-friendly, and natural title (e.g., "The Complete Guide to Data Engineering"). Do NOT use dry, robotic formats like "Intensive 4-Week X Roadmap" and do NOT include the duration in the title.

CRITICAL REQUIREMENT: You MUST generate EXACTLY ${formData.time_value} modules in the "modules" array (one module for each unit of time). Do not just output one module.

Reply ONLY with a raw JSON object matching EXACTLY this structure:
{
  "title": "Roadmap Title",
  "description": "Short description of the strategy",
  "modules": [
    {
      "title": "Module Title",
      "outcome": "Module outcome sentence",
      "timeline": "Week 1",
      "workspace_type": "code",
      "proof_of_work_instructions": {
        "what_to_build": "Task description",
        "what_counts_as_evidence": "Evidence",
        "eval_criteria": ["Criteria 1", "Criteria 2"]
      },
      "topics": [
        { "title": "Topic", "subtopics": [ { "title": "Subtopic" } ] }
      ],
      "optimal_search_query": "Specific search query for DuckDuckGo"
    }
  ]
}

DO NOT wrap the JSON in markdown \`\`\` codeblocks. Output ONLY the JSON object starting with { and ending with }.
`;

    try {
      if (openRouterKey && useOpenRouter) {
        const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

        const requestBody = {
          model: openRouterModel || 'openai/gpt-4o',
          messages: [{ role: "user", content: fullPrompt }],
          response_format: { type: "json_object" },
          max_tokens: 8192
        };

        let roadmapPlan = null;
        let orData = null;

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

        orData = await orResponse.json();

        if (!orResponse.ok) {
           if (orResponse.status === 429) {
               throw new Error("OpenRouter Rate Limit Reached: Please wait a moment or try selecting a different model.");
           }
           throw new Error(orData.error?.message || "OpenRouter generation failed.");
        }

        if (orData.error) {
            throw new Error(orData.error.message || "OpenRouter internal model error.");
        }

        if (!orData.choices || orData.choices.length === 0) {
            throw new Error("The AI model failed to return a valid response (possibly due to a content filter). Please try again or select a different model.");
        }

        let generatedText = orData.choices[0].message?.content || "";
        
        let cleanedText = generatedText.trim();
        cleanedText = cleanedText.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

        const jsonBlockMatch = cleanedText.match(/```(?:json)?\s*([\s\S]*?)```/i);
        if (jsonBlockMatch && jsonBlockMatch[1]) {
           cleanedText = jsonBlockMatch[1].trim();
        } else {
           const firstBrace = cleanedText.indexOf('{');
           const lastBrace = cleanedText.lastIndexOf('}');
           if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
               cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
           }
        }
        
        cleanedText = cleanedText.trim();
        cleanedText = cleanedText.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (match: string) => {
            return match.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
        });
        cleanedText = cleanedText.replace(/[\u0000-\u0009\u000B-\u001F]/g, "");

        if (!cleanedText) {
          throw new Error("The AI model returned an empty response. It may have hit a safety filter. Please try a different model or adjust your prompt.");
        }

        try {
            roadmapPlan = JSON.parse(jsonrepair(cleanedText));
            if (Array.isArray(roadmapPlan)) {
               roadmapPlan = {
                  title: "Generated Roadmap",
                  description: "Technical course",
                  modules: roadmapPlan
               };
            }
        } catch (e: any) {
            console.error("JSON parse failed. Cleaned text:", cleanedText);
            throw new Error("The AI model returned an incomplete or corrupt response. Please try generating again, or select a different model from the settings.");
        }

        const backendPayload = {
          subject: roadmapPlan.title || 'Job Decoded Roadmap',
          goal: formData.job_description.substring(0, 200),
          time_value: formData.time_value,
          time_unit: 'weeks',
          roadmap_plan: roadmapPlan,
          model: openRouterModel || 'openai/gpt-4o',
          is_job_decoded: true
        };

        const saveResponse = await api.post("/roadmaps/save-external", backendPayload);
        
        try {
          await logAIUsage({
            id: saveResponse?.data?.slug,
            subject: roadmapPlan.title || 'Job Decoded Roadmap',
            model: orData.model || openRouterModel,
            prompt_tokens: orData.usage?.prompt_tokens || 0,
            completion_tokens: orData.usage?.completion_tokens || 0,
            total_tokens: orData.usage?.total_tokens || 0
          });
        } catch (e) {
          console.error("Failed to log AI usage:", e);
        }

        onRoadmapGenerated(saveResponse.data, { ...formData, time_unit: 'weeks' });

      } else if (localAIModelId && useLocalAI) {
        let engine;
        try {
          const initProgressCallback = (report: { text: string }) => {
             console.log("Local AI Init:", report.text);
          };
          engine = await CreateMLCEngine(localAIModelId, { initProgressCallback });
          
          let generatedText = '';
          let parseSuccess = false;
          let responseUsage = null;

          for (let attempt = 1; attempt <= 2; attempt++) {
            try {
              const response = await engine.chat.completions.create({
                messages: [
                  { role: "system", content: localSystemPrompt },
                  { role: "user", content: localUserPrompt }
                ],
                max_tokens: 8192,
              });
              
              generatedText = response.choices[0].message.content || '';
              responseUsage = response.usage || null;
              let cleanedText = generatedText.trim();
              if (cleanedText.startsWith("```json")) {
                cleanedText = cleanedText.replace(/^```json\n?/, "").replace(/```$/, "");
              } else if (cleanedText.startsWith("```")) {
                cleanedText = cleanedText.replace(/^```\n?/, "").replace(/```$/, "");
              }
              cleanedText = cleanedText.trim();
              cleanedText = cleanedText.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (match: string) => {
                  return match.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
              });
              cleanedText = cleanedText.replace(/[\u0000-\u0009\u000B-\u001F]/g, "");

              parsedJSON = JSON.parse(jsonrepair(cleanedText));
              if (Array.isArray(parsedJSON)) {
                 parsedJSON = {
                    title: "Generated Roadmap",
                    description: "Technical course",
                    modules: parsedJSON
                 };
              }
              parseSuccess = true;
              break;
            } catch (err: any) {
              const errMsg = err?.message || err?.toString() || '';
              if (errMsg.includes('Instance reference') || errMsg.includes('disposed') || errMsg.includes('Device was lost') || errMsg.includes('OperationError')) {
                throw new Error("Hardware Crash: Your GPU ran out of memory. Please select a smaller model (like Llama 3.2 1B) or use EulerFold AI.");
              }
              if (attempt === 2) throw new Error("Local AI failed to generate valid JSON after 2 attempts. Try a different model or use EulerFold AI.");
            }
          }

          if (!parseSuccess || !parsedJSON) {
            throw new Error("Local AI failed to generate valid JSON.");
          }

          const backendPayload = {
            subject: parsedJSON.title || 'Job Decoded Roadmap',
            goal: formData.job_description.substring(0, 200),
            time_value: formData.time_value,
            time_unit: 'weeks',
            roadmap_plan: parsedJSON,
            model: localAIModelId,
            is_job_decoded: true
          };

          const saveResponse = await api.post("/roadmaps/save-external", backendPayload);
          
          try {
            await logAIUsage({
              id: saveResponse.data?.slug,
              subject: roadmapPlan.title || 'Job Decoded Roadmap',
              model: localAIModelId,
              prompt_tokens: responseUsage?.prompt_tokens || 0,
              completion_tokens: responseUsage?.completion_tokens || 0,
              total_tokens: responseUsage?.total_tokens || 0
            });
          } catch (e) {
            console.error("Failed to log AI usage:", e);
          }

          onRoadmapGenerated(saveResponse.data, { ...formData, time_unit: 'weeks' });
        } finally {
          if (engine) await engine.unload();
        }
      } else {
        const response = await roadmapsAPI.generateFromJD({
          ...formData,
            model: profile?.is_pro ? 'models/gemini-2.5-pro' : 'models/gemini-2.5-flash',
            diagnostic_prompt_context: resolvedDiag?.prompt_context || undefined,
          });

        try {
          await logAIUsage({
            id: response?.data?.slug,
            subject: 'Job Decoded Roadmap',
            model: profile?.is_pro ? 'models/gemini-2.5-pro' : 'models/gemini-2.5-flash',
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
            source: 'eulerfold-ai'
          });
          
          if (!profile?.is_pro) {
            const { data: currentProfile } = await supabase.from('profiles').select('roadmap_credits').eq('supabase_uid', (await supabase.auth.getSession()).data.session?.user?.id).single();
            if (currentProfile) {
               setCredits(currentProfile.roadmap_credits);
            }
          }
        } catch (e) {
          console.error("Failed to log AI usage:", e);
        }

        onRoadmapGenerated(response.data, { ...formData, time_unit: 'weeks' });
      }
    } catch (err: any) {
      if (err.response?.status === 402) {
        setIsPaymentModalOpen(true);
      } else {
        setError(err.response?.data?.detail || err.message || "Generation failed.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const isPro = profile?.is_pro || false;
  const allowedWeeks = isPro ? [2, 3, 4, 6, 10, 12] : [2, 3, 4];

  return (
    <div className="w-full manrope-body">
      {showDiagnostic && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
          <DiagnosticFlow
            topic="Target Job Requirements"
            onComplete={handleDiagnosticComplete}
            onSkip={handleDiagnosticSkip}
          />
        </div>
      )}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-3xl mx-auto w-full">
          <div className="bg-header border border-border rounded-lg shadow-2xl overflow-hidden backdrop-blur-sm relative z-20">
            <div className="p-5 md:p-8 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2.5">
                  <label className="inconsolata-ui flex items-center text-[11px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">
                    <SearchCode className="w-3.5 h-3.5 mr-1.5 text-accent" /> Job Description
                  </label>
                  <div className="relative">
                    <textarea
                      name="job_description"
                      value={formData.job_description}
                      onChange={handleInputChange}
                      rows={6}
                      placeholder="Paste the requirements, role description, or the full JD here..."
                      className="w-full bg-background border border-border px-4 py-4 text-[14px] font-medium text-text-primary focus:outline-none focus:border-accent transition-all rounded-lg shadow-inner resize-none placeholder:text-text-muted/40"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="inconsolata-ui flex items-center text-[11px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">
                    <Cpu className="w-3.5 h-3.5 mr-1.5 text-teal-600" /> Your Current Level & Context
                  </label>
                  <div className="relative">
                    <textarea
                      name="current_experience"
                      value={formData.current_experience}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="What do you already know? (e.g. 'I'm a junior frontend dev with 1 year of React...')"
                      className="w-full bg-background border border-border px-4 py-4 text-[14px] font-medium text-text-primary focus:outline-none focus:border-accent transition-all rounded-lg shadow-inner resize-none placeholder:text-text-muted/40 h-28"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="inconsolata-ui text-[10px] font-bold uppercase tracking-widest text-text-muted ml-0.5">
                    Target Duration
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allowedWeeks.map(w => (
                      <button
                        type="button"
                        key={w}
                        onClick={() => setFormData(prev => ({ ...prev, time_value: w }))}
                        className={`inconsolata-ui px-4 py-1.5 border text-[10px] font-bold uppercase tracking-widest transition-all
                          ${formData.time_value === w 
                            ? 'bg-accent text-white border-accent  shadow-accent/20' 
                            : 'bg-background text-text-muted border-border hover:border-accent hover:text-accent'
                          }`}
                      >
                        {w} Weeks
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {!isGenerating && (
                <div className="pt-4 flex flex-col items-center gap-4 w-full">
                  {!(profile || credits !== null) ? (
                    <button
                      type="button"
                      onClick={() => {
                        router.push(`/login?message=auth_required_to_generate&next=${window.location.pathname}`);
                      }}
                      className="mt-4 group relative w-full sm:w-fit inline-flex items-center justify-center overflow-hidden px-7 py-3 rounded-lg text-[14px] font-bold transition-all bg-accent text-white hover:bg-teal-700 shadow-sm gap-2"
                    >
                      <LogIn className="w-4 h-4" /> Authenticate
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleGenerateClick}
                      disabled={isGenerating || !formData.job_description.trim() || !formData.current_experience.trim()}
                      className={`mt-4 group relative w-full sm:w-fit inline-flex items-center justify-center overflow-hidden px-7 py-3 rounded-lg text-[14px] font-bold transition-all ${
                        (!((openRouterKey && useOpenRouter) || (localAIModelId && useLocalAI)) && credits !== null && credits < 1)
                        ? 'bg-sidebar border-2 border-border text-text-muted hover:border-accent/40' 
                        : (useLocalAI && !localAIModelId)
                          ? 'bg-sidebar border-2 border-border text-text-muted cursor-not-allowed opacity-50'
                          : 'bg-accent text-white hover:bg-teal-700 shadow-sm'
                      }`}
                    >
                      <span>Decode Path</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

      {isGenerating && (
        <div className="py-20 flex flex-col items-center justify-center text-center transition-opacity duration-500 opacity-100 relative z-30">
          <p className="inconsolata-ui text-[11px] font-bold text-accent uppercase tracking-widest">
            {loadingMessages[currentMessageIndex]}
          </p>
          <div className="flex justify-center gap-1.5 mt-4">
             {[0, 1, 2].map(i => (
               <div key={i} className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}></div>
             ))}
          </div>
          
          {!useLocalAI && (
            <div className="mt-8 max-w-sm text-center">
              <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-border/50 px-4 py-3 rounded-lg animate-in fade-in slide-in-from-bottom-4 shadow-sm">
                <p className="text-[11px] font-bold text-text-heading mb-1 flex items-center justify-center gap-1.5 uppercase tracking-widest">
                  <AlertCircle className="w-3.5 h-3.5 text-accent" /> Generation Takes Time
                </p>
                <p className="text-[10px] text-text-muted leading-relaxed font-medium">
                  Our AI requires about 20-40 seconds to architect a complete learning roadmap. Please be patient 🫠
                </p>
              </div>
            </div>
          )}

          {useLocalAI && (
            <div className="mt-8 max-w-sm text-center">
              <div className="bg-accent/5 border border-accent/20 px-4 py-3 rounded-lg animate-in fade-in slide-in-from-bottom-4 shadow-sm">
                <p className="text-[11px] font-bold text-text-heading mb-1 flex items-center justify-center gap-1.5 uppercase tracking-widest">
                  <Cpu className="w-3.5 h-3.5 text-accent" /> Hardware Inference Active
                </p>
                <p className="text-[10px] text-text-muted leading-relaxed font-medium">
                  This might take a while depending on your device's GPU and memory. Local AI runs entirely inside your browser, natively utilizing your hardware to ensure absolute privacy with zero server interaction.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
        
      {error && !isGenerating && (
        <div className="mt-8 p-3 bg-red-500/5 border-l-2 border-red-500 flex items-center gap-3 text-red-500 animate-in slide-in-from-left-1 duration-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="inconsolata-ui text-[10px] font-bold uppercase tracking-tight">{error}</p>
        </div>
      )}

      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        onSuccess={() => {
          setIsPaymentModalOpen(false);
          fetchProfileAndCredits();
        }} 
      />

      <OpenRouterModal 
        isOpen={isOpenRouterModalOpen} 
        onClose={() => {
          setIsOpenRouterModalOpen(false);
          setOpenRouterKey(localStorage.getItem('openRouterKey'));
          setOpenRouterModel(localStorage.getItem('openRouterModel') || 'openai/gpt-4o');
        }} 
        formData={formData}
        onSuccess={(roadmap) => onRoadmapGenerated(roadmap, { ...formData, time_unit: 'weeks' })}
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
    </div>
  );
};

export default JobDecodedGenerator;
