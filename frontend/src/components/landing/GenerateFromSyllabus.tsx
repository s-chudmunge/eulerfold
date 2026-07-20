"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { roadmapsAPI, RoadmapData } from '@/lib/api';
import { 
  Loader, 
  AlertCircle, 
  Mountain,
  BookOpen,
  Sparkles,
  Upload,
  FileText,
  LogIn,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import PaymentModal from '../PaymentModal';
import AiEngineSelector from '@/components/settings/AiEngineSelector';
import { CreateMLCEngine } from '@mlc-ai/web-llm';
import { jsonrepair } from 'jsonrepair';
import { api } from '@/lib/api';
import { logAIUsage } from '@/lib/usageTracker';

interface GenerateFromSyllabusProps {
  onRoadmapGenerated: (data: RoadmapData, formData: any) => void;
  onLoadingChange?: (loading: boolean) => void;
}

const GenerateFromSyllabus: React.FC<GenerateFromSyllabusProps> = ({ 
  onRoadmapGenerated,
  onLoadingChange
}) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    syllabus_text: '',
    time_value: 4,
    strict_official_sources: false,
  });
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

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

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedText = localStorage.getItem('syllabus_text');
    const savedTime = localStorage.getItem('syllabus_time');
    if (savedText || savedTime) {
      setFormData(prev => ({
        syllabus_text: savedText ?? prev.syllabus_text,
        time_value: savedTime ? parseInt(savedTime, 10) : prev.time_value
      }));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('syllabus_text', formData.syllabus_text);
      localStorage.setItem('syllabus_time', formData.time_value.toString());
    }
  }, [formData.syllabus_text, formData.time_value, isLoaded]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.syllabus_text.trim()) {
      setError('Please provide syllabus text or upload a PDF.');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push(`/login?message=auth_required_to_generate&next=${window.location.pathname}`);
      return;
    }

    if (!((openRouterKey && useOpenRouter) || (localAIModelId && useLocalAI)) && credits !== null && credits < 1) {
      setIsPaymentModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setError(null);

    const systemPrompt = `You are an instructional designer. Generate a rigorous technical learning roadmap. Output JSON ONLY matching the required schema.`;
    const userPrompt = `Your task is to convert a static course syllabus into a rigorous learning roadmap.

**SYLLABUS:**
${formData.syllabus_text}

**CONSTRAINTS:**
Duration: ${formData.time_value} weeks.

**RULES:**
1. **Logical Progression:** Structure modules from foundational technical gaps to advanced implementation.
2. **Technical Rigor:** Prioritize hard skills, tools, and theoretical knowledge required for the role.
3. **Specific Topics:** Each module must have 3-5 specific topics.
4. **Practical Outcomes:** The proof_of_work_instructions must describe a realistic technical task or project that demonstrates competency in that module's specific skills.
5. **Applied Knowledge:** Ensure the user learns not just what a tool is, but how to apply it.
6. **Conciseness:** Roadmap description must be max 2 sentences. Each module 'outcome' must be max 1 sentence.
7. **Output JSON ONLY** matching this schema:
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

    try {
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
        
        const roadmapPlan = JSON.parse(jsonrepair(cleanedText));

        const backendPayload = {
          subject: roadmapPlan.title || 'Syllabus Course',
          goal: formData.syllabus_text.substring(0, 200),
          time_value: formData.time_value,
          time_unit: 'weeks',
          roadmap_plan: roadmapPlan,
          model: openRouterModel || 'openai/gpt-4o',
          is_syllabus: true
        };

        const saveResponse = await api.post("/roadmaps/save-external", backendPayload);
        
        try {
          await logAIUsage({
            id: saveResponse?.data?.slug,
            subject: roadmapPlan.title || 'Syllabus Course',
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
            subject: parsedJSON.title || 'Syllabus Roadmap',
            goal: formData.syllabus_text.substring(0, 200),
            time_value: formData.time_value,
            time_unit: 'weeks',
            roadmap_plan: parsedJSON,
            model: localAIModelId,
            is_syllabus: true
          };

          const saveResponse = await api.post("/roadmaps/save-external", backendPayload);
          
          try {
            await logAIUsage({
              id: saveResponse?.data?.slug,
              subject: parsedJSON.title || 'Syllabus Course',
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
        const res = await roadmapsAPI.generateFromSyllabus({
          syllabus_text: formData.syllabus_text,
          time_value: formData.time_value,
          time_unit: 'weeks',
          strict_official_sources: formData.strict_official_sources
        });
        
        try {
          await logAIUsage({
            id: (res as any)?.slug,
            subject: 'Syllabus Course',
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
        setError('Please upload a valid PDF file.');
        return;
    }

    setIsParsingPdf(true);
    setError(null);
    try {
        const res = await roadmapsAPI.parsePdf(file);
        let parsedText = res.text || '';
        
        const CHAR_LIMIT = 50000;
        if (parsedText.length > CHAR_LIMIT) {
            parsedText = parsedText.substring(0, CHAR_LIMIT) + '\n\n[TRUNCATED: Syllabus exceeded character limit]';
            setError('The attached PDF was very large and has been truncated to the 50,000 character limit.');
        }

        setFormData(prev => ({ ...prev, syllabus_text: parsedText }));
    } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to parse PDF file.');
    } finally {
        setIsParsingPdf(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  };

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
                <strong className="text-text-primary">Unlock Syllabus Translation.</strong> Turn any syllabus or textbook index into a study plan, complete with automatically found videos and learning resources for every chapter.
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
            Syllabus Translator...
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

      <form onSubmit={handleSubmit} className="p-6 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-text-heading leading-tight">
                Generate from Syllabus
              </h2>
              <p className="text-[13px] text-text-muted mt-0.5">
                Paste a course syllabus or textbook table of contents.
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
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest">
                  Syllabus Content
                </label>
                <div className="relative flex items-center gap-2">
                    {formData.syllabus_text && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, syllabus_text: '' }));
                          localStorage.removeItem('syllabus_text');
                        }}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-text-muted hover:text-text-primary bg-sidebar hover:bg-border px-3 py-1.5 rounded-md transition-colors border border-border"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear</span>
                      </button>
                    )}
                    <input 
                        type="file" 
                        accept=".pdf" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isParsingPdf}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-accent bg-accent/10 hover:bg-accent/20 px-3 py-1.5 rounded-md transition-colors"
                    >
                        {isParsingPdf ? (
                            <Loader className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>Upload PDF</span>
                    </button>
                </div>
            </div>
            
            <textarea
              name="syllabus_text"
              value={formData.syllabus_text}
              onChange={handleInputChange}
              placeholder="Week 1: Intro to Graph Theory&#10;Week 2: DFS and BFS..."
              rows={6}
              className="w-full bg-sidebar border border-border rounded-lg px-4 py-3 text-[14px] text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none"
              maxLength={50000}
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

          {isLoggedIn && (
          <div>
            <label className="flex items-center gap-2 cursor-pointer mt-2 bg-sidebar border border-border rounded-lg px-4 py-3 hover:border-accent/50 transition-colors">
              <input
                type="checkbox"
                name="strict_official_sources"
                checked={formData.strict_official_sources}
                onChange={handleCheckboxChange}
                className="w-4 h-4 text-accent bg-background border-border rounded focus:ring-accent focus:ring-1"
              />
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-text-primary">Only Use Official Video Sources</span>
                <span className="text-[11px] text-text-muted">Strictly source lectures from MIT, Stanford, Harvard, NPTEL, etc.</span>
              </div>
            </label>
          </div>
          )}
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
                  <Mountain className="w-4 h-4" /> Architect {useLocalAI ? '(Local)' : '(OpenRouter)'}
                </>
              ) : (
                <>
                  <span className={`text-[12px] ${credits !== null && credits < 1 ? 'grayscale opacity-50' : ''}`}>💎</span>
                  {credits !== null && credits < 1 ? 'Get More Credits' : 'Architect (-1 Credit)'}
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

export default GenerateFromSyllabus;
