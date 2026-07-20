"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoadmapData } from '@/lib/api';
import GenerateFromLink from '@/components/landing/GenerateFromLink';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import { Code, Search, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import EulerLogoCanvas from '@/components/EulerLogoCanvas';
import { FAQAccordion } from '@/app/HomeClientComponents';

export default function LinkToRoadmapClient() {
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
    <div className="min-h-screen flex flex-col bg-background manrope-body selection:bg-indigo-500/30">
      <PublicHeader />

      {isRedirecting && (
        <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-3xl flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-4">
              <p className="inconsolata-ui text-[14px] font-bold text-text-heading tracking-[0.2em] uppercase">
                Deconstructing Source...
              </p>
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <div 
                    key={i} 
                    className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" 
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -z-10" />
        
        {/* Hero Section */}
        <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <div className="p-3 bg-indigo-600/10 rounded-2xl border border-indigo-600/20 shadow-[0_0_30px_rgba(79,70,229,0.3)] flex items-center justify-center">
                <EulerLogoCanvas size={48} color1={0x4f46e5} color2={0x818cf8} wireframe={false} />
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-inter text-4xl md:text-6xl font-bold text-text-heading tracking-tight leading-[1.1] mb-6"
            >
              Learn Any Tech <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-indigo-400">Directly From The Source</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-text-muted text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed mb-10"
            >
              Paste a link to a GitHub repository, technical blog, documentation, or paper. Our AI engine will read it, deconstruct it, and build a curriculum to teach you exactly how it works.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 text-[13px] font-bold text-text-heading"
            >
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Deconstructs Repos</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Reads Official Docs</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Full Knowledge Paths</div>
            </motion.div>
          </div>
        </section>

        {/* Interactive Generator Section */}
        <section className="py-12 px-6 relative z-10 border-t border-border/30 bg-sidebar/20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_minmax(auto,42rem)_1fr] gap-12">
            <div className="hidden lg:block order-1"></div>
            
            <div className="order-2 w-full mx-auto relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600/20 to-blue-600/20 rounded-[2rem] blur-xl opacity-50"></div>
              <GenerateFromLink onRoadmapGenerated={handleRoadmapGenerated} />
            </div>

            <div className="order-3 hidden lg:flex flex-col gap-6 mt-8">
              <div className="bg-background border border-border p-6 rounded-2xl shadow-sm hover:border-indigo-500/40 transition-colors">
                <Code className="w-6 h-6 text-indigo-500 mb-4" />
                <h3 className="text-[14px] font-bold text-text-heading mb-2">GitHub First</h3>
                <p className="text-[12px] text-text-muted leading-relaxed">
                  Provide a repo link, and the AI will analyze the tech stack, architectures, and concepts needed to actually build that exact project.
                </p>
              </div>
              <div className="bg-background border border-border p-6 rounded-2xl shadow-sm hover:border-indigo-500/40 transition-colors">
                <Search className="w-6 h-6 text-indigo-500 mb-4" />
                <h3 className="text-[14px] font-bold text-text-heading mb-2">Real-Time Scraping</h3>
                <p className="text-[12px] text-text-muted leading-relaxed">
                  We use advanced web scraping to pull the text content from the URL securely and analyze it using large context window models.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24 px-6 bg-background border-t border-border/30 relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="inconsolata-ui text-[11px] font-bold text-indigo-500 tracking-[0.2em] uppercase mb-12 md:mb-16 manrope-body text-center">Frequently Asked Questions</h2>
            <FAQAccordion 
              items={[
                {
                  question: "What links work best?",
                  answer: "GitHub repositories, technical articles, arXiv papers, and public software documentation work best. The more technically dense the source, the better the resulting curriculum."
                },
                {
                  question: "Can it bypass paywalls?",
                  answer: "No, the AI can only access and deconstruct content that is publicly available on the open web."
                },
                {
                  question: "How does it handle large repositories?",
                  answer: "The AI scrapes the README, documentation files, and directory structure to understand the core architecture and tech stack, then builds a course teaching you those foundational concepts."
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
