"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoadmapData } from '@/lib/api';
import JobDecodedGenerator from '@/components/job-decoded/JobDecodedGenerator';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import { Target, Zap, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import EulerLogoCanvas from '@/components/EulerLogoCanvas';
import { FAQAccordion } from '@/app/HomeClientComponents';

export default function JobDecodedPageClient() {
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
    <div className="min-h-screen flex flex-col bg-background manrope-body selection:bg-teal-500/30">
      <PublicHeader />

      {isRedirecting && (
        <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-3xl flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-4">
              <p className="inconsolata-ui text-[14px] font-bold text-text-heading tracking-[0.2em] uppercase">
                Finalizing Your Roadmap
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
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0 bg-background relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-teal-600/10 rounded-full blur-[120px] -z-10" />
        
        {/* Hero Section */}
        <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <div className="p-3 bg-teal-600/10 rounded-2xl border border-teal-600/20 shadow-[0_0_30px_rgba(15,118,110,0.3)] flex items-center justify-center">
                <EulerLogoCanvas size={48} color1={0x0f766e} color2={0x2dd4bf} wireframe={false} />
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-inter text-4xl md:text-6xl font-bold text-text-heading tracking-tight leading-[1.1] mb-6"
            >
              Reverse Engineer <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400">Your Dream Job</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-text-muted text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed mb-10"
            >
              Paste any job description and let AI extract the exact technical skills required. We build a personalized, week-by-week curriculum to bridge your knowledge gaps.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 text-[13px] font-bold text-text-heading"
            >
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-500" /> Extracts Hard Skills</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-500" /> Maps to Your Experience</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-500" /> Actionable Weekly Plan</div>
            </motion.div>
          </div>
        </section>

        {/* Interactive Generator Section */}
        <section className="py-12 px-6 relative z-10 border-t border-border/30 bg-sidebar/20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_minmax(auto,42rem)_1fr] gap-12">
            <div className="hidden lg:block order-1"></div>
            
            <div className="order-2 w-full mx-auto relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-600/20 to-emerald-600/20 rounded-[2rem] blur-xl opacity-50"></div>
              <JobDecodedGenerator onRoadmapGenerated={handleRoadmapGenerated} />
            </div>

            <div className="order-3 hidden lg:flex flex-col gap-6 mt-8">
              <div className="bg-background border border-border p-6 rounded-2xl shadow-sm hover:border-accent/40 transition-colors">
                <Target className="w-6 h-6 text-accent mb-4" />
                <h3 className="text-[14px] font-bold text-text-heading mb-2">How it works</h3>
                <p className="text-[12px] text-text-muted leading-relaxed">
                  Our models read the JD line-by-line, discarding corporate fluff and isolating the exact frameworks, concepts, and languages the employer wants.
                </p>
              </div>
              <div className="bg-background border border-border p-6 rounded-2xl shadow-sm hover:border-accent/40 transition-colors">
                <Zap className="w-6 h-6 text-accent mb-4" />
                <h3 className="text-[14px] font-bold text-text-heading mb-2">Technical Rigor</h3>
                <p className="text-[12px] text-text-muted leading-relaxed">
                  The generated roadmap includes practical, code-heavy modules with proof-of-work assignments to actually build out your portfolio.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24 px-6 bg-background border-t border-border/30 relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="inconsolata-ui text-[11px] font-bold text-teal-600 tracking-[0.2em] uppercase mb-12 md:mb-16 manrope-body text-center">Frequently Asked Questions</h2>
            <FAQAccordion 
              items={[
                {
                  question: "What is Job Decoded?",
                  answer: "Job Decoded allows you to paste any job description text to instantly generate a targeted roadmap tailored exactly to those specific requirements, helping you focus only on the skills that matter for that role."
                },
                {
                  question: "Does it guarantee a job?",
                  answer: "While it teaches you the exact technical skills requested by the employer, your project portfolio, interview execution, and soft skills still determine the final outcome. This tool ensures you won't be rejected for lacking the required hard skills."
                },
                {
                  question: "How does the AI know my experience level?",
                  answer: "You provide a brief summary of your current experience (e.g., 'Junior React Dev with 1 year experience'). The AI maps this against the job description to skip what you already know and focus entirely on bridging the gap."
                },
                {
                  question: "How are the resources selected?",
                  answer: "The AI executes real-time web searches to pull in the most up-to-date documentation, tutorials, and articles specific to the tech stack mentioned in the JD."
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
