import React from 'react';

const CREATORS = [
    { name: "3Blue1Brown", handle: "3Blue1Brown" },
    { name: "StatQuest", handle: "StatQuestwithJoshStarmer" },
    { name: "LearnChemE", handle: "LearnChemE" },
    { name: "Web Dev Simplified", handle: "WebDevSimplified" },
    { name: "Neso Academy", handle: "NesoAcademy" },
    { name: "Computerphile", handle: "Computerphile" },
    { name: "TechWorld with Nana", handle: "TechWorldwithNana" },
    { name: "MIT OpenCourseWare", handle: "MITOpenCourseWare" },
    { name: "Ninja Nerd", handle: "NinjaNerd" },
    { name: "Professor Dave Explains", handle: "ProfessorDaveExplains" },
    { name: "DeepLearningAI", handle: "DeepLearningAI" },
    { name: "ByteByteGo", handle: "ByteByteGo" },
    { name: "Steve Brunton", handle: "SteveBrunton" },
    { name: "The Organic Chemistry Tutor", handle: "TheOrganicChemistryTutor" },
    { name: "Hussein Nasser", handle: "HusseinNasser" },
    { name: "NPTEL", handle: "nptelhrd" },
    { name: "Abdul Bari", handle: "AbdulBari" },
    { name: "Bozeman Science", handle: "BozemanScience" },
    { name: "TMP Chem", handle: "TMPChem" },
    { name: "Shomu's Biology", handle: "ShomusBiology" },
    { name: "Traversy Media", handle: "TraversyMedia" }
];

export function CreatorsTicker() {
  const renderAvatars = () => (
    <>
      {CREATORS.map((creator, idx) => (
        <div key={idx} className="flex flex-nowrap shrink-0 items-center gap-2 md:gap-3 bg-sidebar/50 border border-border/50 px-3 py-1.5 rounded-full hover:bg-sidebar transition-colors cursor-default">
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

  return (
    <div className="w-full text-center overflow-hidden border-t border-border/30 pt-6 mt-6">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted/60 mb-5 block">
        Videos from your favourite educational creators
      </span>
      
      <div className="relative flex flex-nowrap overflow-hidden w-full max-w-full [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex flex-nowrap animate-infinite-scroll-reverse items-center gap-x-4 md:gap-x-6 w-max shrink-0 pr-4 md:pr-6 opacity-[0.8] hover:[animation-play-state:paused]">
          {renderAvatars()}
        </div>
        <div aria-hidden="true" className="flex flex-nowrap animate-infinite-scroll-reverse items-center gap-x-4 md:gap-x-6 w-max shrink-0 pr-4 md:pr-6 opacity-[0.8] hover:[animation-play-state:paused]">
          {renderAvatars()}
        </div>
      </div>
    </div>
  );
}
