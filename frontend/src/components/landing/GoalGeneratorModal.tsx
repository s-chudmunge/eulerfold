"use client";

import React from 'react';
import { X, Route } from 'lucide-react';
import RoadmapGenerator from './RoadmapGenerator';
import { RoadmapData } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface GoalGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GoalGeneratorModal({ isOpen, onClose }: GoalGeneratorModalProps) {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  if (!isOpen) return null;

  const handleRoadmapGenerated = (data: RoadmapData, formData: any) => {
    const timestamp = Date.now();
    localStorage.setItem('last_generated_roadmap', JSON.stringify({ data, timestamp }));
    localStorage.setItem('last_generated_form_data', JSON.stringify({ data: formData, timestamp }));
    sessionStorage.setItem('roadmap_just_generated', 'true');
    
    if (data.slug) {
      setIsRedirecting(true);
      router.push(`/roadmap/${data.slug}`);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      {isRedirecting && (
        <div className="absolute inset-0 z-[210] bg-sidebar/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-500 rounded-xl">
          <div className="flex flex-col items-center gap-4">
            <p className="text-[12px] font-bold text-accent uppercase tracking-[0.2em]">
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
      )}
      <div 
        className="w-full max-w-[800px] bg-sidebar border border-border shadow-[0_0_80px_rgba(0,0,0,0.15)] dark:shadow-[0_0_80px_rgba(0,0,0,0.6)] flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 overflow-hidden relative rounded-xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-[30] p-2 text-text-muted hover:text-text-heading hover:bg-background rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div 
          className="flex-1 overflow-y-auto p-10 no-scrollbar"
        >
          <div className="max-w-[600px] mx-auto">
            <RoadmapGenerator onRoadmapGenerated={handleRoadmapGenerated} />
          </div>
        </div>
      </div>
    </div>
  );
}
