'use client';

import React from 'react';

const SOURCES = [
  { name: 'arXiv', class: 'font-serif text-[20px] md:text-[24px] font-medium tracking-tight' },
  { name: 'NATURE', class: 'font-serif text-[16px] md:text-[18px] uppercase tracking-widest' },
  { name: 'IEEE', class: 'font-sans text-[20px] md:text-[22px] font-black tracking-tighter' },
  { name: 'Stanford Online', class: 'font-serif text-[17px] md:text-[20px] font-medium tracking-tight' },
  { name: 'MIT OpenCourseWare', class: 'font-sans text-[16px] md:text-[18px] font-semibold tracking-tight' },
  { name: 'PubMed', class: 'font-sans text-[18px] md:text-[21px] font-bold tracking-tight' },
  { name: 'ACM Digital Library', class: 'font-sans text-[16px] md:text-[19px] font-black tracking-tighter uppercase' },
  { name: 'GitHub', class: 'font-sans text-[18px] md:text-[21px] font-bold tracking-tight' },
  { name: 'Stack Overflow', class: 'font-sans text-[17px] md:text-[19px] font-bold tracking-tight' },
  { name: 'Wikipedia', class: 'font-serif text-[19px] md:text-[22px] font-normal tracking-tight' },
];

const CREATORS = [
  { name: "3Blue1Brown", handle: "3Blue1Brown" },
  { name: "Andrej Karpathy", handle: "AndrejKarpathy" },
  { name: "StatQuest", handle: "StatQuestwithJoshStarmer" },
  { name: "NeetCode", handle: "NeetCode" },
  { name: "MIT OpenCourseWare", handle: "MITOpenCourseWare" },
  { name: "Abdul Bari", handle: "AbdulBari" },
  { name: "The Organic Chemistry Tutor", handle: "TheOrganicChemistryTutor" },
  { name: "Professor Leonard", handle: "ProfessorLeonard" },
  { name: "Neso Academy", handle: "NesoAcademy" },
  { name: "Gate Smashers", handle: "GateSmashers" },
  { name: "codebasics", handle: "codebasics" },
  { name: "CS50", handle: "CS50" },
  { name: "Computerphile", handle: "Computerphile" },
  { name: "ByteByteGo", handle: "ByteByteGo" },
  { name: "Steve Brunton", handle: "SteveBrunton" },
  { name: "Traversy Media", handle: "TraversyMedia" },
];

const renderSources = () => (
  <>
    {SOURCES.map((source, idx) => (
      <div key={idx} className={`text-text-primary hover:opacity-100 transition-opacity duration-300 cursor-default whitespace-nowrap ${source.class}`}>
        {source.name}
      </div>
    ))}
  </>
);

const renderCreators = () => (
  <>
    {CREATORS.map((creator, idx) => (
      <div key={idx} className="flex flex-nowrap shrink-0 items-center gap-2 bg-sidebar/50 border border-border/50 px-3 py-1.5 rounded-full hover:bg-sidebar transition-colors cursor-default">
        <img
          src={`/creators/${creator.handle}.jpg`}
          alt={creator.name}
          className="w-5 h-5 md:w-6 md:h-6 shrink-0 rounded-full object-cover bg-background border border-border"
          loading="lazy"
          onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${creator.name}&background=random`; }}
        />
        <span className="font-sans text-[12px] md:text-[13px] font-semibold tracking-tight whitespace-nowrap text-text-primary">
          {creator.name}
        </span>
      </div>
    ))}
  </>
);

export default function CurvedFlowShowcase() {
  return (
    <div className="w-full text-center overflow-hidden border-t border-border/30 pt-6">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted/60 mb-5 block">
        Curriculum sourced from
      </span>

      {/* Sources Marquee (Typographic logos) */}
      <div className="relative flex flex-nowrap overflow-hidden w-full max-w-full [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex flex-nowrap animate-infinite-scroll items-center gap-x-12 md:gap-x-24 w-max shrink-0 pr-12 md:pr-24 opacity-[0.55] grayscale hover:[animation-play-state:paused]">
          {renderSources()}
        </div>
        <div aria-hidden="true" className="flex flex-nowrap animate-infinite-scroll items-center gap-x-12 md:gap-x-24 w-max shrink-0 pr-12 md:pr-24 opacity-[0.55] grayscale hover:[animation-play-state:paused]">
          {renderSources()}
        </div>
      </div>

      {/* Creators Marquee (Avatar pills + Goldfish badge) */}
      <div className="border-t border-border/30 pt-6 mt-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted/60 mb-5 block">
          Videos from your favourite educational creators
        </span>

        <div className="relative flex flex-nowrap overflow-hidden w-full max-w-full [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex flex-nowrap animate-infinite-scroll-reverse items-center gap-x-4 md:gap-x-6 w-max shrink-0 pr-4 md:pr-6 opacity-[0.8] hover:[animation-play-state:paused]">
            {renderCreators()}
          </div>
          <div aria-hidden="true" className="flex flex-nowrap animate-infinite-scroll-reverse items-center gap-x-4 md:gap-x-6 w-max shrink-0 pr-4 md:pr-6 opacity-[0.8] hover:[animation-play-state:paused]">
            {renderCreators()}
          </div>
        </div>
      </div>
    </div>
  );
}
