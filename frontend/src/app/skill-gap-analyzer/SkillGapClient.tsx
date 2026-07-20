"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoadmapData } from '@/lib/api';
import KnowledgeGapQuiz from '@/components/landing/KnowledgeGapQuiz';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import { BrainCircuit, Activity, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import EulerLogoCanvas from '@/components/EulerLogoCanvas';
import { FAQAccordion } from '@/app/HomeClientComponents';

export default function SkillGapClient() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleRoadmapGenerated = (data: RoadmapData, formData: any) => {
    const timestamp = Date.now();
    localStorage.setItem('last_generated_roadmap', JSON.stringify({ data, timestamp }));
    localStorage.setItem('last_generated_form_data', JSON.stringify({ data: formData, timestamp }));
    sessionStorage.setItem('roadmap_just_generated', 'true');
    
    if ((data as any).slug || data.id) {
      setIsRedirecting(true);
      router.push(`/roadmap/${(data as any).slug || data.id}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background manrope-body selection:bg-rose-500/30">
      <PublicHeader />

      {isRedirecting && (
        <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-3xl flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-4">
              <p className="inconsolata-ui text-[14px] font-bold text-text-heading tracking-[0.2em] uppercase">
                Analyzing Gaps...
              </p>
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <div 
                    key={i} 
                    className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce" 
                    style={{ animationDelay: `${i * 0.2}s` }} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0 bg-background relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-rose-600/10 rounded-full blur-[120px] -z-10" />
        
        {/* Hero Section */}
        <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <div className="p-3 bg-rose-600/10 rounded-2xl border border-rose-600/20 shadow-[0_0_30px_rgba(225,29,72,0.3)] flex items-center justify-center">
                <EulerLogoCanvas size={48} color1={0xe11d48} color2={0xfb7185} wireframe={false} />
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-inter text-4xl md:text-6xl font-bold text-text-heading tracking-tight leading-[1.1] mb-6"
            >
              Find Your <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-rose-400">Knowledge Gaps</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-text-muted text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed mb-10"
            >
              Take a targeted diagnostic quiz. Based on what you get wrong, we'll build a custom course strictly focused on fixing your weak spots and accelerating your mastery.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 text-[13px] font-bold text-text-heading"
            >
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rose-500" /> Dynamic Quiz Generation</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rose-500" /> Precision Targeting</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rose-500" /> Skips What You Know</div>
            </motion.div>
          </div>
        </section>

        {/* Interactive Generator Section */}
        <section className="py-12 px-6 relative z-10 border-t border-border/30 bg-sidebar/20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_minmax(auto,42rem)_1fr] gap-12">
            <div className="hidden lg:block order-1"></div>
            
            <div className="order-2 w-full mx-auto relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-rose-600/20 to-pink-600/20 rounded-[2rem] blur-xl opacity-50"></div>
              <KnowledgeGapQuiz onRoadmapGenerated={handleRoadmapGenerated} />
            </div>

            <div className="order-3 hidden lg:flex flex-col gap-6 mt-8">
              <div className="bg-background border border-border p-6 rounded-2xl shadow-sm hover:border-rose-500/40 transition-colors">
                <BrainCircuit className="w-6 h-6 text-rose-500 mb-4" />
                <h3 className="text-[14px] font-bold text-text-heading mb-2">Adaptive Questions</h3>
                <p className="text-[12px] text-text-muted leading-relaxed">
                  The AI generates complex, scenario-based questions to deeply probe your understanding of a given topic.
                </p>
              </div>
              <div className="bg-background border border-border p-6 rounded-2xl shadow-sm hover:border-rose-500/40 transition-colors">
                <Activity className="w-6 h-6 text-rose-500 mb-4" />
                <h3 className="text-[14px] font-bold text-text-heading mb-2">Efficient Learning</h3>
                <p className="text-[12px] text-text-muted leading-relaxed">
                  Stop wasting time re-learning what you already know. The resulting roadmap is laser-focused on your blind spots.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24 px-6 bg-background border-t border-border/30 relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="inconsolata-ui text-[11px] font-bold text-rose-500 tracking-[0.2em] uppercase mb-12 md:mb-16 manrope-body text-center">Frequently Asked Questions</h2>
            <FAQAccordion 
              items={[
                {
                  question: "How many questions are in the quiz?",
                  answer: "Typically 5-10 multiple choice questions. They are dynamically generated based on your target role and stated experience level."
                },
                {
                  question: "What if I get everything right?",
                  answer: "If you demonstrate mastery across the board, the AI will generate an advanced roadmap designed to push your skills even further beyond your current baseline."
                },
                {
                  question: "Why take a quiz first?",
                  answer: "Diagnostic auditing prevents you from wasting time re-learning concepts you already know. It ensures the resulting curriculum is 100% focused on your actual blind spots."
                }
              ]}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
