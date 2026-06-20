import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

interface ObjectiveSelectionStepProps {
  displayName: string;
  onSuccess: (objective: string, detail?: string) => void;
}

type ObjectiveType = 'exam' | 'interview' | 'topic' | 'skill' | 'project' | 'research' | 'curiosity';

export default function ObjectiveSelectionStep({ displayName, onSuccess }: ObjectiveSelectionStepProps) {
  const [selected, setSelected] = useState<ObjectiveType | null>(null);
  const [detail, setDetail] = useState('');

  const objectives = [
    {
      id: 'exam' as ObjectiveType,
      title: 'Exam Preparation',
      description: 'Preparing for GATE, JEE, UPSC, or professional certifications.',
      placeholder: 'Which exam are you preparing for?'
    },
    {
      id: 'interview' as ObjectiveType,
      title: 'Interview & Career',
      description: 'Focusing on technical interviews or career transitions.',
      placeholder: 'Target role or company (optional)'
    },
    {
      id: 'topic' as ObjectiveType,
      title: 'Conceptual Mastery',
      description: 'Deep-diving into a specific complex topic or academic course.',
      placeholder: 'What topic requires clarity?'
    },
    {
      id: 'skill' as ObjectiveType,
      title: 'Skill Acquisition',
      description: 'Mastering a new framework, language, or tool.',
      placeholder: 'What skill are you looking to master?'
    },
    {
      id: 'project' as ObjectiveType,
      title: 'Project Building',
      description: 'Gaining knowledge to build a specific application or system.',
      placeholder: 'What are you planning to build?'
    },
    {
      id: 'research' as ObjectiveType,
      title: 'Research & Academic',
      description: 'Synthesizing knowledge for papers, thesis, or specialized research.',
      placeholder: 'Area of research focus?'
    },
    {
      id: 'curiosity' as ObjectiveType,
      title: 'Curiosity & Exploration',
      description: 'Broad exploration of core technical concepts.',
      placeholder: 'What has piqued your interest recently?'
    }
  ];

  const handleContinue = () => {
    if (!selected) return;
    const obj = objectives.find(o => o.id === (selected as string));
    onSuccess(obj?.title || (selected as string), detail);
  };

  return (
    <div className="w-full max-w-[600px] mx-auto animate-in fade-in duration-500 py-2">
      {/* Branding - Ultra Compact */}
      <div className="flex justify-center mb-4">
        <div className="flex items-center gap-1.5 opacity-80 scale-75">
          <img src="/apple-touch-icon.png" alt="" className="w-5 h-5" />
          <span className="text-lg font-bold tracking-tight text-text-heading manrope-body">EulerFold</span>
        </div>
      </div>

      <div className="text-center mb-5">
        <h1 className="text-xl md:text-2xl font-bold text-text-heading mb-1.5 tracking-tight manrope-body">
          Define your primary aim
        </h1>
        <p className="text-[12px] text-text-muted leading-relaxed manrope-body font-medium max-w-[360px] mx-auto">
          Welcome, <span className="text-text-primary font-bold">{displayName.split(' ')[0] || 'Explorer'}</span>. 
          Select an objective to calibrate your cycle.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {objectives.map((obj) => (
          <div 
            key={obj.id}
            className={`flex items-center gap-2.5 px-3 py-2 bg-callout-bg border transition-all duration-200 cursor-pointer relative overflow-hidden
              ${selected === obj.id ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/30'}
            `}
            onClick={() => {
              if (selected === obj.id) {
                setSelected(null);
                setDetail('');
              } else {
                setSelected(obj.id);
                setDetail('');
              }
            }}
          >
            <div className={`shrink-0 w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${selected === obj.id ? 'bg-text-heading border-text-heading' : 'border-border'}`}>
              {selected === obj.id && <Check className="w-2.5 h-2.5 text-background stroke-[4px]" />}
            </div>
            <div className="min-w-0">
              <p className={`text-[12px] manrope-body truncate transition-colors ${selected === obj.id ? 'text-text-primary font-bold' : 'text-text-muted font-semibold'}`}>
                {obj.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Input - Appears below grid when selected */}
      <div className="h-14 mt-3">
        {selected && (
          <div className="animate-in slide-in-from-top-1 fade-in duration-300">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block ml-1">
              Additional Context
            </label>
            <input 
              type="text"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder={objectives.find(o => o.id === selected)?.placeholder}
              className="w-full px-4 py-2 bg-sidebar/50 border border-accent/30 rounded-lg text-[13px] text-text-primary outline-none focus:border-accent transition-all placeholder:text-text-muted/40 manrope-body font-medium"
              autoFocus
            />
          </div>
        )}
      </div>

      <div className="pt-4">
        <button 
          onClick={handleContinue}
          disabled={!selected}
          className="w-full py-2.5 bg-text-heading text-background rounded-lg font-bold text-[13px] hover:opacity-90 transition-all disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed shadow-md active:scale-[0.98] manrope-body"
        >
          {selected ? 'Continue to my path' : 'Select an objective'}
        </button>
      </div>
    </div>
  );
}
