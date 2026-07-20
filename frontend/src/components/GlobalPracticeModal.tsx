'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePractice } from './PracticeProvider';
import { X } from 'lucide-react';
import MCQPractice from '@/components/roadmap/MCQPractice';
import { supabase } from '@/lib/supabase/client';

export default function GlobalPracticeModal() {
  const { isPracticeModalOpen, closePracticeModal } = usePractice();
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const refreshProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: userData } = await supabase
        .from('profiles')
        .select('*')
        .eq('supabase_uid', session.user.id)
        .single();
      if (userData) {
        setProfile(userData);
      }
    } else {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    if (isPracticeModalOpen) {
      refreshProfile();
      // Reset state when opened
      setSubject('');
      setTopic('');
      setIsStarted(false);
    }
  }, [isPracticeModalOpen, refreshProfile]);

  if (!isPracticeModalOpen) return null;

  const handleStart = () => {
    if (!subject.trim() || !topic.trim()) return;
    setIsStarted(true);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background w-full max-w-2xl rounded-lg border border-border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="appropriate-sans text-lg font-bold text-text-heading">Quick Practice</h2>
          <button 
            onClick={closePracticeModal}
            className="p-1 hover:bg-sidebar rounded-md text-text-muted hover:text-text-heading transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {!isStarted ? (
            <div className="space-y-6">
              <p className="appropriate-sans text-sm text-text-muted">
                Enter any subject and specific topic you want to practice. Our AI will generate custom MCQ questions for you.
              </p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="appropriate-sans text-xs font-bold text-text-muted tracking-wider">
                    Subject or Domain
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. Computer Science, Physics..."
                    className="w-full bg-background border border-border rounded-md px-4 py-3 text-sm font-bold text-text-heading appropriate-sans focus:outline-none focus:border-accent transition-all placeholder:font-normal placeholder:opacity-50"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="appropriate-sans text-xs font-bold text-text-muted tracking-wider">
                    Specific Topic
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. Neural Networks, Quantum Mechanics..."
                    className="w-full bg-background border border-border rounded-md px-4 py-3 text-sm font-bold text-text-heading appropriate-sans focus:outline-none focus:border-accent transition-all placeholder:font-normal placeholder:opacity-50"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleStart}
                  disabled={!subject.trim() || !topic.trim()}
                  className="px-6 py-2.5 bg-accent text-white rounded-md font-bold appropriate-sans disabled:opacity-50 disabled:grayscale hover:opacity-90 transition-all shadow-md"
                >
                  Start Practice
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px]">
              <div className="mb-4 flex items-center justify-between">
                 <button 
                    onClick={() => setIsStarted(false)}
                    className="text-xs font-bold text-text-muted hover:text-emerald-600 underline"
                 >
                    Back to setup
                 </button>
              </div>
              <MCQPractice
                topicName={topic}
                subject={subject}
                weekNumber={1}
                isPro={profile?.is_pro || false}
                userCredits={profile?.roadmap_credits || 0}
                onPointsEarned={() => {}}
                onRefreshProfile={refreshProfile}
                onClose={() => {
                  setIsStarted(false);
                  closePracticeModal();
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
