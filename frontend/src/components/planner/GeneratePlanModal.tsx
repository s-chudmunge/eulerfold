'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Wand2, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { roadmapsAPI, plannerAPI, RoadmapMe } from '@/lib/api';
import { format, addMonths } from 'date-fns';

interface Props {
  onClose: () => void;
  onRefresh: () => void;
}

export default function GeneratePlanModal({ onClose, onRefresh }: Props) {
  const [loading, setLoading] = useState(false);
  const [roadmaps, setRoadmaps] = useState<RoadmapMe[]>([]);
  const [selectedRoadmapIds, setSelectedRoadmapIds] = useState<number[]>([]);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [targetDate, setTargetDate] = useState(format(addMonths(new Date(), 1), 'yyyy-MM-dd'));
  const [intensity, setIntensity] = useState<'casual' | 'balanced' | 'intense'>('balanced');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      const data = await roadmapsAPI.getMyRoadmaps();
      setRoadmaps(data);
      if (data.length > 0) {
        setSelectedRoadmapIds([data[0].id]);
      }
    } catch (err) {
      console.error("Failed to fetch roadmaps", err);
    }
  };

  const toggleRoadmap = (id: number) => {
    if (selectedRoadmapIds.includes(id)) {
      setSelectedRoadmapIds(selectedRoadmapIds.filter(i => i !== id));
    } else {
      setSelectedRoadmapIds([...selectedRoadmapIds, id]);
    }
  };

  const handleGenerate = async () => {
    if (selectedRoadmapIds.length === 0) {
      setError("Please select at least one roadmap.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await plannerAPI.generatePlan({
        roadmap_ids: selectedRoadmapIds,
        start_date: startDate,
        target_date: targetDate,
        intensity: intensity
      });
      onRefresh();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200 manrope-body">
      <div className="bg-sidebar w-full max-w-[500px] border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-sidebar/50">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-accent" />
            <h3 className="text-[14px] font-bold text-text-heading tracking-tight">
              AI Study Plan Generator
            </h3>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-heading transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] no-scrollbar">
          <div className="p-4 bg-accent/5 border border-accent/10 rounded-lg flex items-start gap-3">
            <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <p className="text-[12px] text-text-primary leading-relaxed">
              Select your roadmaps and intensity. Our AI will distribute modules, practice sessions, and proof-of-work tasks across your calendar.
            </p>
          </div>

          {/* Roadmap Selection */}
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-3 ml-1">Select Roadmaps to Include</label>
            <div className="grid grid-cols-1 gap-2">
              {roadmaps.map(r => (
                <button
                  key={r.id}
                  onClick={() => toggleRoadmap(r.id)}
                  className={`flex items-center justify-between px-4 py-3 border transition-all text-left rounded-lg ${selectedRoadmapIds.includes(r.id) ? 'bg-accent/5 border-accent text-accent' : 'bg-background/50 border-border text-text-muted hover:border-accent/40'}`}
                >
                  <span className="text-[13px] font-bold truncate pr-4">{r.title}</span>
                  {selectedRoadmapIds.includes(r.id) && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-2 ml-1">Start Date</label>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-background/50 border border-border px-3 py-2.5 text-[12px] font-bold text-text-primary outline-none focus:border-accent transition-all rounded-lg"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-2 ml-1">Target Finish</label>
              <input 
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-background/50 border border-border px-3 py-2.5 text-[12px] font-bold text-text-primary outline-none focus:border-accent transition-all rounded-lg"
              />
            </div>
          </div>

          {/* Intensity */}
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-3 ml-1">Learning Intensity</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'casual', label: 'Casual', desc: '1 mod/wk' },
                { id: 'balanced', label: 'Balanced', desc: '2 mod/wk' },
                { id: 'intense', label: 'Intense', desc: '3 mod/wk' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setIntensity(opt.id as any)}
                  className={`flex flex-col items-center justify-center p-3 border transition-all rounded-lg ${intensity === opt.id ? 'bg-accent text-white border-accent' : 'bg-background/50 border-border text-text-muted hover:border-accent/40'}`}
                >
                  <span className="text-[11px] font-black uppercase tracking-widest">{opt.label}</span>
                  <span className={`text-[9px] font-bold mt-0.5 ${intensity === opt.id ? 'text-white/80' : 'opacity-40'}`}>{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-[11px] font-bold">{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-border flex items-center justify-end gap-3 bg-sidebar/50">
          <button onClick={onClose} className="px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest text-text-muted hover:text-text-heading transition-all">
            Cancel
          </button>
          <button 
            onClick={handleGenerate}
            disabled={loading || selectedRoadmapIds.length === 0}
            className="flex items-center gap-2 px-8 py-2.5 bg-text-heading text-background rounded-lg text-[12px] font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all shadow-lg active:scale-[0.98]"
          >
            {loading ? 'Generating...' : (
              <>
                <Wand2 className="w-3.5 h-3.5" />
                <span>Build Plan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
