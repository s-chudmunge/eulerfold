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

  if (!isOpen) return null;

  const handleRoadmapGenerated = (data: RoadmapData, formData: any) => {
    const timestamp = Date.now();
    localStorage.setItem('last_generated_roadmap', JSON.stringify({ data, timestamp }));
    localStorage.setItem('last_generated_form_data', JSON.stringify({ data: formData, timestamp }));
    sessionStorage.setItem('roadmap_just_generated', 'true');
    
    if (data.slug) {
      router.push(`/roadmap/${data.slug}`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-300">
      <div 
        className="w-full max-w-[800px] border border-[#243333] shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 overflow-hidden relative rounded-xl"
        style={{ backgroundColor: '#0f1717', opacity: 1 }}
      >
        
        {/* Header */}
        <div 
          className="p-4 border-b border-[#243333] flex items-center justify-between sticky top-0 z-20"
          style={{ backgroundColor: '#131d1d', opacity: 1 }}
        >
          <div className="flex items-center gap-3">
            <Route className="w-4 h-4 text-accent" />
            <h2 className="inconsolata-ui text-[13px] font-bold text-text-heading uppercase tracking-widest">
              Create your step by step learning path
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-text-muted hover:text-text-heading transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div 
          className="flex-1 overflow-y-auto p-6 no-scrollbar"
          style={{ backgroundColor: '#0f1717', opacity: 1 }}
        >
          <div className="max-w-[600px] mx-auto">
            <RoadmapGenerator onRoadmapGenerated={handleRoadmapGenerated} />
          </div>
        </div>
      </div>
    </div>
  );
}
