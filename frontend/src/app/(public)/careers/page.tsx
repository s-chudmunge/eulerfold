"use client";

import React, { useState } from 'react';
import { Mail, Briefcase, Users, Code, PenTool, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import CareerForm from '@/components/CareerForm';

const openings = [
  {
    title: "Content Creator Intern",
    icon: PenTool,
    overview: "Create technical content and simple research summaries.",
    responsibilities: [
      "Research technical topics and create study paths.",
      "Write simple summaries of complex research papers.",
      "Ensure all content is technically accurate."
    ],
    requirements: [
      "Interest in AI, Computer Science, or Math.",
      "Good writing skills and use of plain English.",
      "Active on technical social media (optional)."
    ]
  },
  {
    title: "Founding Software Engineer",
    icon: Code,
    overview: "Build core product features and AI workflows.",
    responsibilities: [
      "Work on the Next.js frontend and FastAPI backend.",
      "Build AI workflows using Gemini and other LLMs.",
      "Manage databases on Supabase."
    ],
    requirements: [
      "Experience with TypeScript, Python, and Postgres.",
      "Experience with Next.js and FastAPI.",
      "Able to work independently."
    ]
  }
];

function RoleCard({ role }: { role: typeof openings[0] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`border border-border rounded-lg transition-all ${isOpen ? 'bg-sidebar/20' : 'hover:bg-sidebar/10'}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-md bg-background border border-border flex items-center justify-center text-text-muted shrink-0">
            <role.icon className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-text-heading manrope-body">{role.title}</h3>
            <p className="text-[12px] text-text-muted manrope-body line-clamp-1">{role.overview}</p>
          </div>
        </div>
        <div className="text-text-muted shrink-0">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-2 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
            <div>
              <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">What you will do</h4>
              <ul className="space-y-1.5">
                {role.responsibilities.map((res, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-text-primary manrope-body">
                    <span className="text-accent mt-1">•</span>
                    {res}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">What we look for</h4>
              <ul className="space-y-1.5">
                {role.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-text-primary manrope-body">
                    <span className="text-teal-700 mt-1">•</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <a 
              href="#apply" 
              className="text-[12px] font-bold text-accent flex items-center gap-1 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Apply now <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CareersPage() {
  return (
    <div className="flex-1 bg-background pb-12">
      <div className="max-w-4xl mx-auto px-6 py-8 md:py-16">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-text-heading mb-3 manrope-body">Careers</h1>
          <p className="text-lg text-text-muted manrope-body leading-relaxed max-w-2xl">
            We are a small team of engineers and educators. Help us build tools that make 
            it easier for people to learn technical subjects.
          </p>
        </div>
        
        <div className="space-y-16">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl font-bold text-text-heading mb-3 manrope-body">Our Culture</h2>
              <p className="text-[14.5px] text-text-primary manrope-body leading-relaxed mb-5">
                We value simple, clear code and direct communication. You will have the freedom 
                to solve problems and build features that help thousands of people learn.
              </p>
            </div>
            <div className="bg-sidebar/20 border border-border p-6 rounded-xl">
              <div className="space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-background flex items-center justify-center border border-border">
                    <Users className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-[13.5px] font-bold text-text-heading manrope-body">Small team</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-background flex items-center justify-center border border-border">
                    <Briefcase className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-[13.5px] font-bold text-text-heading manrope-body">Remote work</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-background flex items-center justify-center border border-border">
                    <Code className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-[13.5px] font-bold text-text-heading manrope-body">Modern tech</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] mb-6 border-b border-border pb-3">
              Open Roles
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {openings.map((role, idx) => (
                <RoleCard key={idx} role={role} />
              ))}
            </div>
          </section>

          <section id="apply" className="pt-8 scroll-mt-20">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-text-heading manrope-body">Apply</h2>
                <p className="text-[14px] text-text-muted mt-1.5 manrope-body">Fill out the form below to apply.</p>
              </div>
              <CareerForm />
            </div>
          </section>

          <section className="text-center pt-8">
            <p className="text-text-muted manrope-body mb-4">Other questions?</p>
            <a 
              href="mailto:eulerfold@gmail.com" 
              className="inline-flex items-center gap-2 text-teal-700 font-bold hover:underline"
            >
              <Mail className="w-4 h-4" /> Email us <ArrowRight className="w-3 h-3" />
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
