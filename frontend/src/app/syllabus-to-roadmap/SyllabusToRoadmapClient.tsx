"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoadmapData } from '@/lib/api';
import GenerateFromSyllabus from '@/components/landing/GenerateFromSyllabus';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import { RefreshCw, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import EulerLogoCanvas from '@/components/EulerLogoCanvas';
import { FAQAccordion } from '@/app/HomeClientComponents';

export default function SyllabusToRoadmapClient() {
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
    <div className="min-h-screen flex flex-col bg-background manrope-body selection:bg-amber-500/30">
      <PublicHeader />

      {isRedirecting && (
        <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-3xl flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-4">
              <p className="inconsolata-ui text-[14px] font-bold text-text-heading tracking-[0.2em] uppercase">
                Parsing Syllabus...
              </p>
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <div 
                    key={i} 
                    className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" 
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-amber-600/10 rounded-full blur-[120px] -z-10" />
        
        {/* Hero Section */}
        <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <div className="p-3 bg-amber-600/10 rounded-2xl border border-amber-600/20 shadow-[0_0_30px_rgba(217,119,6,0.3)] flex items-center justify-center">
                <EulerLogoCanvas size={48} color1={0xc2410c} color2={0xf97316} wireframe={false} />
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-inter text-4xl md:text-6xl font-bold text-text-heading tracking-tight leading-[1.1] mb-6"
            >
              Turn Static Syllabi Into <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-400">Interactive Courses</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-text-muted text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed mb-10"
            >
              Got a list of topics from a college class or textbook? Paste it here. We'll automatically break it down, find the best resources, and build an interactive course.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 text-[13px] font-bold text-text-heading"
            >
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> Parses Any Format</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> Auto-Finds Resources</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> Generates Proof of Work</div>
            </motion.div>
          </div>
        </section>

        {/* Interactive Generator Section */}
        <section className="py-12 px-6 relative z-10 border-t border-border/30 bg-sidebar/20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_minmax(auto,42rem)_1fr] gap-12">
            <div className="hidden lg:block order-1"></div>
            
            <div className="order-2 w-full mx-auto relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-600/20 to-orange-600/20 rounded-[2rem] blur-xl opacity-50"></div>
              <GenerateFromSyllabus onRoadmapGenerated={handleRoadmapGenerated} />
            </div>

            <div className="order-3 hidden lg:flex flex-col gap-6 mt-8">
              <div className="bg-background border border-border p-6 rounded-2xl shadow-sm hover:border-amber-500/40 transition-colors">
                <FileText className="w-6 h-6 text-amber-500 mb-4" />
                <h3 className="text-[14px] font-bold text-text-heading mb-2">Smart Parsing</h3>
                <p className="text-[12px] text-text-muted leading-relaxed">
                  Just paste plain text. Our AI will figure out the hierarchical structure of chapters, modules, and topics automatically.
                </p>
              </div>
              <div className="bg-background border border-border p-6 rounded-2xl shadow-sm hover:border-amber-500/40 transition-colors">
                <RefreshCw className="w-6 h-6 text-amber-500 mb-4" />
                <h3 className="text-[14px] font-bold text-text-heading mb-2">Dynamic Expansion</h3>
                <p className="text-[12px] text-text-muted leading-relaxed">
                  We don't just copy your text. The AI expands each topic into actionable study items with attached practical assignments.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24 px-6 bg-background border-t border-border/30 relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="inconsolata-ui text-[11px] font-bold text-amber-500 tracking-[0.2em] uppercase mb-12 md:mb-16 manrope-body text-center">Frequently Asked Questions</h2>
            <FAQAccordion 
              items={[
                {
                  question: "How do I format the syllabus?",
                  answer: "Plain text with clear line breaks works best. Don't worry about perfect formatting—our AI is trained to understand most academic structures, outlines, and tables of contents automatically."
                },
                {
                  question: "Will it change the course length?",
                  answer: "The roadmap will be adapted to fit your requested time value (e.g., 4 weeks) while ensuring all the original subjects from the syllabus are covered comprehensively."
                },
                {
                  question: "Does it just copy the syllabus text?",
                  answer: "No. It uses your syllabus as an outline, but it actively expands each topic into an interactive module with dynamically searched resources and practical proof-of-work assignments."
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
