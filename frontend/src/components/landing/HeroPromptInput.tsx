"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Sparkles, Github, Briefcase, Link2, BookOpen, Target, Cpu, HardDrive, Wand2, BrainCircuit, Waypoints, Microscope, Compass, Globe, Library, Activity, Atom } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase/client';

const LocalAIModal = dynamic(() => import('./LocalAIModal').then(m => ({ default: m.LocalAIModal })), { ssr: false });
const PaymentModal = dynamic(() => import('../PaymentModal'), { ssr: false });

type Mode = 'ai' | 'job' | 'url' | 'syllabus' | 'gaps' | 'research';
type Engine = 'eulerfold' | 'openrouter' | 'local';

const MODES: { id: Mode; label: string; icon: any; placeholder: string }[] = [
  { id: 'ai', label: 'AI Gen', icon: Waypoints, placeholder: "e.g. I want to master Transformer architectures from scratch" },
  { id: 'job', label: 'Job Decoded', icon: Compass, placeholder: "Paste any job description or URL..." },
  { id: 'url', label: 'From Link', icon: Globe, placeholder: "Paste an article, GitHub repo, or doc link..." },
  { id: 'syllabus', label: 'Syllabus', icon: Library, placeholder: "Paste your course syllabus or outline..." },
  { id: 'gaps', label: 'Skill Quiz', icon: Activity, placeholder: "What is your target role?" },
  { id: 'research', label: 'Research Lab', icon: Atom, placeholder: "Paste a PDF URL or ArXiv link to decode..." },
];

const ENGINES: { id: Engine; label: string; icon: any }[] = [
  { id: 'eulerfold', label: 'EulerFold AI', icon: BrainCircuit },
  { id: 'openrouter', label: 'OpenRouter', icon: Cpu },
  { id: 'local', label: 'Local AI', icon: HardDrive },
];

const LOADING_MESSAGES = [
  "Firing up the engine... 🚀",
  "Brainstorming the concepts... 🧠",
  "Structuring the knowledge tree... 🏗️",
  "Letting the AI cook... 🔥",
  "Hunting down the best resources... 🔎",
  "Filtering out the noise... 🎧",
  "Connecting the dots... 🧩",
  "Curating the good stuff... 💎",
  "Polishing the final modules... ✨",
  "Almost there, trust the process... 🫡"
];

export default function HeroPromptInput() {
  const [mode, setMode] = useState<Mode>('ai');
  const [engine, setEngine] = useState<Engine>('eulerfold');
  const [step, setStep] = useState<1 | 2>(1);
  
  const [value, setValue] = useState('');
  // Step 2 state
  const [timeValue, setTimeValue] = useState(4);
  const [timeUnit, setTimeUnit] = useState('weeks');
  const [experienceLevel, setExperienceLevel] = useState('novice');

  const [isFocused, setIsFocused] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dynamicLoadingMsg, setDynamicLoadingMsg] = useState('');

  const [isLocalAIModalOpen, setIsLocalAIModalOpen] = useState(false);
  const [localAIModelId, setLocalAIModelId] = useState<string | null>(null);
  const [localAIModelName, setLocalAIModelName] = useState<string | null>(null);
  const [openRouterModel, setOpenRouterModel] = useState<string>('openai/gpt-4o');

  useEffect(() => {
    const savedId = localStorage.getItem('localAIModelId');
    const savedName = localStorage.getItem('localAIModelName');
    const savedOrModel = localStorage.getItem('openRouterModel') || localStorage.getItem('openrouter_model');
    if (savedId) setLocalAIModelId(savedId);
    if (savedName) setLocalAIModelName(savedName);
    if (savedOrModel) setOpenRouterModel(savedOrModel);
  }, []);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [showEngineMenu, setShowEngineMenu] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      if (isGenerating) setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isGenerating]);


  useEffect(() => {
    if (user) {
      const savedState = sessionStorage.getItem('hero_prompt_state');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          setMode(state.mode);
          setEngine(state.engine);
          setValue(state.value);
          setTimeValue(state.timeValue);
          setTimeUnit(state.timeUnit);
          setExperienceLevel(state.experienceLevel);
          setStep(2);
          sessionStorage.removeItem('hero_prompt_state');
          
          // Auto-submit after state settles
          setTimeout(() => {
            submitGeneration(state.value);
          }, 300);
        } catch (e) {
          console.error("Failed to parse saved state", e);
        }
      } else {
        // Fallback for old key
        const oldSubject = sessionStorage.getItem('pending_roadmap_subject');
        if (oldSubject) {
            setValue(oldSubject);
            sessionStorage.removeItem('pending_roadmap_subject');
            setStep(2);
            setTimeout(() => {
                submitGeneration(oldSubject);
            }, 300);
        }
      }
    }
  }, [user]);

  const [toastMsg, setToastMsg] = useState('');
  
  // Listen for ecosystem tool clicks
  useEffect(() => {
    const handleModeSelect = (e: any) => {
      const targetMode = e.detail?.mode;
      if (targetMode) {
        setMode(targetMode);
        setStep(1);
        
        const modeObj = MODES.find(m => m.id === targetMode);
        if (modeObj) {
          const friendlyMessages: Record<string, string> = {
            'ai': 'Ready to generate a course. Tell us what you want to learn!',
            'job': 'Ready to decode a job. Paste a description or URL below!',
            'url': 'Ready to deconstruct a link. Paste your URL below!',
            'syllabus': 'Ready to parse a syllabus. Paste your outline below!',
            'gaps': 'Ready to analyze your skills. Enter your target role below!',
            'research': 'Ready to decode research. Paste a paper URL below!'
          };
          setToastMsg(friendlyMessages[targetMode] || `Ready to use ${modeObj.label}. Follow the instructions below!`);
          setTimeout(() => setToastMsg(''), 4000);
        }

        // Add a highlight animation class temporarily
        setIsFocused(true);
        setTimeout(() => setIsFocused(false), 2000);

        // Focus the textarea
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
          }
        }, 300);
      }
    };

    window.addEventListener('hero-mode-select', handleModeSelect);
    return () => window.removeEventListener('hero-mode-select', handleModeSelect);
  }, []);

  const handleNextStep = () => {
    if (!value.trim()) return;
    if (mode === 'research') {
       submitGeneration();
    } else {
       setStep(2);
    }
  };

  const submitGeneration = async (overrideValue?: string) => {
    const finalValue = overrideValue || value;
    if (!user) {
        sessionStorage.setItem('hero_prompt_state', JSON.stringify({
            mode, engine, value: finalValue, timeValue, timeUnit, experienceLevel
        }));
        setShowLoginPrompt(true);
        return;
    }

    setIsGenerating(true);
    setDynamicLoadingMsg(''); // Reset
    
    try {
        let endpoint = '/roadmaps/generate';
        let payload: any = { time_value: timeValue, time_unit: timeUnit };


        if (mode === 'research') {
            if (engine === 'cloud' || engine === 'eulerfold') {
                const res = await api.post('/research-lab/decode', { paper_url: finalValue });
                router.push(`/research-lab/${res.data.id}`);
                return;
            } else {
                if (engine === 'local' && !localAIModelId) {
                    setIsGenerating(false);
                    setIsLocalAIModalOpen(true);
                    return;
                }
                const openRouterKey = localStorage.getItem('openrouter_key') || localStorage.getItem('openRouterKey');
                if (engine === 'openrouter' && !openRouterKey) {
                    setIsGenerating(false);
                    alert("Please set your OpenRouter API key in Settings first.");
                    return;
                }

                setDynamicLoadingMsg("Extracting paper text... 📄");
                const extRes = await api.post('/research-lab/extract', { paper_url: finalValue });
                const rawText = extRes.data.text;

                const prompt = `Deconstruct this paper into a structured Engineering Dossier.

TASK:
1. Identify paper archetype: Theoretical Math, Systems/Hardware, AI Architecture, or Applied Engineering.
2. Extract metadata: title, authors, year.
3. Create 5-6 technical modules.

REQUIRED MODULES (always include these 3):
- "The Shift": {"before": "old approach", "after": "new approach", "the_win": "core advantage"}
- "Logic": {"details": "step-by-step technical logic in Markdown. Use $...$ for inline math and $$...$$ for block math."}
- "Realities": {"items": ["gotcha 1", "gotcha 2", ...]}

OPTIONAL MODULES (pick 2-3 based on archetype):
- "Concept": {"details": "core architecture/mechanism breakdown in Markdown"}
- "Math": {"math": [{"formula": "$LaTeX$", "action": "what it computes", "intuition": "why it matters"}]}
- "Blueprint": {"details": "system design / implementation details in Markdown"}
- "Benchmarks": {"items": ["result 1", "result 2", ...]}

MATH RULE: Always use $...$ for inline math and $$...$$ for block math. Never use bare LaTeX.
STYLE: Plain English. Technical precision. No fluff. No filler.

Return ONLY this JSON structure:
{
    "paper_title": "Clean Title",
    "authors": ["Author 1", "Author 2"],
    "year": "202X",
    "archetype": "identified type",
    "modules": [
        {"id": "shift", "label": "The Shift", "data": {"before": "...", "after": "...", "the_win": "..."}},
        {"id": "logic", "label": "Logic", "data": {"details": "..."}},
        {"id": "realities", "label": "Realities", "data": {"items": ["..."]}}
    ],
    "summary": "2-3 sentence technical synthesis"
}`;
                
                let jsonStr = "";
                if (engine === 'local') {
                    setDynamicLoadingMsg(`Loading local model: ${localAIModelId}...`);
                    let engineLocal = null;
                    try {
                        const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
                        engineLocal = await CreateMLCEngine(localAIModelId, { 
                            initProgressCallback: (p) => setDynamicLoadingMsg(`Local AI: ${p.text}`) 
                        });
                        setDynamicLoadingMsg("Decoding paper directly on your GPU... 🧠");
                        const msg = await engineLocal.chat.completions.create({
                            messages: [{role: "user", content: prompt + "\n\nTEXT:\n" + rawText}],
                            max_tokens: 8000
                        });
                        jsonStr = msg.choices[0].message.content || "{}";
                    } finally {
                        if (engineLocal) {
                            try { await engineLocal.unload(); } catch(e) {}
                        }
                    }
                } else {
                    setDynamicLoadingMsg(`Reasoning with OpenRouter... 🧠`);
                    const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${openRouterKey}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            model: openRouterModel,
                            messages: [{role: "user", content: prompt + "\n\nTEXT:\n" + rawText}],
                            response_format: { type: "json_object" },
                            max_tokens: 8000
                        })
                    });
                    if (!orRes.ok) throw new Error("OpenRouter API error");
                    const data = await orRes.json();
                    jsonStr = data.choices[0].message.content;
                }

                setDynamicLoadingMsg("Saving analysis... 🚀");
                let analysisData;
                try {
                    let cleaned = jsonStr.trim();
                    if (cleaned.startsWith("```json")) cleaned = cleaned.replace(/^```json\n?/, "").replace(/```$/, "");
                    else if (cleaned.startsWith("```")) cleaned = cleaned.replace(/^```\n?/, "").replace(/```$/, "");
                    const { jsonrepair } = await import('jsonrepair');
                    analysisData = JSON.parse(jsonrepair(cleaned.trim()));
                } catch (e) {
                    throw new Error("The AI model failed to output valid JSON.");
                }
                const coreAnalysis = analysisData.modules ? analysisData : (analysisData.analysis || analysisData);
                const saveRes = await api.post('/research-lab/save-external', {
                    paper_url: finalValue,
                    analysis_data: { analysis: coreAnalysis, extracted_text: rawText.slice(0, 15000) }
                });
                router.push(`/research-lab/${saveRes.data.id}`);
                return;
            }
        }

        if (mode === 'ai') {

        if (engine === 'local') {
            if (!localAIModelId) {
                setIsGenerating(false);
                setIsLocalAIModalOpen(true);
                return;
            }
            
            setDynamicLoadingMsg(`Loading local model: ${localAIModelId}... (This may take a while to download to your GPU)`);
            
            const initProgressCallback = (report: any) => {
                setDynamicLoadingMsg(`Local AI: ${report.text}`);
            };
            
            let mlc_engine = null;
            try {
                const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
                mlc_engine = await CreateMLCEngine(localAIModelId, { initProgressCallback });
                setDynamicLoadingMsg("Brainstorming curriculum directly on your GPU... 🧠");
                
                const localSystemPrompt = `You are an expert technical lead. Generate a highly technical and mathematically rigorous course. Output ONLY valid JSON matching exactly this format:
{
  "title": "string",
  "description": "string",
  "modules": [
    {
      "title": "string",
      "outcome": "string",
      "optimal_search_query": "string",
      "topics": [
        {
          "title": "string",
          "youtube_search_query": "string",
          "subtopics": [ { "title": "string" } ]
        }
      ]
    }
  ]
}`;
                const localUserPrompt = `Subject: ${finalValue}\nGoal: ${finalValue}\nExperience: ${experienceLevel}\nTime: ${timeValue} ${timeUnit}\nGenerate the JSON.`;
                
                const mlcResponse = await mlc_engine.chat.completions.create({
                    messages: [
                        { role: "system", content: localSystemPrompt },
                        { role: "user", content: localUserPrompt }
                    ],
                    max_tokens: 8192
                });
                
                let generatedText = mlcResponse.choices[0].message.content || '';
                let cleanedText = generatedText.trim();
                if (cleanedText.startsWith("```json")) cleanedText = cleanedText.replace(/^```json\n?/, "").replace(/```$/, "");
                else if (cleanedText.startsWith("```")) cleanedText = cleanedText.replace(/^```\n?/, "").replace(/```$/, "");
                
                cleanedText = cleanedText.trim();
                const { jsonrepair } = await import('jsonrepair');
                const parsedJSON = JSON.parse(jsonrepair(cleanedText));
                
                setDynamicLoadingMsg("Saving and enriching with YouTube videos... 🚀");
                
                const saveResponse = await api.post("/roadmaps/save-external", {
                    roadmap_plan: parsedJSON,
                    subject: finalValue,
                    goal: finalValue,
                    time_value: timeValue,
                    time_unit: timeUnit,
                    model: localAIModelId,
                    email: user.email
                });
                
                const resultData = saveResponse.data;
                localStorage.setItem('last_generated_roadmap', JSON.stringify({ data: resultData, timestamp: Date.now() }));
                sessionStorage.setItem('roadmap_just_generated', 'true');
                router.push(`/roadmap/${resultData.slug || resultData.id}`);
                return;
            } finally {
                if (mlc_engine) {
                    try { await mlc_engine.unload(); } catch(e) {}
                }
            }
        }

            payload = { ...payload, subject: finalValue, goal: finalValue, experience_level: experienceLevel, model: engine };
            
            // SSE STREAMING LOGIC FOR AI GEN
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/roadmaps/generate`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) throw new Error("Failed to generate course.");
            if (!response.body) throw new Error("No response body.");
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            let resultData = null;
            let buffer = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                
                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) continue;
                    try {
                        const data = JSON.parse(trimmedLine);
                        if (data.error) throw new Error(data.error);
                        if (data.status) setDynamicLoadingMsg(data.status);
                        if (data.result) resultData = data.result;
                    } catch(e: any) {
                        if (e.message && e.message.includes("AI Engine Error")) {
                            throw e;
                        }
                        console.error("Failed to parse chunk", trimmedLine);
                    }
                }
            }
            
            // Check remaining buffer if any
            if (buffer.trim()) {
                try {
                    const data = JSON.parse(buffer.trim());
                    if (data.error) throw new Error(data.error);
                    if (data.status) setDynamicLoadingMsg(data.status);
                    if (data.result) resultData = data.result;
                } catch (e: any) {
                    if (e.message && e.message.includes("AI Engine Error")) throw e;
                    console.error("Failed to parse remaining buffer chunk", buffer);
                }
            }
            
            if (resultData) {
                localStorage.setItem('last_generated_roadmap', JSON.stringify({ data: resultData, timestamp: Date.now() }));
                sessionStorage.setItem('roadmap_just_generated', 'true');
                router.push(`/roadmap/${resultData.slug || resultData.id}`);
            } else {
                throw new Error("No valid result returned from stream.");
            }
            
        } else {
            // STANDARD POST LOGIC FOR OTHER MODES
            if (mode === 'job') {
                endpoint = '/roadmaps/generate-from-jd';
                payload = { ...payload, job_description: finalValue, current_experience: experienceLevel, generation_type: 'full' };
            } else if (mode === 'url') {
                endpoint = '/roadmaps/generate-from-url';
                payload = { ...payload, url: finalValue };
            } else if (mode === 'syllabus') {
                endpoint = '/roadmaps/generate-from-syllabus';
                payload = { ...payload, syllabus_text: finalValue };
            } else if (mode === 'gaps') {
                endpoint = '/roadmaps/generate-from-gaps';
                payload = { ...payload, target_role: finalValue, known_skills: '', weak_skills: '' };
            }

            const response = await api.post(endpoint, payload);
            const data = response.data;
            
            localStorage.setItem('last_generated_roadmap', JSON.stringify({ data, timestamp: Date.now() }));
            sessionStorage.setItem('roadmap_just_generated', 'true');
            router.push(`/roadmap/${data.slug || data.id}`);
        }
    } catch (err: any) {
        console.error("Generation error:", err);
        if (err.response?.status === 401) {
            setShowLoginPrompt(true);
        } else if (err.response?.status === 402) {
            setIsPaymentModalOpen(true);
        } else {
            alert(err.message || "Failed to generate course. Please try again.");
        }
        setIsGenerating(false);
    }

  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (step === 1) handleNextStep();
      else if (!isGenerating && !showLoginPrompt) submitGeneration();
    }
  };

  if (isGenerating) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl mx-auto mt-4 p-8 rounded-lg bg-sidebar/40 border border-border flex flex-col items-center justify-center space-y-4"
      >
        <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
        </div>
        <div className="text-center min-h-[60px] relative flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.h3 
                key={loadingMsgIdx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-text-heading font-bold text-[14px] mb-1.5"
              >
                {dynamicLoadingMsg || LOADING_MESSAGES[loadingMsgIdx]}
              </motion.h3>
            </AnimatePresence>
            <p className="text-text-muted text-[12px] opacity-70">
              Go grab a coffee, this might take a few minutes ☕
            </p>
        </div>
      </motion.div>
    );
  }

  if (showLoginPrompt) {
    return (
      <motion.div className="w-full max-w-xl mx-auto mt-4 p-6 rounded-lg bg-sidebar/40 border border-border flex flex-col items-center justify-center space-y-4 shadow-sm">
        <div className="text-center mb-2">
            <h3 className="text-text-heading font-bold text-[15px]">Save your progress</h3>
            <p className="text-text-muted text-[12.5px] mt-1">Sign in to generate and track your custom course.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })} className="flex-1 h-11 bg-white text-black border border-border rounded-lg font-bold text-[12px] hover:bg-gray-100 flex items-center justify-center gap-2">
                Google
            </button>
            <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: window.location.origin } })} className="flex-1 h-11 bg-sidebar text-text-primary border border-border rounded-lg font-bold text-[12px] hover:bg-callout-bg flex items-center justify-center gap-2">
                <Github className="w-4 h-4" /> GitHub
            </button>
        </div>
        <button onClick={() => setShowLoginPrompt(false)} className="text-[11px] text-text-muted font-bold uppercase mt-2">Cancel</button>
      </motion.div>
    );
  }

  const activeMode = MODES.find(m => m.id === mode)!;
  const activeEngine = ENGINES.find(e => e.id === engine)!;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="w-full max-w-xl mx-auto relative"
    >
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-14 left-0 right-0 flex justify-center z-20 pointer-events-none"
          >
            <div className="bg-background border border-border text-text-heading px-5 py-2.5 rounded-full text-[13px] font-medium shadow-md">
              {toastMsg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`relative rounded-lg transition-all duration-300 border ${isFocused ? 'border-accent shadow-[0_0_15px_-5px_rgba(15,118,110,0.2)]' : 'border-border'}`}>
        <div className="bg-background rounded-[5px] p-4 flex flex-col gap-3">
          
          

          {step === 1 ? (
            <>
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => { setIsFocused(false); setShowModeMenu(false); setShowEngineMenu(false); }}
                onKeyDown={handleKeyDown}
                placeholder={activeMode.placeholder}
                rows={mode === 'job' || mode === 'syllabus' ? 4 : 2}
                className="w-full bg-transparent text-text-primary text-[14px] font-medium placeholder:text-text-muted/50 resize-none outline-none leading-relaxed"
              />
              
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30 relative">
                <div className="flex items-center gap-2">
                  {/* Mode Selector */}
                  <div className="relative">
                    <button 
                      onClick={() => { setShowModeMenu(!showModeMenu); setShowEngineMenu(false); }} 
                      className="flex items-center justify-center w-8 h-8 rounded-md bg-sidebar/50 border border-border text-text-heading hover:text-accent hover:border-accent/50 transition-colors"
                      title={activeMode.label}
                    >
                      <activeMode.icon className="w-4 h-4" />
                    </button>
                    {showModeMenu && (
                      <div className="absolute bottom-full left-0 mb-2 w-40 bg-background border border-border rounded-md shadow-xl z-50 overflow-hidden">
                        {MODES.map(m => (
                          <button key={m.id} onClick={() => { setMode(m.id); setShowModeMenu(false); }} className={`w-full text-left px-3 py-2 text-[12px] font-bold flex items-center gap-2 hover:bg-sidebar ${mode === m.id ? 'text-accent bg-sidebar/50' : 'text-text-muted'}`}>
                            <m.icon className="w-3.5 h-3.5" /> {m.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Engine Selector */}
                  <div className="relative">
                    <button 
                      onClick={() => { setShowEngineMenu(!showEngineMenu); setShowModeMenu(false); }} 
                      className="flex items-center justify-center w-8 h-8 rounded-md bg-sidebar/30 border border-border text-text-muted hover:text-text-heading hover:border-text-heading/30 transition-colors"
                      title={activeEngine.label}
                    >
                      <span className="text-[16px]">🤖</span>
                    </button>
                    {showEngineMenu && (
                      <div className="absolute bottom-full left-0 mb-2 w-36 bg-background border border-border rounded-md shadow-xl z-50 overflow-hidden">
                        {ENGINES.map(e => (
                          <button key={e.id} onClick={() => {
                            if (e.id === 'local') {
                                setIsLocalAIModalOpen(true);
                            } else {
                                setEngine(e.id);
                            }
                            setShowEngineMenu(false);
                        }} className={`w-full text-left px-3 py-2 text-[11px] font-bold flex items-center gap-2 hover:bg-sidebar ${engine === e.id ? 'text-accent' : 'text-text-muted'}`}>
                            <e.icon className="w-3 h-3" /> {e.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleNextStep}
                  disabled={!value.trim()}
                  className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2 rounded-md text-[13px] font-bold transition-all hover:bg-teal-700 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </>
          ) : (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border/30 pb-2">
                  <button onClick={() => setStep(1)} className="text-[11px] font-bold text-text-muted hover:text-text-heading">← Back</button>
                  <span className="text-[12px] font-bold text-text-heading">Configuration</span>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-text-muted uppercase">Duration</label>
                    <div className="flex items-center bg-sidebar/60 rounded-md p-1 border border-border h-[34px]">
                      {[
                        { v: 1, u: 'weeks', l: '1 Wk' },
                        { v: 2, u: 'weeks', l: '2 Wks' },
                        { v: 4, u: 'weeks', l: '4 Wks' },
                        { v: 6, u: 'weeks', l: '6 Wks' },
                        { v: 12, u: 'weeks', l: '12 Wks' }
                      ].map((opt) => (
                        <button
                          key={opt.l}
                          type="button"
                          onClick={() => { setTimeValue(opt.v); setTimeUnit(opt.u); }}
                          className={`flex-1 flex items-center justify-center h-full rounded text-[12px] font-bold transition-all ${timeValue === opt.v && timeUnit === opt.u ? 'bg-background shadow-sm text-accent border border-border/50' : 'text-text-muted hover:text-text-heading border border-transparent'}`}
                        >
                          {opt.l}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {['ai', 'job'].includes(mode) && (
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-text-muted uppercase">Experience</label>
                      <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)} className="w-full bg-sidebar/60 border border-border rounded-md px-2 py-1 text-[12px] font-bold outline-none h-[34px] text-text-heading">
                        <option value="novice">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-2 pt-2 border-t border-border/30">
                  <button
                    onClick={() => submitGeneration()}
                    className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2 rounded-md text-[13px] font-bold transition-all hover:bg-teal-700 active:scale-[0.97]"
                  >
                    Create My Course
                    <Wand2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {engine === 'local' && localAIModelId && (
            <div className="mt-1 pt-3 border-t border-border/30 flex items-center justify-between">
              <span className="text-[11px] font-bold text-accent uppercase tracking-widest flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5" /> WebGPU Active: {localAIModelName || localAIModelId}
              </span>
              <button onClick={() => setIsLocalAIModalOpen(true)} className="text-[10px] font-bold text-text-muted hover:text-text-heading transition-colors">
                CHANGE
              </button>
            </div>
          )}

          {engine === 'openrouter' && (
            <div className="mt-1 pt-3 border-t border-border/30 flex items-center justify-between">
              <span className="text-[11px] font-bold text-accent uppercase tracking-widest flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> OpenRouter: {openRouterModel}
              </span>
              <span className="text-[10px] font-bold text-text-muted">
                (Change in Settings)
              </span>
            </div>
          )}
        </div>
      </div>
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} onSuccess={() => setIsPaymentModalOpen(false)} />

      <LocalAIModal
        isOpen={isLocalAIModalOpen}
        onClose={() => setIsLocalAIModalOpen(false)}
        onSelectModel={(modelId, modelName) => {
          localStorage.setItem('localAIModelId', modelId);
          localStorage.setItem('localAIModelName', modelName);
          setLocalAIModelId(modelId);
          setLocalAIModelName(modelName);
          setEngine('local');
          setIsLocalAIModalOpen(false);
        }}
      />
    </motion.div>
  );
}
