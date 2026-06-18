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
import EulerLogoCanvas from '../EulerLogoCanvas';

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
    "Tinkering with requirements...",
    "Shimmying through roles...",
    "Calibrating career path...",
    "Architecting bridge...",
    "Distilling job skills...",
    "Mapping the mountain...",
    "Refactoring sequence...",
    "Finalizing path...",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push(`/login?message=auth_required_to_generate&next=${window.location.pathname}`);
      return;
    }

    if (!formData.job_description || !formData.current_experience) return;

    if (!((openRouterKey && useOpenRouter) || (localAIModelId && useLocalAI)) && credits !== null && credits < 1) {
      setIsPaymentModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setError(null);

    const generation_strategy = `**Rules:**
1. **Engaging Title:** The "title" must be catchy, SEO-friendly, and natural (e.g., "The Complete Guide to Data Engineering"). Do NOT use dry, robotic formats like "Intensive 4-Week X Roadmap". Do NOT include the time duration in the title.
2. **Actionable Roadmap:** Translate the JD into a step-by-step technical learning path for this role over ${formData.time_value} weeks.\nAnalyze the user's current experience against the Job Description and identify precise technical gaps.\nThe roadmap must bridge these gaps with rigorous modules that lead to demonstrable mastery.`;

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
                  description: "Technical learning path",
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
                    description: "Technical learning path",
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
          time_unit: 'weeks',
        });



        onRoadmapGenerated(response, { ...formData, time_unit: 'weeks' });
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
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-3xl mx-auto w-full">
      <div className="bg-header border border-border rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm relative z-20">
        <div className="p-5 md:p-8 space-y-8">
          


          <div className="space-y-6">
            {/* JD Input */}
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

            {/* Experience Input */}
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

          {/* Duration */}
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
                      ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20' 
                      : 'bg-background text-text-muted border-border hover:border-accent hover:text-accent'
                    }`}
                >
                  {w} Weeks
                </button>
              ))}
              {!isPro && (
                <button 
                  type="button"
                  onClick={async () => {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) {
                      router.push(`/login?message=auth_required_to_generate&next=${window.location.pathname}`);
                      return;
                    }
                    setIsPaymentModalOpen(true);
                  }}
                  className="inconsolata-ui px-3 py-1.5 text-[9px] font-bold text-accent border border-accent/20 border-dashed hover:bg-accent/5"
                >
                  Unlock 6-12 Weeks (Pro)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action */}
        {!isGenerating && (
          <div className="pt-4 flex flex-col items-center gap-4 w-full">
              <div className="flex flex-col gap-2 max-w-sm w-full mb-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <Cpu className="w-4 h-4 text-accent" />
                  <span className="text-[12px] font-bold text-text-heading uppercase tracking-widest">Select AI Engine</span>
                </div>
                <div className="flex items-center justify-between p-1 bg-sidebar border border-border rounded-lg w-full">
                  <button
                    type="button"
                    onClick={() => { setUseOpenRouter(false); setUseLocalAI(false); }}
                    className={`flex-1 py-1.5 px-3 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${!useOpenRouter && !useLocalAI ? 'bg-background text-text-heading shadow-sm' : 'text-text-muted hover:text-text-heading'}`}
                  >
                    EulerFold AI
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUseOpenRouter(true); setUseLocalAI(false); }}
                    className={`flex-1 py-1.5 px-3 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${useOpenRouter ? 'bg-background text-text-heading shadow-sm' : 'text-text-muted hover:text-text-heading'}`}
                  >
                    OpenRouter
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUseOpenRouter(false); setUseLocalAI(true); }}
                    className={`flex-1 py-1.5 px-3 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${useLocalAI ? 'bg-background text-text-heading shadow-sm' : 'text-text-muted hover:text-text-heading'}`}
                  >
                    Local AI
                  </button>
                </div>
                {!useOpenRouter && !useLocalAI && (
                  <div className="p-4 border border-border rounded-xl bg-sidebar/50 transition-all duration-300 w-full mt-6 animate-in fade-in">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-10 h-10 bg-background border border-border rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                          <Sparkles className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <h3 className="text-[13px] font-bold text-text-heading leading-tight mb-0.5">
                            EulerFold AI (Default)
                          </h3>
                          <p className="text-[11px] text-text-muted leading-tight">
                            <span className="text-amber-500/90 font-bold">Costs 1 Credit per generation.</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {useLocalAI && !localAIModelId && (
                  <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center animate-in fade-in">
                    Please configure a Local Model below
                  </div>
                )}
                {useOpenRouter && !openRouterKey && (
                  <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center animate-in fade-in">
                    Please configure an API Key below
                  </div>
                )}
              </div>

            {useLocalAI ? (
              <div className={`p-4 border border-border rounded-xl bg-sidebar/50 transition-all duration-300 w-full`}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-10 h-10 bg-background border border-border rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                      <Cpu className="w-5 h-5 text-text-heading" />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-bold text-text-heading leading-tight mb-0.5">
                        {localAIModelId ? 'Local Hardware Connected' : 'Free Compute: Bring Your Own GPU'}
                      </h3>
                      <p className="text-[11px] text-text-muted leading-tight">
                        {localAIModelId 
                          ? <span>Ready to decode using <span className="font-bold text-accent">{localAIModelName}</span>.</span> 
                          : 'Run models natively in your browser using WebGPU. Unlimited generations, 100% private.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    {localAIModelId && (
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.removeItem('localAIModelId');
                          localStorage.removeItem('localAIModelName');
                          setLocalAIModelId(null);
                          setLocalAIModelName(null);
                        }}
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-background border border-border hover:border-red-500/50 hover:text-red-500 hover:bg-red-500/10 text-[11px] font-bold uppercase tracking-widest transition-all rounded-lg text-text-muted shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Unlink className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsLocalAIModalOpen(true)}
                      className="flex-1 sm:flex-none px-5 py-2.5 bg-background border border-border hover:border-accent hover:text-accent text-[11px] font-bold uppercase tracking-widest transition-all rounded-lg text-text-heading shadow-sm"
                    >
                      {localAIModelId ? 'Change Model' : 'Configure'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`p-4 border border-border rounded-xl bg-sidebar/50 transition-all duration-300 w-full ${(!useOpenRouter && openRouterKey) ? 'opacity-50 grayscale' : ''}`}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-10 h-10 bg-background border border-border rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-text-heading">
                        <path d="M16.778 1.844v1.919q-.569-.026-1.138-.032-.708-.008-1.415.037c-1.93.126-4.023.728-6.149 2.237-2.911 2.066-2.731 1.95-4.14 2.75-.396.223-1.342.574-2.185.798-.841.225-1.753.333-1.751.333v4.229s.768.108 1.61.333c.842.224 1.789.575 2.185.799 1.41.798 1.228.683 4.14 2.75 2.126 1.509 4.22 2.11 6.148 2.236.88.058 1.716.041 2.555.005v1.918l7.222-4.168-7.222-4.17v2.176c-.86.038-1.611.065-2.278.021-1.364-.09-2.417-.357-3.979-1.465-2.244-1.593-2.866-2.027-3.68-2.508.889-.518 1.449-.906 3.822-2.59 1.56-1.109 2.614-1.377 3.978-1.466.667-.044 1.418-.017 2.278.02v2.176L24 6.014Z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-[13px] font-bold text-text-heading leading-tight mb-0.5">
                        {openRouterKey ? 'OpenRouter Connected' : 'Power-User: Bring Your Own Key'}
                      </h3>
                      <p className="text-[11px] text-text-muted leading-tight">
                        {openRouterKey 
                          ? <span>Ready to decode using <span className="font-bold text-accent">{openRouterModel || 'openai/gpt-4o'}</span>.</span> 
                          : 'Use any AI model via OpenRouter. Unlimited generations, zero credits required.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    {openRouterKey && (
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.removeItem('openRouterKey');
                          setOpenRouterKey(null);
                          setOpenRouterModel(null);
                        }}
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-background border border-border hover:border-red-500/50 hover:text-red-500 hover:bg-red-500/10 text-[11px] font-bold uppercase tracking-widest transition-all rounded-lg text-text-muted shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Unlink className="w-3.5 h-3.5" /> Disconnect
                      </button>
                    )}
                    {!(profile || credits !== null) ? (
                      <button
                        type="button"
                        onClick={() => {
                          router.push(`/login?next=${window.location.pathname}`);
                        }}
                        className="flex-1 sm:flex-none px-5 py-2.5 bg-background border border-border hover:border-accent hover:text-accent text-[11px] font-bold uppercase tracking-widest transition-all rounded-lg text-text-heading shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <LogIn className="w-3.5 h-3.5" /> Sign in to Configure
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsOpenRouterModalOpen(true)}
                        className="flex-1 sm:flex-none px-5 py-2.5 bg-background border border-border hover:border-accent hover:text-accent text-[11px] font-bold uppercase tracking-widest transition-all rounded-lg text-text-heading shadow-sm"
                      >
                        Configure
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}


            <button
              onClick={handleSubmit}
              disabled={isGenerating || (useLocalAI && !localAIModelId)}
              className={`mt-4 group relative w-full sm:w-fit inline-flex items-center justify-center overflow-hidden px-7 py-3 rounded-2xl text-[14px] font-bold transition-all ${
                (!((openRouterKey && useOpenRouter) || (localAIModelId && useLocalAI)) && credits !== null && credits < 1)
                ? 'bg-sidebar border-2 border-border text-text-muted hover:border-accent/40' 
                : (useLocalAI && !localAIModelId)
                  ? 'bg-sidebar border-2 border-border text-text-muted cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-b from-teal-400 to-teal-600 text-white hover:brightness-110 active:border-b-0 active:translate-y-[4px] border-b-[4px] border-teal-800 shadow-lg'
              }`}
            >
              <div className="flex items-center justify-center gap-2.5">
                <Sparkles className="w-4 h-4" />
                {useLocalAI ? (
                  localAIModelId ? <span>Decode Path <span className="opacity-50">(Local)</span></span> : 'Select Local Model'
                ) : (openRouterKey && useOpenRouter) ? (
                  <span>Decode Path <span className="opacity-50">(OpenRouter)</span></span>
                ) : (
                  <span>
                    {credits !== null && credits < 1 ? 'Get More Credits' : 'Decode Path (-1 Credit)'}
                  </span>
                )}
              </div>
            </button>
            
            {!((openRouterKey && useOpenRouter) || (localAIModelId && useLocalAI)) && credits !== null && credits < 1 && (
              <div className="mt-2">
                <Link href="/pricing" className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline">
                  Buy more credits →
                </Link>
              </div>
            )}
          </div>
        )}
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
          {useLocalAI && (
            <div className="mt-8 max-w-sm text-center">
              <div className="bg-accent/5 border border-accent/20 px-4 py-3 rounded-xl animate-in fade-in slide-in-from-bottom-4 shadow-sm">
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
