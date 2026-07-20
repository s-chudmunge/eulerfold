"use client";

import React from 'react';
import { Sparkles, Briefcase, Link2, BookOpen, Target, FileSearch, Calendar, Zap, ArrowRight, Microscope } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  icon: React.ElementType;
  href: string;
}

const products: Product[] = [
  {
    id: 'architect', 
    title: "AI Architect",
    description: "Build custom, technical courses from any topic.",
    longDescription: "Enter any subject and get a complete curriculum with modules, theory, videos, and assessments. All references are verified with live web searches.",
    icon: Sparkles, 
    href: "/generate"
  },
  {
    id: 'job', 
    title: "Job Decoded",
    description: "Reverse engineer any job posting into a course.",
    longDescription: "Paste a job description from LinkedIn or Indeed. Our AI extracts every required skill and builds a targeted curriculum so you learn exactly what employers need.",
    icon: Briefcase, 
    href: "/generate?mode=job"
  },
  {
    id: 'url', 
    title: "Deconstruct URL",
    description: "Turn any GitHub repo or docs link into a curriculum.",
    longDescription: "Paste a link to a GitHub repository, technical blog, or documentation page. The AI deconstructs the content and builds a course leading to mastery of that topic.",
    icon: Link2, 
    href: "/generate?mode=url"
  },
  {
    id: 'syllabus', 
    title: "Syllabus Parser",
    description: "Convert any course syllabus into an interactive course.",
    longDescription: "Got topics from a college class or textbook? Paste the syllabus and we transform it into an interactive EulerFold course with videos, theory, and assessments.",
    icon: BookOpen, 
    href: "/generate?mode=syllabus"
  },
  {
    id: 'gaps', 
    title: "Skill Gap Analyzer",
    description: "Take a quiz, find your gaps, fix them with a course.",
    longDescription: "Enter your target role and current skills, then take a 5-minute diagnostic quiz. Based on what you get wrong, we build a course focused strictly on filling your knowledge gaps.",
    icon: Target, 
    href: "/generate?mode=gaps"
  },
  {
    id: 'decode', 
    title: "Research Decoded",
    description: "Complex papers broken down into first-principles blueprints.",
    longDescription: "Submit any academic paper and get a technical breakdown. We convert dense research into understandable blueprints with math, diagrams, and practical applications.",
    icon: FileSearch, 
    href: "/research-decoded"
  },
  {
    id: 'lab', 
    title: "Research Lab",
    description: "Your environment for exploring advanced technical papers.",
    longDescription: "Dive into cutting-edge architectures and ideas. The Research Lab provides an interactive space to dissect complex technical documents and experiment with new concepts.",
    icon: Microscope, 
    href: "/research-lab"
  },
  {
    id: 'planner', 
    title: "Study Planner",
    description: "Dynamic daily schedules built from your courses.",
    longDescription: "Create a daily study schedule from your courses. Pick your intensity, set available hours, and get a structured plan with tasks to complete each day.",
    icon: Calendar, 
    href: "/planner"
  },
  {
    id: 'practice', 
    title: "Practice Portal",
    description: "Prove your knowledge with AI-powered assessments.",
    longDescription: "Test what you've learned with AI-generated practice problems, code challenges, and recall exercises. Submit your work and get immediate technical reviews.",
    icon: Zap, 
    href: "/practice"
  },
];

export default function ProductEcosystem() {
  return (
    <section className="py-20 md:py-32 px-6 bg-background relative border-t border-border/30">
      <div className="max-w-7xl mx-auto">
        
        <div className="max-w-4xl mb-16">
          <span className="block text-[12px] md:text-[13px] text-accent font-bold uppercase tracking-[0.2em] mb-4">
            The EulerFold Ecosystem
          </span>
          <h2 className="text-3xl md:text-[42px] font-bold text-text-heading mb-6 tracking-tight leading-[1.15]">
            Everything you need to deconstruct complex topics, build structured courses, and{' '}
            <span className="font-serif italic text-accent opacity-90 text-[36px] md:text-[50px] tracking-normal font-medium">prove your technical mastery.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const Icon = product.icon;
            return (
              <div 
                key={product.id}
                className="flex flex-col p-6 rounded-lg border border-border bg-sidebar/10 hover:bg-sidebar/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-md bg-sidebar border border-border/60 flex items-center justify-center mb-5 shadow-sm">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                
                <h3 className="text-[17px] font-bold text-text-heading mb-2">
                  {product.title}
                </h3>
                
                <p className="text-[14px] font-bold text-text-primary mb-3 leading-snug">
                  {product.description}
                </p>
                
                <p className="text-[13px] text-text-muted leading-relaxed mb-6 flex-1">
                  {product.longDescription}
                </p>
                
                <div className="mt-auto pt-4 border-t border-border/40">
                  <Link 
                    href={product.href}
                    className="inline-flex items-center gap-1.5 text-[13px] font-bold text-accent hover:text-teal-800 transition-colors"
                  >
                    Explore feature <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
