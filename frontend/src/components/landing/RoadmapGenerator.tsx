"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, RoadmapData } from '../../lib/api';
import { Loader, Route, Target, Zap, AlertCircle, Compass, History, Hourglass, Check, ChevronDown, Search, User, GraduationCap, Briefcase, ArrowRight, LogIn } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import PaymentModal from '../PaymentModal';

interface RoadmapGeneratorProps {
  onRoadmapGenerated: (data: RoadmapData, formData: any) => void;
  isLanding?: boolean;
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

const SUGGESTED_SUBJECTS = [
  "Distributed Systems", "Large Language Models", "Quantum Computing",
  "System Design", "Organic Chemistry", "Neural Network Architectures", 
  "Cybersecurity", "React & Next.js", "Algorithms", "Machine Learning",
  "Macroeconomics", "Cloud Native", "Robotics", "Quantum Mechanics",
  "Pharmacology", "Digital Marketing", "Game Design", "Biochemistry"
];

const RoadmapGenerator: React.FC<RoadmapGeneratorProps> = ({ onRoadmapGenerated, isLanding = false }) => {
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
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  
  const [roleSearchCurrent, setRoleSearchCurrent] = useState('');
  const [isRoleDropdownOpenCurrent, setIsRoleDropdownOpenCurrent] = useState(false);
  
  const [roleSearchTarget, setRoleSearchTarget] = useState('');
  const [isRoleDropdownOpenTarget, setIsRoleDropdownOpenTarget] = useState(false);

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
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateRoadmap = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.subject || !formData.goal) return;

    if (!session) {
      sessionStorage.setItem('pending_roadmap_form', JSON.stringify(formData));
      router.push('/login?message=auth_required_to_generate&next=/generate');
      return;
    }

    if (credits !== null && credits < 1) {
      setIsPaymentModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await api.post('/roadmaps/generate', {
        ...formData,
        time_unit: 'weeks',
        model: profile?.is_pro ? 'models/gemini-2.5-pro' : 'models/gemini-2.5-flash',
      });
      onRoadmapGenerated(response.data, { ...formData, time_unit: 'weeks' });
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login?message=auth_required_to_generate');
      } else if (err.response?.status === 402) {
        sessionStorage.setItem('pending_roadmap_form_after_pay', JSON.stringify(formData));
        setIsPaymentModalOpen(true);
      } else {
        setError(err.message || "Generation error.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredRolesCurrent = ROLES.filter(r => r.toLowerCase().includes(roleSearchCurrent.toLowerCase()));
  const filteredRolesTarget = ROLES.filter(r => r.toLowerCase().includes(roleSearchTarget.toLowerCase()));

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
               <label className="inconsolata-ui flex items-center text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
                 1. Background & Aspiration
               </label>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Current Role */}
                  <div className="relative" ref={currentRoleRef}>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-3.5 h-3.5 text-accent" />
                        <span className="text-[13px] font-bold text-text-heading">Current Role</span>
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
                          className="w-full px-4 py-3 bg-callout-bg border border-border rounded-lg focus:outline-none focus:border-accent transition-all text-[14px] font-medium"
                        />
                        <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-transform ${isRoleDropdownOpenCurrent ? 'rotate-180' : ''}`} />
                        
                        {isRoleDropdownOpenCurrent && (
                          <div className="absolute z-20 w-full mt-1 bg-surface border border-border shadow-2xl max-h-48 overflow-y-auto no-scrollbar rounded-xl">
                            {filteredRolesCurrent.map(r => (
                              <button
                                key={r}
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, current_role: r }));
                                  setRoleSearchCurrent(r);
                                  setIsRoleDropdownOpenCurrent(false);
                                }}
                                className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-sidebar transition-colors flex items-center justify-between bg-surface"
                              >
                                {r}
                                {formData.current_role === r && <Check className="w-3.5 h-3.5 text-accent" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                  </div>

                  {/* Target Role */}
                  <div className="relative" ref={targetRoleRef}>
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-3.5 h-3.5 text-teal-600" />
                        <span className="text-[13px] font-bold text-text-heading">Target Aspiration</span>
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
                          className="w-full px-4 py-3 bg-callout-bg border border-border rounded-lg focus:outline-none focus:border-accent transition-all text-[14px] font-medium"
                        />
                        <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-transform ${isRoleDropdownOpenTarget ? 'rotate-180' : ''}`} />
                        
                        {isRoleDropdownOpenTarget && (
                          <div className="absolute z-20 w-full mt-1 bg-surface border border-border shadow-2xl max-h-48 overflow-y-auto no-scrollbar rounded-xl">
                            {filteredRolesTarget.map(r => (
                              <button
                                key={r}
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, target_role: r }));
                                  setRoleSearchTarget(r);
                                  setIsRoleDropdownOpenTarget(false);
                                }}
                                className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-sidebar transition-colors flex items-center justify-between bg-surface"
                              >
                                {r}
                                {formData.target_role === r && <Check className="w-3.5 h-3.5 text-accent" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                  </div>
               </div>

               {/* Experience Level */}
               <div className="space-y-3 pt-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-accent" />
                    <span className="text-[13px] font-bold text-text-heading">Current Proficiency (in Subject)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {EXPERIENCE_LEVELS.map(level => (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, experience_level: level.id }))}
                        className={`p-3 border text-left transition-all rounded-lg ${
                          formData.experience_level === level.id 
                            ? 'bg-accent/10 border-accent ring-1 ring-accent' 
                            : 'bg-surface border-border hover:border-accent/40 shadow-sm'
                        }`}
                      >
                        <div className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${formData.experience_level === level.id ? 'text-accent' : 'text-text-muted'}`}>
                          {level.label}
                        </div>
                        <div className="text-[10px] text-text-muted leading-tight">
                          {level.desc}
                        </div>
                      </button>
                    ))}
                  </div>
               </div>
            </div>

            <div className="pt-4">
               <button
                onClick={() => setStep(2)}
                className="w-full sm:w-fit px-12 py-3 bg-text-heading text-background text-[11px] font-bold uppercase tracking-[0.2em] hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3 rounded-lg"
               >
                 Define Goal <ArrowRight className="w-3.5 h-3.5" />
               </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
               <label className="inconsolata-ui flex items-center text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
                 2. Domain & Objective
               </label>

               {/* Subject */}
               <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-accent" />
                    <span className="text-[13px] font-bold text-text-heading">What subject do you want to master?</span>
                  </div>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="e.g. Distributed Systems"
                    className="w-full px-4 py-3 bg-callout-bg border border-border rounded-lg focus:outline-none focus:border-accent transition-all text-[15px] font-bold text-text-heading"
                  />
                  
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_SUBJECTS.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, subject: s }))}
                        className={`px-3 py-1.5 border text-[10px] font-bold uppercase tracking-widest transition-all rounded-md ${
                          formData.subject === s 
                            ? 'bg-accent text-white border-accent' 
                            : 'bg-surface text-text-muted border-border hover:border-accent/40 shadow-sm'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
               </div>

               {/* Goal */}
               <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <Route className="w-3.5 h-3.5 text-accent" />
                    <span className="text-[13px] font-bold text-text-heading">Specific End Goal</span>
                  </div>
                  <textarea
                    name="goal"
                    value={formData.goal}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Example: I want to be able to build a scalable real-time chat application using WebSockets and Redis."
                    className="w-full px-4 py-3 bg-callout-bg border border-border rounded-lg focus:outline-none focus:border-accent transition-all text-[14px] font-medium resize-none h-28"
                  />
               </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
               <button
                onClick={() => setStep(1)}
                className="px-8 py-3 bg-background border border-border text-text-muted text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-sidebar transition-all rounded-lg"
               >
                 Back
               </button>
               <button
                onClick={() => setStep(3)}
                className="flex-1 sm:flex-none px-12 py-3 bg-text-heading text-background text-[11px] font-bold uppercase tracking-[0.2em] hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3 rounded-lg"
               >
                 Timeline <ArrowRight className="w-3.5 h-3.5" />
               </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
               <label className="inconsolata-ui flex items-center text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
                 3. Intensity & Context
               </label>

               {/* Target Duration */}
               <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Hourglass className="w-3.5 h-3.5 text-accent" />
                    <span className="text-[13px] font-bold text-text-heading">Target Duration</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(profile?.is_pro ? [2, 3, 4, 6, 8, 10, 12] : [2, 3, 4]).map(w => (
                      <button
                        type="button"
                        key={w}
                        onClick={() => setFormData(prev => ({ ...prev, time_value: w }))}
                        className={`px-5 py-2 border text-[11px] font-bold uppercase tracking-widest transition-all rounded-md
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
                        className="px-4 py-2 text-[10px] font-bold text-accent border border-accent/20 border-dashed hover:bg-accent/5 transition-all rounded-md"
                      >
                        Unlock 6-12 Weeks (Pro)
                      </button>
                    )}
                  </div>
               </div>

               {/* Context */}
               <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <History className="w-3.5 h-3.5 text-accent" />
                    <span className="text-[13px] font-bold text-text-heading">Detailed Context (Optional)</span>
                  </div>
                  <textarea
                    name="prior_experience"
                    value={formData.prior_experience}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="What do you already know? Any specific technologies you prefer or want to avoid?"
                    className="w-full px-4 py-3 bg-callout-bg border border-border rounded-lg focus:outline-none focus:border-accent transition-all text-[14px] font-medium resize-none h-28"
                  />
               </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
               <button
                onClick={() => setStep(2)}
                className="w-full sm:w-fit px-8 py-3 bg-background border border-border text-text-muted text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-sidebar transition-all rounded-lg"
               >
                 Back
               </button>
               {!session ? (
                  <button
                    onClick={generateRoadmap}
                    className="w-full sm:flex-1 group relative inline-flex items-center justify-center px-12 py-3 text-[11px] font-bold uppercase tracking-[0.2em] transition-all bg-accent text-white hover:opacity-90 active:scale-95 shadow-xl shadow-accent/20 gap-3 rounded-lg"
                  >
                    <LogIn className="w-3.5 h-3.5" /> Authenticate to Architect
                  </button>
               ) : (
                  <button
                    onClick={generateRoadmap}
                    disabled={isGenerating || (credits !== null && credits < 1)}
                    className={`w-full sm:flex-1 group relative inline-flex items-center justify-center px-12 py-3 text-[11px] font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-50 rounded-lg ${
                      credits !== null && credits < 1
                      ? 'bg-callout-bg border border-border text-text-muted cursor-not-allowed' 
                      : 'bg-text-heading text-background hover:opacity-90 active:scale-95 shadow-xl'
                    }`}
                  >
                    <div className={`flex items-center justify-center gap-2.5 transition-transform duration-300 ${isGenerating ? 'translate-y-20' : ''}`}>
                      <span className={`text-[13px] ${credits !== null && credits < 1 ? 'grayscale opacity-50' : ''}`}>💎</span>
                      {credits !== null && credits < 1 ? 'Insufficient Credits' : `Architect Roadmap (${credits ?? '...'})`}
                    </div>
                    {isGenerating && (
                      <div className="absolute inset-0 flex items-center justify-center animate-in slide-in-from-bottom-10 duration-300">
                        <Loader className="w-4 h-4 animate-spin" />
                      </div>
                    )}
                  </button>
               )}
            </div>
            {credits !== null && credits < 1 && (
               <div className="mt-4 text-center">
                 <Link href="/pricing" className="text-[11px] font-bold text-accent uppercase tracking-widest hover:underline">
                   Buy more credits →
                 </Link>
               </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="w-full manrope-body">
      <div className="mb-6 flex items-center gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-8 h-8 flex items-center justify-center text-[11px] font-bold border transition-all rounded-md ${
              step === i ? 'bg-accent text-white border-accent' : step > i ? 'bg-sidebar text-text-muted border-border' : 'bg-background text-text-muted border-border'
            }`}>
              {step > i ? <Check className="w-4 h-4" /> : i}
            </div>
            {i < 3 && <div className={`w-8 md:w-16 h-[1px] ${step > i ? 'bg-accent' : 'bg-border'}`} />}
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
        </div>
      )}
      
      {error && (
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
    </div>
  );
};

export default RoadmapGenerator;
