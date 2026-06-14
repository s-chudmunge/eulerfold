"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, RoadmapData } from '../../lib/api';
import { Loader, Route, Target, Zap, AlertCircle, Compass, History, Hourglass, Check, ChevronDown, Search, User, GraduationCap, Briefcase, ArrowRight, LogIn, Cpu, ShieldCheck, Unlink, Sparkles, BookOpen, Clock, Loader2, Link2, CheckCircle2, X, HardDrive, PlayCircle } from 'lucide-react';
import { orModelOptions } from '@/lib/modelUtils';
import { logAIUsage } from '@/lib/usageTracker';
import { supabase } from '@/lib/supabase/client';
import PaymentModal from '../PaymentModal';
import { OpenRouterModal } from './OpenRouterModal';
import { LocalAIModal } from './LocalAIModal';
import { CreateMLCEngine, hasModelInCache } from '@mlc-ai/web-llm';
import { jsonrepair } from 'jsonrepair';
import EulerLogoCanvas from '../EulerLogoCanvas';

interface RoadmapGeneratorProps {
  onRoadmapGenerated: (data: RoadmapData, formData: any) => void;
  isLanding?: boolean;
  onLoadingChange?: (loading: boolean) => void;
}

const ROLES = [
  // Software & Systems
  "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Engineer", 
  "Mobile App Developer", "Embedded Systems Engineer", "Game Developer", "DevOps Engineer", 
  "Cloud Architect", "Site Reliability Engineer (SRE)", "Systems Programmer", 
  
  // AI & Data
  "AI Engineer", "Machine Learning Researcher", "Data Scientist", "Data Analyst", 
  "Data Engineer", "NLP Specialist", "Computer Vision Engineer", "AI Product Manager",
  
  // Design & Product
  "UI/UX Designer", "Product Manager", "Product Designer", "User Researcher", "Technical Writer",
  
  // Specialized Engineering
  "Cybersecurity Analyst", "Security Researcher", "Blockchain Developer", "Hardware Engineer",
  "Robotics Engineer", "Civil Engineer", "Mechanical Engineer", "Electrical Engineer",
  
  // Business & Finance
  "Financial Analyst", "Quantitative Researcher", "Business Analyst", "Marketing Specialist",
  "Digital Marketer", "Investment Banker", "Venture Capitalist",
  
  // Academic & Scientific
  "Undergraduate Student", "High School Student", "PhD Candidate", "Academic Researcher", 
  "Medical Student", "Bioinformatics Scientist", "Physicist", "Computational Biologist",
  
  // Other
  "Self-Taught Developer", "Technical Recruiter", "Career Switcher"
];

const EXPERIENCE_LEVELS = [
  { id: 'novice', label: 'Novice', desc: 'No prior knowledge' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Some basic understanding' },
  { id: 'advanced', label: 'Advanced', desc: 'Working knowledge' },
  { id: 'expert', label: 'Expert', desc: 'Deep technical mastery' }
];

const RoadmapGenerator: React.FC<RoadmapGeneratorProps> = ({ 
  onRoadmapGenerated, 
  isLanding = false,
  onLoadingChange
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState({
    subject: '',
    goal: '',
    prior_experience: '',
    experience_level: 'novice',
    current_role: '',
    target_role: '',
    time_value: 4,
  });

  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isOpenRouterModalOpen, setIsOpenRouterModalOpen] = useState(false);
  const [openRouterKey, setOpenRouterKey] = useState<string | null>(null);
  const [useOpenRouter, setUseOpenRouter] = useState<boolean>(true);
  const [openRouterModel, setOpenRouterModel] = useState<string | null>(null);
  const [usageHistory, setUsageHistory] = useState<any[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  
  const [isLocalAIModalOpen, setIsLocalAIModalOpen] = useState(false);
  const [localAIModelId, setLocalAIModelId] = useState<string | null>(null);
  const [localAIModelName, setLocalAIModelName] = useState<string | null>(null);
  const [useLocalAI, setUseLocalAI] = useState<boolean>(false);
  
  const [roleSearchCurrent, setRoleSearchCurrent] = useState('');
  const [isRoleDropdownOpenCurrent, setIsRoleDropdownOpenCurrent] = useState(false);
  
  const [roleSearchTarget, setRoleSearchTarget] = useState('');
  const [isRoleDropdownOpenTarget, setIsRoleDropdownOpenTarget] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const checkConfig = async () => {
    setOpenRouterKey(localStorage.getItem('openRouterKey'));
    setOpenRouterModel(localStorage.getItem('openRouterModel') || 'openai/gpt-4o');
    
    // Fetch unified AI usage from backend if session exists, else fallback
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (currentSession) {
      try {
        const res = await api.get('/ai-usage?limit=3');
        // Map backend response to match the expected format
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
      } catch (e) {}
    }

    setLocalAIModelId(localStorage.getItem('localAIModelId'));
    setLocalAIModelName(localStorage.getItem('localAIModelName'));
  };

  useEffect(() => {
    setShowOptionalFields(false);
    checkConfig();
  }, [step]);

  const currentRoleRef = useRef<HTMLDivElement>(null);
  const targetRoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (currentRoleRef.current && !currentRoleRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpenCurrent(false);
      }
      if (targetRoleRef.current && !targetRoleRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpenTarget(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchProfileAndCredits = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      if (currentSession?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('supabase_uid', currentSession.user.id)
          .single();
        if (data) {
          setProfile(data);
          setCredits(data.roadmap_credits);
        }
      }
    };
    fetchProfileAndCredits();
  }, []);

  useEffect(() => {
    const rawSubject = searchParams.get('subject') || '';
    const rawGoal = searchParams.get('goal') || '';
    
    if (rawSubject || rawGoal) {
        setFormData(prev => ({
            ...prev,
            subject: rawSubject,
            goal: rawGoal
        }));
    }
  }, [searchParams]);

  const loadingMessages = [
    "Tinkering with modules...",
    "Shimmying through data...",
    "Calibrating curriculum...",
    "Architecting logic...",
    "Distilling knowledge...",
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateRoadmap = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.subject || !formData.goal) return;

    if (!session) {
      sessionStorage.setItem('pending_roadmap_form', JSON.stringify(formData));
      router.push(`/login?message=auth_required_to_generate&next=${window.location.pathname}`);
      return;
    }

    const bypassCredits = (openRouterKey && useOpenRouter) || (useLocalAI && localAIModelId);
    if (!bypassCredits && credits !== null && credits < 1) {
      setIsPaymentModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setError(null);

    const context_str = `The learner is currently a ${formData.current_role || 'student/professional'} but is aspiring to become a ${formData.target_role || 'expert in this field'}. They have ${formData.experience_level || 'some'} experience level in the subject area. ${formData.prior_experience ? `Additional context on their background: ${formData.prior_experience}` : ''}`;

    const systemPrompt = `You are a technical lead. Generate a rigorous technical learning roadmap. Output JSON ONLY matching the required schema.`;

    const userPrompt = `
Generate a rigorous technical learning roadmap for the subject: "${formData.subject}".
The learner's specific goal is: "${formData.goal}".
${context_str}
Estimated duration: ${formData.time_value} ${formData.time_unit || 'weeks'}.

**Rules:**
1. **Engaging Title:** The "title" must be catchy, SEO-friendly, and natural (e.g., "The Complete Guide to Number Theory", "Mastering React Hooks"). Do NOT use dry, robotic formats like "Intensive 4-Week X Mastery Roadmap". Do NOT include the time duration in the title.
2. **SEO-Friendly Description:** The "description" must be a single, punchy, search-engine-friendly sentence similar to the title. Do NOT use long paragraphs like "This intensive intensive X-week roadmap is designed for...".
3. **Technical Rigor:** Focus on depth and verifiable technical skills. Avoid introductory fluff.
4. **Logical Progression:** Structure the path into modules that build upon each other logically.
5. **Specific Topics:** Each module must have 3-5 specific topics. Use industry-standard technical terms.
6. **Practical Outcomes:** For each module, include a "proof_of_work_instructions" object that details a realistic technical task the user must solve to demonstrate mastery.
7. **Applied Mastery:** Ensure each module leads to a specific competency string starting with "By the end of this module you will be able to...".
8. **Output JSON ONLY** matching this schema:
   {
     "title": "string",
     "description": "A single, search engine friendly line describing the roadmap (max 1 sentence).",
     "modules": [
       {
         "title": "string",
         "outcome": "string",
         "timeline": "string",
         "workspace_type": "code|research|design",
         "proof_of_work_instructions": {
            "what_to_build": "string (Max 1 line, strictly concise)",
            "what_counts_as_evidence": "string (Max 1 line, strictly concise)",
            "eval_criteria": ["string (Short criterion)", "string (Short criterion)"]
         },
         "topics": [
           { "title": "string", "subtopics": [ { "title": "string" } ] }
         ],
         "optimal_search_query": "string"
       }
     ]
   }
7. **Optimal Search Query:** For EACH module, provide an "optimal_search_query" field. This must be a highly specific, clean search string (e.g. "React Hooks useEffect tutorial") that will yield the best search engine results for reading materials about this exact module.
8. **Workspace Selection:** 
   - Set "workspace_type" to "code" for implementation, algorithms, or scripting tasks.
   - Set "workspace_type" to "design" for system architecture, distributed systems, infrastructure, or UI/UX.
   - Set "workspace_type" to "research" for theoretical science, mathematics, or technical writing.
`;

    const localSystemPrompt = `You are a strict JSON data generator. You must reply ONLY with valid JSON. Do not include markdown, explanations, or any conversational text.`;

    const localUserPrompt = `
Generate a technical learning roadmap for the subject: "${formData.subject}". Goal: "${formData.goal}".
Context: ${context_str}
Duration: ${formData.time_value} ${formData.time_unit || 'weeks'}.

Generate a catchy, SEO-friendly, and natural title (e.g., "The Complete Guide to Number Theory"). Do NOT use dry, robotic formats like "Intensive 4-Week X Mastery Roadmap" and do NOT include the duration in the title.

CRITICAL REQUIREMENT: You MUST generate EXACTLY ${formData.time_value} modules in the "modules" array (one module for each unit of time). Do not just output one module.

Reply ONLY with a raw JSON object matching EXACTLY this structure:
{
  "title": "Roadmap Title",
  "description": "Short description",
  "modules": [
    {
      "title": "Module Title",
      "outcome": "Module outcome",
      "timeline": "Week 1",
      "workspace_type": "code",
      "proof_of_work_instructions": {
        "what_to_build": "Task description (Max 1 line, strictly concise)",
        "what_counts_as_evidence": "Evidence (Max 1 line, strictly concise)",
        "eval_criteria": ["Criteria 1 (Short)", "Criteria 2 (Short)"]
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
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openRouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "EulerFold AI"
          },
          body: JSON.stringify({
            model: openRouterModel || 'openai/gpt-4o',
            messages: [{ role: "user", content: fullPrompt }],
            response_format: { type: "json_object" }
          })
        });

        if (!response.ok) {
          let errorMsg = `OpenRouter API Error: ${response.status}`;
          try {
            const errData = await response.json();
            errorMsg = errData.error?.message || errorMsg;
          } catch (e) {} // ignore json parse errors
          
          if (response.status === 429) {
            errorMsg = "OpenRouter Rate Limit Reached: Please wait a moment or try selecting a different model from the 'Bring Your Own Key' configuration.";
          }
          throw new Error(errorMsg);
        }

        const data = await response.json();
        let generatedText = data.choices[0].message.content || "";
        
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

        if (!cleanedText) {
          throw new Error("The AI model returned an empty response. It may have hit a safety filter. Please try a different model or adjust your prompt.");
        }

        let roadmapPlan;
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
          throw new Error("Failed to parse AI response: " + e.message);
        }

        const saveResponse = await api.post("/roadmaps/save-external", {
          roadmap_plan: roadmapPlan,
          subject: formData.subject,
          goal: formData.goal,
          time_value: formData.time_value || 4,
          time_unit: 'weeks',
          model: openRouterModel || 'openai/gpt-4o'
        });

        console.log("OpenRouter complete response data:", data);

        // Fallback for usage if OpenRouter omitted it but we know it generated text
        const usageObj = data.usage || {
           prompt_tokens: 0,
           completion_tokens: 0,
           total_tokens: 0
        };

        try {
          await logAIUsage({
            id: saveResponse.data?.slug,
            subject: formData.subject,
            model: openRouterModel || 'openai/gpt-4o',
            prompt_tokens: usageObj.prompt_tokens || 0,
            completion_tokens: usageObj.completion_tokens || 0,
            total_tokens: usageObj.total_tokens || 0
          });
        } catch (e) {
          console.error("Failed to save usage history:", e);
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
          let parsedJSON = null;

          let responseUsage = null;

          for (let attempt = 1; attempt <= 2; attempt++) {
            try {
              const response = await engine.chat.completions.create({
                messages: [
                  { role: "system", content: localSystemPrompt },
                  { role: "user", content: localUserPrompt }
                ],
                max_tokens: 8192,
                // Not all WebLLM models support json_object, but we can try response_format if needed.
                // We will rely on strong prompting here and manual parsing.
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
              console.warn(`Local AI Generation attempt ${attempt} failed to parse JSON.`, err);
              if (attempt === 2) throw new Error("Local AI failed to generate valid JSON after 2 attempts. Try a different model or use EulerFold AI.");
            }
          }

          if (!parseSuccess || !parsedJSON) {
            throw new Error("Local AI failed to generate valid JSON.");
          }

          const saveResponse = await api.post("/roadmaps/save-external", {
            roadmap_plan: parsedJSON,
            subject: formData.subject,
            goal: formData.goal,
            time_value: formData.time_value || 4,
            time_unit: 'weeks',
            model: localAIModelId
          });

          try {
            await logAIUsage({
              id: saveResponse.data?.slug,
              subject: formData.subject,
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
        const response = await api.post('/roadmaps/generate', {
          ...formData,
          time_unit: 'weeks',
          model: profile?.is_pro ? 'models/gemini-2.5-pro' : 'models/gemini-2.5-flash',
        });
        onRoadmapGenerated(response.data, { ...formData, time_unit: 'weeks' });
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push(`/login?message=auth_required_to_generate&next=${window.location.pathname}`);
      } else if (err.response?.status === 402) {
        sessionStorage.setItem('pending_roadmap_form_after_pay', JSON.stringify(formData));
        setIsPaymentModalOpen(true);
      } else {
        setError(err.message || "Generation error.");
      }
      setIsGenerating(false);
    }
  };

  const filteredRolesCurrent = ROLES.filter(r => r.toLowerCase().includes(roleSearchCurrent.toLowerCase()));
  const filteredRolesTarget = ROLES.filter(r => r.toLowerCase().includes(roleSearchTarget.toLowerCase()));

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl flex gap-3 items-start">
              <div className="shrink-0 mt-0.5">
                <EulerLogoCanvas size={24} color1={0xd97706} color2={0xf59e0b} wireframe={false} />
              </div>
              <p className="text-[13px] text-text-primary leading-relaxed font-medium">
                Generates a fully custom, structured technical roadmap tailored precisely to your goals and current expertise level.
              </p>
            </div>
            
            <div className="space-y-5">
               <label className="inconsolata-ui flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
                 1. Core Objective
               </label>

               {/* Subject - Required & More Prominent */}
               <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-accent" />
                    <span className="text-[13px] font-bold text-text-heading">What subject do you want to master?</span>
                  </div>
                  <input
                    type="text"
                    name="subject"
                    autoFocus
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="e.g. Distributed Systems"
                    className="w-full px-4 py-3 bg-callout-bg border-2 border-border rounded-lg focus:outline-none focus:border-accent transition-all text-[16px] font-bold text-text-heading placeholder:font-normal placeholder:text-text-muted/50"
                  />
               </div>

               {/* Goal - Required & More Prominent */}
               <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Route className="w-3.5 h-3.5 text-accent" />
                    <span className="text-[13px] font-bold text-text-heading">Specific End Goal</span>
                  </div>
                  <textarea
                    name="goal"
                    value={formData.goal}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Example: I want to be able to build a scalable real-time chat application using WebSockets and Redis."
                    className="w-full px-4 py-3 bg-callout-bg border-2 border-border rounded-lg focus:outline-none focus:border-accent transition-all text-[14px] font-medium text-text-heading placeholder:text-text-muted/50 resize-none h-20"
                  />
               </div>

               <div className="pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowOptionalFields(!showOptionalFields)}
                    className="flex items-center gap-2 text-[11px] font-bold text-text-muted hover:text-accent transition-colors uppercase tracking-widest"
                  >
                    <div className={`transition-transform duration-300 ${showOptionalFields ? 'rotate-180' : ''}`}>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                    {showOptionalFields ? 'Hide Personal Context' : 'Add Personal Context (Optional)'}
                  </button>

                  {showOptionalFields && (
                    <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Current Role */}
                        <div className="relative" ref={currentRoleRef}>
                            <div className="flex items-center gap-1.5 mb-2">
                              <User className="w-3 h-3 text-accent" />
                              <span className="text-[12px] font-bold text-text-heading">Current Role</span>
                            </div>
                            <div className="relative">
                              <input 
                                type="text"
                                placeholder="What you do now..."
                                value={roleSearchCurrent || formData.current_role}
                                onFocus={() => setIsRoleDropdownOpenCurrent(true)}
                                onChange={(e) => {
                                  setRoleSearchCurrent(e.target.value);
                                  setFormData(prev => ({ ...prev, current_role: e.target.value }));
                                }}
                                className="w-full px-3 py-2 bg-callout-bg border border-border rounded-lg focus:outline-none focus:border-accent transition-all text-[13px] font-medium"
                              />
                              <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted transition-transform ${isRoleDropdownOpenCurrent ? 'rotate-180' : ''}`} />

                              {isRoleDropdownOpenCurrent && (
                                <div className="absolute z-20 w-full mt-1 bg-surface border border-border shadow-2xl max-h-40 overflow-y-auto no-scrollbar rounded-xl">
                                  {filteredRolesCurrent.map(r => (
                                    <button
                                      key={r}
                                      onClick={() => {
                                        setFormData(prev => ({ ...prev, current_role: r }));
                                        setRoleSearchCurrent(r);
                                        setIsRoleDropdownOpenCurrent(false);
                                      }}
                                      className="w-full text-left px-3 py-2 text-[12px] hover:bg-sidebar transition-colors flex items-center justify-between bg-surface"
                                    >
                                      {r}
                                      {formData.current_role === r && <Check className="w-3 h-3 text-accent" />}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                        </div>

                        {/* Target Role */}
                        <div className="relative" ref={targetRoleRef}>
                            <div className="flex items-center gap-1.5 mb-2">
                              <Target className="w-3 h-3 text-accent" />
                              <span className="text-[12px] font-bold text-text-heading">Target Goal</span>
                            </div>
                            <div className="relative">
                              <input 
                                type="text"
                                placeholder="What you want to be..."
                                value={roleSearchTarget || formData.target_role}
                                onFocus={() => setIsRoleDropdownOpenTarget(true)}
                                onChange={(e) => {
                                  setRoleSearchTarget(e.target.value);
                                  setFormData(prev => ({ ...prev, target_role: e.target.value }));
                                }}
                                className="w-full px-3 py-2 bg-callout-bg border border-border rounded-lg focus:outline-none focus:border-accent transition-all text-[13px] font-medium"
                              />
                              <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted transition-transform ${isRoleDropdownOpenTarget ? 'rotate-180' : ''}`} />

                              {isRoleDropdownOpenTarget && (
                                <div className="absolute z-20 w-full mt-1 bg-surface border border-border shadow-2xl max-h-40 overflow-y-auto no-scrollbar rounded-xl">
                                  {filteredRolesTarget.map(r => (
                                    <button
                                      key={r}
                                      onClick={() => {
                                        setFormData(prev => ({ ...prev, target_role: r }));
                                        setRoleSearchTarget(r);
                                        setIsRoleDropdownOpenTarget(false);
                                      }}
                                      className="w-full text-left px-3 py-2 text-[12px] hover:bg-sidebar transition-colors flex items-center justify-between bg-surface"
                                    >
                                      {r}
                                      {formData.target_role === r && <Check className="w-3 h-3 text-accent" />}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                        </div>
                      </div>

                      {/* Experience Level */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="w-3 h-3 text-accent" />
                          <span className="text-[12px] font-bold text-text-heading">Current Proficiency</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {EXPERIENCE_LEVELS.map(level => (
                            <button
                              key={level.id}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, experience_level: level.id }))}
                              className={`p-2.5 border text-left transition-all rounded-lg ${
                                formData.experience_level === level.id 
                                  ? 'bg-accent/10 border-accent ring-1 ring-accent' 
                                  : 'bg-surface border-border hover:border-accent/40 shadow-sm'
                              }`}
                            >
                              <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${formData.experience_level === level.id ? 'text-accent' : 'text-text-muted'}`}>
                                {level.label}
                              </div>
                              <div className="text-[9px] text-text-muted leading-tight">
                                {level.desc}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
               </div>
            </div>

            {!isGenerating && (
              <div className="pt-2">
                <button
                  onClick={() => setStep(2)}
                  disabled={!formData.subject.trim() || !formData.goal.trim()}
                  className="w-full sm:w-fit px-8 py-3 bg-text-heading text-background text-[11px] font-bold uppercase tracking-[0.2em] hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-text-heading/10"
                >
                  Set Timeline <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="mt-8 flex flex-col gap-2 max-w-sm">
                <div className="flex items-center justify-between p-1 bg-sidebar border border-border rounded-lg w-full">
                  <button
                    type="button"
                    disabled={true}
                    onClick={() => {}}
                    className={`flex-1 py-1.5 px-3 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all text-red-500 opacity-60 cursor-not-allowed`}
                  >
                    EulerFold AI (Temporary Outage)
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
                            Powered by Google Gemini 2.5. Fast, robust roadmaps. <span className="text-amber-500/90 font-bold">Costs 1 Credit per generation.</span>
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
                          ? <span>Ready to generate using <span className="font-bold text-accent">{localAIModelName}</span>.</span> 
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
            <div className={`p-4 border border-border rounded-xl bg-sidebar/50 transition-all duration-300 ${openRouterKey ? 'mt-4' : 'mt-6'} ${(!useOpenRouter && openRouterKey) ? 'opacity-50 grayscale' : ''}`}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-background border border-border rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                    {/* OpenRouter placeholder logo */}
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
                        ? <span>Ready to generate using <span className="font-bold text-accent">{openRouterModel || 'openai/gpt-4o'}</span>.</span> 
                        : 'Use any AI model via OpenRouter. Unlimited roadmaps, zero credits required.'}
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
                  {!session ? (
                    <button
                      type="button"
                      onClick={() => {
                        sessionStorage.setItem('pending_roadmap_form', JSON.stringify(formData));
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
              
              {session && openRouterKey && usageHistory.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <History className="w-3.5 h-3.5 text-text-muted" />
                      <span className="text-[9px] font-bold text-text-heading uppercase tracking-widest">Recent AI Usage</span>
                    </div>
                    <a href="https://openrouter.ai/activity" target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-accent hover:underline">
                      View Log →
                    </a>
                  </div>
                  <div className="space-y-2">
                    {usageHistory.slice(0, 3).map((h, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-background border border-border/50 rounded-lg text-left shadow-sm">
                        <div className="truncate pr-2 max-w-[60%]">
                          <div className="text-[11px] font-bold text-text-heading truncate">{h.subject}</div>
                          <div className="text-[9px] text-text-muted mt-0.5 truncate">{h.model}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[10px] font-bold text-accent">{h.total_tokens.toLocaleString()} tokens</div>
                          <div className="text-[9px] text-text-muted">{new Date(h.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-3">
               <label className="inconsolata-ui flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
                 2. Intensity & Context
               </label>

               {useLocalAI && (
                 <div className="bg-accent/5 border border-accent/20 p-3 rounded-lg mb-4 flex gap-3 items-start animate-in fade-in">
                   <AlertCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                   <div className="text-left">
                     <p className="text-[11px] font-bold text-text-heading mb-0.5 uppercase tracking-widest">Local Model Limitations</p>
                     <p className="text-[11px] text-text-muted leading-relaxed font-medium">
                       To get the best results from smaller local models, keep your target duration short (2-4 weeks) and your goal specific. Local models may struggle to generate detailed 8+ week schedules or process large amounts of custom context.
                     </p>
                   </div>
                 </div>
               )}

               {!useLocalAI && !useOpenRouter && (
                 <div className="bg-accent/5 border border-accent/20 p-3 rounded-lg mb-4 flex gap-3 items-start animate-in fade-in">
                   <Zap className="w-4 h-4 text-amber-500/90 shrink-0 mt-0.5" />
                   <div className="text-left">
                     <p className="text-[11px] font-bold text-text-heading mb-0.5 uppercase tracking-widest">Generation Cost</p>
                     <p className="text-[11px] text-text-muted leading-relaxed font-medium">
                       Architecting this roadmap with EulerFold AI will utilize <span className="font-bold text-amber-500/90">1 Credit</span> from your account balance.
                     </p>
                   </div>
                 </div>
               )}

               {/* Target Duration */}
               <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Hourglass className="w-3 h-3 text-accent" />
                    <span className="text-[12px] font-bold text-text-heading">Target Duration</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(profile?.is_pro ? [2, 3, 4, 6, 8, 10, 12] : [2, 3, 4]).map(w => (
                      <button
                        type="button"
                        key={w}
                        onClick={() => setFormData(prev => ({ ...prev, time_value: w }))}
                        className={`px-4 py-1.5 border text-[10px] font-bold uppercase tracking-widest transition-all rounded-md
                          ${formData.time_value === w 
                            ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20' 
                            : 'bg-background text-text-muted border-border hover:border-accent hover:text-accent'
                          }`}
                      >
                        {w} Weeks
                      </button>
                    ))}
                    {!profile?.is_pro && (
                      <button 
                        type="button"
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="px-3 py-1.5 text-[9px] font-bold text-accent border border-accent/20 border-dashed hover:bg-accent/5 transition-all rounded-md"
                      >
                        Unlock 6-12 Weeks (Pro)
                      </button>
                    )}
                  </div>
               </div>

               {/* Context */}
               <div className="pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowOptionalFields(!showOptionalFields)}
                    className="flex items-center gap-2 text-[11px] font-bold text-text-muted hover:text-accent transition-colors uppercase tracking-widest"
                  >
                    <div className={`transition-transform duration-300 ${showOptionalFields ? 'rotate-180' : ''}`}>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                    {showOptionalFields ? 'Hide Detailed Context' : 'Add Detailed Context (Optional)'}
                  </button>

                  {showOptionalFields && (
                    <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-1.5">
                        <History className="w-3 h-3 text-accent" />
                        <span className="text-[12px] font-bold text-text-heading">Detailed Context</span>
                      </div>
                      <textarea
                        name="prior_experience"
                        value={formData.prior_experience}
                        onChange={handleInputChange}
                        rows={2}
                        placeholder="What do you already know? Any specific technologies you prefer or want to avoid?"
                        className="w-full px-3 py-2 bg-callout-bg border border-border rounded-lg focus:outline-none focus:border-accent transition-all text-[13px] font-medium resize-none h-20"
                      />
                    </div>
                  )}
               </div>
            </div>

            {!isGenerating && (
              <div className="mt-8 flex flex-col gap-6">
                <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl text-center max-w-lg mx-auto w-full shadow-sm">
                  <p className="text-[11px] font-bold text-accent mb-1.5 flex items-center justify-center gap-1.5 uppercase tracking-widest"><Hourglass className="w-3.5 h-3.5"/> Generation Takes Time</p>
                  <p className="text-[11px] text-text-muted leading-relaxed max-w-sm mx-auto">Our AI requires about 20-40 seconds to architect a complete learning roadmap. Please be patient after clicking generate.</p>
                </div>
                  <div className="flex flex-col gap-2 max-w-sm mx-auto w-full">
                    <div className="flex items-center justify-between p-1 bg-sidebar border border-border rounded-lg w-full">
                      <button
                        type="button"
                        disabled={true}
                        onClick={() => {}}
                        className={`flex-1 py-1.5 px-3 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all text-red-500 opacity-60 cursor-not-allowed`}
                      >
                        EulerFold AI (Temporary Outage)
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
                      <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest text-center animate-in fade-in">
                        Model: <span className="text-accent">Google Gemini 2.5 Flash / Pro</span>
                      </div>
                    )}
                  </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button
                    onClick={() => setStep(1)}
                  className="w-full sm:w-fit px-6 py-2.5 bg-background border border-border text-text-muted text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-sidebar transition-all rounded-lg"
                >
                  Back
                </button>
                {!session ? (
                    <button
                      onClick={generateRoadmap}
                      className="w-full sm:w-fit group relative inline-flex items-center justify-center px-7 py-3 text-[14px] font-bold transition-all bg-gradient-to-b from-teal-400 to-teal-600 text-white hover:brightness-110 active:border-b-0 active:translate-y-[4px] border-b-[4px] border-teal-800 shadow-lg gap-2 rounded-2xl"
                    >
                      <LogIn className="w-4 h-4" /> Authenticate
                    </button>
                ) : (
                    <button
                      onClick={generateRoadmap}
                      disabled={isGenerating}
                      className={`w-full sm:w-fit group relative inline-flex items-center justify-center px-7 py-3 text-[14px] font-bold transition-all rounded-2xl ${
                        (!useLocalAI && !(openRouterKey && useOpenRouter) && credits !== null && credits < 1)
                        ? 'bg-sidebar border-2 border-border text-text-muted hover:border-accent/40' 
                        : 'bg-gradient-to-b from-teal-400 to-teal-600 text-white hover:brightness-110 active:border-b-0 active:translate-y-[4px] border-b-[4px] border-teal-800 shadow-lg'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {(openRouterKey && useOpenRouter) || useLocalAI ? (
                          <>
                            <Cpu className="w-4 h-4" /> Architect {useLocalAI ? '(Local)' : '(OpenRouter)'}
                          </>
                        ) : (
                          <>
                            <span className={`text-[12px] ${credits !== null && credits < 1 ? 'grayscale opacity-50' : ''}`}>💎</span>
                            {credits !== null && credits < 1 ? 'Get More Credits' : 'Architect (-1 Credit)'}
                          </>
                        )}
                      </div>
                    </button>
                )}
                </div>
              </div>
            )}
            
            {(openRouterKey && useOpenRouter) && (
               <div className="mt-4 flex flex-col items-center justify-center gap-4 text-emerald-600 dark:text-emerald-400">
                 <div className="flex items-center justify-center gap-1.5">
                   <ShieldCheck className="w-3 h-3" />
                   <span className="text-[9px] font-bold uppercase tracking-widest">Key stored locally • Never hits our servers</span>
                 </div>
                 
                 {session && usageHistory.length > 0 && (
                   <div className="w-full mt-2 pt-4 border-t border-border">
                     <div className="flex items-center justify-between mb-3">
                       <div className="flex items-center gap-2">
                         <History className="w-3.5 h-3.5 text-text-muted" />
                         <span className="text-[9px] font-bold text-text-heading uppercase tracking-widest">Recent AI Usage</span>
                       </div>
                       <a href="https://openrouter.ai/activity" target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-accent hover:underline">
                         View Log →
                       </a>
                     </div>
                     <div className="space-y-2">
                       {usageHistory.slice(0, 3).map((h, i) => (
                         <div key={i} className="flex items-center justify-between p-2.5 bg-sidebar/50 border border-border/50 rounded-lg text-left">
                           <div className="truncate pr-2 max-w-[60%]">
                             <div className="text-[11px] font-bold text-text-heading truncate">{h.subject}</div>
                             <div className="text-[9px] text-text-muted mt-0.5 truncate">{h.model}</div>
                           </div>
                           <div className="text-right shrink-0">
                             <div className="text-[10px] font-bold text-accent">{h.total_tokens.toLocaleString()} tokens</div>
                             <div className="text-[9px] text-text-muted">{new Date(h.date).toLocaleDateString()}</div>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full manrope-body">
      <div className="mb-4 flex items-center justify-center md:justify-start gap-4">
        {[1, 2].map(i => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-8 h-8 flex items-center justify-center text-[11px] font-bold border transition-all rounded-md ${
              step === i ? 'bg-accent text-white border-accent' : step > i ? 'bg-sidebar text-text-muted border-border' : 'bg-background text-text-muted border-border'
            }`}>
              {step > i ? <Check className="w-4 h-4" /> : i}
            </div>
            {i < 2 && <div className={`w-8 md:w-16 h-[1px] ${step > i ? 'bg-accent' : 'bg-border'}`} />}
          </div>
        ))}
      </div>

      {renderStep()}

      {isGenerating && (
        <div className="mt-12 flex flex-col items-center justify-center animate-in fade-in duration-700">
          <p className="inconsolata-ui text-[11px] font-bold text-accent uppercase tracking-[0.2em] mb-4">
            {loadingMessages[currentMessageIndex]}
          </p>
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div 
                key={i} 
                className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" 
                style={{ animationDelay: `${i * 0.2}s` }} 
              />
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
        <div className="mt-8 p-4 bg-red-500/5 border-l-2 border-red-500 flex items-center gap-3 text-red-500 animate-in slide-in-from-left-1 duration-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="inconsolata-ui text-[10px] font-bold uppercase tracking-widest leading-relaxed">{error}</p>
        </div>
      )}
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        onSuccess={() => {
          setIsPaymentModalOpen(false);
          // Simple refresh of profile
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
              supabase.from('profiles').select('*').eq('supabase_uid', session.user.id).single().then(({ data }) => {
                if (data) {
                  setProfile(data);
                  setCredits(data.roadmap_credits);
                }
              });
            }
          });
        }} 
      />
      <OpenRouterModal
        isOpen={isOpenRouterModalOpen}
        onClose={() => {
          setIsOpenRouterModalOpen(false);
          checkConfig();
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

export default RoadmapGenerator;
