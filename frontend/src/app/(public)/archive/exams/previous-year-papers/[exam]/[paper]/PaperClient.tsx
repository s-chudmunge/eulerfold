"use client";

import React, { useState } from 'react';
import { PaperEntry, ExamCategory } from '../../../../generatedArchiveData';
import { Download, Key, Bookmark, Share2, Calendar, Clock, Target, FileText, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { getDriveDownloadUrl } from '@/lib/drive';
import Breadcrumbs from '@/components/Breadcrumbs';
import SocialShare from '@/components/SocialShare';
import { DiscussionSection } from '@/components/discussions/DiscussionSection';
import Footer from '@/components/Footer';
import BrandedSideBanners from '@/components/layout/SideBanners';

const EXAM_LOGOS: Record<string, string> = {
  "IMO": "/assets/logos/IMO.png",
  "IPhO": "/assets/logos/IPhO.png",
  "MAT": "/assets/logos/MAT.png",
  "PAT": "/assets/logos/PAT.png"
};

const EXAM_URLS: Record<string, string> = {
  "AIME": "https://www.maa.org/math-competitions/about-amc",
  "AMC": "https://www.maa.org/math-competitions",
  "AP": "https://apcentral.collegeboard.org/",
  "CSIR_NET": "https://csirnet.nta.nic.in/",
  "ENGAA": "https://www.undergraduate.study.cam.ac.uk/applying/admissions-tests",
  "GATE": "https://gate2024.iisc.ac.in/",
  "IAO": "http://www.isao.it/",
  "IChO": "https://www.icho-official.org/",
  "IMO": "https://www.imo-official.org/",
  "IOI": "https://ioinformatics.org/",
  "IPhO": "https://www.ipho-official.org/",
  "JAM": "https://jam.iitm.ac.in/",
  "JEST": "https://www.jest.org.in/",
  "MAT": "https://www.ox.ac.uk/admissions/undergraduate/applying-to-oxford/guide/admissions-tests/mat",
  "NSAA": "https://www.undergraduate.study.cam.ac.uk/applying/admissions-tests",
  "PAT": "https://www.ox.ac.uk/admissions/undergraduate/applying-to-oxford/guide/admissions-tests/pat",
  "Putnam": "https://www.maa.org/math-competitions/putnam-competition",
  "STEP": "https://www.admissionstesting.org/for-test-takers/step/",
  "TIFR": "https://www.tifr.res.in/~gsadmissions/",
  "UGC_NET": "https://ugcnet.nta.nic.in/",
  "JEE_ADVANCE": "https://jeeadv.ac.in/",
  "NEET": "https://neet.nta.nic.in/",
  "UPSC": "https://www.upsc.gov.in/",
  "CAT": "https://iimcat.ac.in/",
  "NBHM": "https://www.nbhm.dae.gov.in/",
  "INMO": "https://olympiads.hbcse.tifr.res.in/",
  "RMO": "https://olympiads.hbcse.tifr.res.in/",
  "IOQM": "https://olympiads.hbcse.tifr.res.in/",
  "PRMO": "https://olympiads.hbcse.tifr.res.in/"
};

const EXAM_METADATA: Record<string, { duration: string; marks: string }> = {
  "AIME": { duration: "3.0 Hours", marks: "15 Marks" },
  "AMC": { duration: "75 Mins", marks: "150 Marks" },
  "AP": { duration: "2-3 Hours", marks: "5.0 Scale" },
  "CSIR_NET": { duration: "3.0 Hours", marks: "200 Marks" },
  "ENGAA": { duration: "2.0 Hours", marks: "Varies" },
  "GATE": { duration: "3.0 Hours", marks: "100 Marks" },
  "IAO": { duration: "3-4 Hours", marks: "Varies" },
  "IChO": { duration: "5.0 Hours", marks: "Varies" },
  "IMO": { duration: "9.0 Hours", marks: "42 Marks" },
  "IOI": { duration: "10.0 Hours", marks: "600 Marks" },
  "IPhO": { duration: "10.0 Hours", marks: "50 Marks" },
  "JAM": { duration: "3.0 Hours", marks: "100 Marks" },
  "JEST": { duration: "3.0 Hours", marks: "100 Marks" },
  "MAT": { duration: "2.5 Hours", marks: "100 Marks" },
  "NSAA": { duration: "2.0 Hours", marks: "Varies" },
  "PAT": { duration: "2.0 Hours", marks: "100 Marks" },
  "Putnam": { duration: "6.0 Hours", marks: "120 Marks" },
  "STEP": { duration: "3.0 Hours", marks: "120 Marks" },
  "TIFR": { duration: "3.0 Hours", marks: "100 Marks" },
  "UGC_NET": { duration: "3.0 Hours", marks: "300 Marks" },
  "JEE_ADVANCE": { duration: "6.0 Hours", marks: "Varies" },
  "NEET": { duration: "3.3 Hours", marks: "720 Marks" },
  "UPSC": { duration: "2.0 Hours", marks: "200 Marks" },
  "CAT": { duration: "2.0 Hours", marks: "198 Marks" },
  "NBHM": { duration: "3.0 Hours", marks: "Varies" },
  "INMO": { duration: "4.0 Hours", marks: "102 Marks" },
  "RMO": { duration: "3.0 Hours", marks: "100 Marks" },
  "IOQM": { duration: "3.0 Hours", marks: "100 Marks" },
  "PRMO": { duration: "3.0 Hours", marks: "100 Marks" }
};

const TOPICS_PLACEHOLDER: Record<string, string[]> = {
  "GATE": ["Calculus", "Linear Algebra", "Data Structures", "Algorithms", "Operating Systems", "Computer Networks"],
  "JEE_ADVANCE": ["Physics", "Chemistry", "Mathematics", "Mechanics", "Organic Chemistry", "Calculus"],
  "UPSC": ["History", "Geography", "Polity", "Economy", "Ethics", "Current Affairs"],
  "IMO": ["Number Theory", "Algebra", "Combinatorics", "Geometry", "Inequalities"]
};

interface Props {
  exam: ExamCategory;
  paper: PaperEntry;
}

export default function PaperClient({ exam, paper }: Props) {
  const paperName = `${exam.title} ${paper.subject === 'Main Paper' ? 'Paper' : paper.subject} ${paper.year}`;
  const logoUrl = EXAM_LOGOS[exam.title];
  const examUrl = EXAM_URLS[exam.title];
  const metadata = EXAM_METADATA[exam.title] || { duration: "3.0 Hours", marks: "100 Marks" };
  const topics = TOPICS_PLACEHOLDER[exam.title] || ["General Proficiency", "Problem Solving", "Core Concepts"];

  return (
    <div className="bg-background text-text-primary">
      <main className="max-w-[1000px] mx-auto px-6 pt-8 pb-24 relative">
        <BrandedSideBanners />
        <Breadcrumbs 
          items={[
            { label: 'Archive', href: '/archive/exams/previous-year-papers' },
            { label: exam.title, href: `/archive/exams/previous-year-papers/${exam.id.toLowerCase()}` },
            { label: paper.year }
          ]} 
        />
        
        {/* Page Header Area */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {logoUrl && (
                <div className="w-10 h-10 md:w-12 md:h-12 bg-background rounded-xl border border-border overflow-hidden flex items-center justify-center p-1.5 shrink-0 shadow-sm">
                  <img src={logoUrl} alt={exam.title} className="w-full h-full object-contain grayscale-[0.2]" />
                </div>
              )}
              <div>
                <h1 className="text-[20px] md:text-[24px] font-black text-text-heading tracking-tight inconsolata-ui leading-tight">
                  {paperName}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-0.5 mb-3">
                  {examUrl && (
                    <a 
                      href={examUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[10px] md:text-[11px] font-bold text-accent hover:underline underline-offset-4 inconsolata-ui tracking-wide whitespace-nowrap"
                    >
                      Official Main Site <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <SocialShare 
                  title={paperName}
                  text={`Check out this ${paperName} resource on EulerFold:`}
                />
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <button className="p-2 text-text-muted hover:text-text-heading transition-colors border border-border rounded-lg hover:bg-callout-bg" title="Bookmark">
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-callout-bg border border-callout-border rounded-xl p-5">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-text-muted" />
                <span className="inconsolata-ui text-[11px] font-bold text-text-heading uppercase tracking-wide">Edition {paper.year}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-text-muted" />
                <span className="inconsolata-ui text-[11px] font-bold text-text-heading uppercase tracking-wide">{metadata.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-text-muted" />
                <span className="inconsolata-ui text-[11px] font-bold text-text-heading uppercase tracking-wide">{metadata.marks}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Resources Section */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="inconsolata-ui text-[0.7rem] font-bold text-text-muted uppercase tracking-wider">Resources</h2>
            <div className="h-[1px] flex-1 bg-[var(--border)]"></div>
          </div>
          
          <div className="border-t border-border divide-y divide-[var(--border)]">
            {/* Question Paper Row */}
            <div className="group flex items-center justify-between py-3 hover:bg-sidebar/30 transition-colors">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-9 h-9 bg-callout-bg border border-border rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-text-muted" />
                </div>
                <div>
                  <h3 className="inconsolata-ui text-[13px] font-bold text-text-heading">Question Paper</h3>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {paper.questionPaper ? (
                  <a 
                    href={paper.questionPaperDriveId ? getDriveDownloadUrl(paper.questionPaperDriveId) : `/archive/${paper.questionPaper}`} 
                    download={!paper.questionPaperDriveId ? paper.questionPaper : undefined}
                    target={paper.questionPaperDriveId ? "_blank" : undefined}
                    rel={paper.questionPaperDriveId ? "noopener noreferrer" : undefined}
                    className="bg-[var(--text-heading)] text-[var(--bg-main)] px-4 py-1.5 rounded-md text-[10px] font-bold tracking-wide hover:opacity-90 transition-all flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                    {paper.questionPaperDriveId && <span className="text-[8px] opacity-60 ml-0.5 font-black uppercase">Drive</span>}
                  </a>
                ) : (
                  <span className="px-3 py-1 bg-sidebar border border-border rounded-md text-[10px] font-bold text-text-muted italic">Unavailable</span>
                )}
              </div>
            </div>

            {/* Answer Key Row */}
            <div className="group flex items-center justify-between py-3 hover:bg-sidebar/30 transition-colors">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-9 h-9 bg-callout-bg border border-border rounded-lg flex items-center justify-center shrink-0">
                  <Key className="w-4 h-4 text-text-muted" />
                </div>
                <div>
                  <h3 className="inconsolata-ui text-[13px] font-bold text-text-heading">Answer Key & Solutions</h3>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {paper.answerKey ? (
                  <a 
                    href={paper.answerKeyDriveId ? getDriveDownloadUrl(paper.answerKeyDriveId) : `/archive/${paper.answerKey}`} 
                    download={!paper.answerKeyDriveId ? paper.answerKey : undefined}
                    target={paper.answerKeyDriveId ? "_blank" : undefined}
                    rel={paper.answerKeyDriveId ? "noopener noreferrer" : undefined}
                    className="px-4 py-1.5 border border-border text-text-muted hover:text-text-heading hover:bg-callout-bg rounded-md text-[10px] font-bold tracking-wide transition-all flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" /> Solutions
                    {paper.answerKeyDriveId && <span className="text-[8px] opacity-60 ml-0.5 font-black uppercase">Drive</span>}
                  </a>
                ) : (
                  <span className="px-3 py-1 bg-sidebar border border-border rounded-md text-[10px] font-bold text-text-muted italic">Coming Soon</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Topics Section */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="inconsolata-ui text-[0.7rem] font-bold text-text-muted uppercase tracking-wider">Topics Covered</h2>
            <div className="h-[1px] flex-1 bg-[var(--border)]"></div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {topics.map((topic, i) => (
              <span key={i} className="px-3 py-1 rounded-md text-[11px] font-bold tracking-normal transition-all border bg-transparent text-text-muted border-border hover:border-text-muted">
                {topic}
              </span>
            ))}
          </div>
        </section>

        {/* Discussion Section */}
        <DiscussionSection 
          contextId={`${exam.id.toLowerCase()}:${paper.slug}`} 
          contextType="paper" 
          title="Community Insights"
        />

      </main>
      <Footer />
    </div>
  );
}
