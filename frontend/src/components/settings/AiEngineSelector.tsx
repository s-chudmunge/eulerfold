"use client";

import React, { useState, useEffect } from 'react';
import { Cpu, Sparkles, Unlink } from 'lucide-react';
import { OpenRouterModal } from '../landing/OpenRouterModal';
import { LocalAIModal } from '../landing/LocalAIModal';

export default function AiEngineSelector() {
  const [openRouterKey, setOpenRouterKey] = useState<string | null>(null);
  const [useOpenRouter, setUseOpenRouter] = useState(false);
  const [openRouterModel, setOpenRouterModel] = useState<string | null>(null);
  
  const [localAIModelId, setLocalAIModelId] = useState<string | null>(null);
  const [localAIModelName, setLocalAIModelName] = useState<string | null>(null);
  const [useLocalAI, setUseLocalAI] = useState(false);

  const [isOpenRouterModalOpen, setIsOpenRouterModalOpen] = useState(false);
  const [isLocalAIModalOpen, setIsLocalAIModalOpen] = useState(false);

  const loadSettings = () => {
    setOpenRouterKey(localStorage.getItem('openrouter_key'));
    setUseOpenRouter(localStorage.getItem('use_openrouter') === 'true');
    setOpenRouterModel(localStorage.getItem('openrouter_model') || 'openai/gpt-4o');
    setLocalAIModelId(localStorage.getItem('local_ai_model'));
    setLocalAIModelName(localStorage.getItem('local_ai_model_name'));
    setUseLocalAI(localStorage.getItem('use_local_ai') === 'true');
  };

  useEffect(() => {
    loadSettings();
    window.addEventListener('ai_settings_changed', loadSettings);
    return () => window.removeEventListener('ai_settings_changed', loadSettings);
  }, []);

  const handleSelectEngine = (engine: 'default' | 'openrouter' | 'localai') => {
    if (engine === 'default') {
      localStorage.setItem('use_openrouter', 'false');
      localStorage.setItem('use_local_ai', 'false');
    } else if (engine === 'openrouter') {
      localStorage.setItem('use_openrouter', 'true');
      localStorage.setItem('use_local_ai', 'false');
    } else if (engine === 'localai') {
      localStorage.setItem('use_openrouter', 'false');
      localStorage.setItem('use_local_ai', 'true');
    }
    window.dispatchEvent(new Event('ai_settings_changed'));
  };

  return (
    <div className="pt-4 flex flex-col items-center gap-4 w-full">
      <OpenRouterModal 
        isOpen={isOpenRouterModalOpen} 
        onClose={() => {
          setIsOpenRouterModalOpen(false);
          window.dispatchEvent(new Event('ai_settings_changed'));
        }} 
      />
      <LocalAIModal 
        isOpen={isLocalAIModalOpen} 
        onClose={() => {
          setIsLocalAIModalOpen(false);
          window.dispatchEvent(new Event('ai_settings_changed'));
        }} 
        onSelectModel={(modelId, modelName) => {
          localStorage.setItem('local_ai_model', modelId);
          localStorage.setItem('local_ai_model_name', modelName);
          localStorage.setItem('use_local_ai', 'true');
          localStorage.setItem('use_openrouter', 'false');
          setIsLocalAIModalOpen(false);
          window.dispatchEvent(new Event('ai_settings_changed'));
        }}
      />

      <div className="flex flex-col gap-2 max-w-sm w-full mb-4">
        <div className="flex items-center gap-1.5 mb-1">
          <Cpu className="w-4 h-4 text-accent" />
          <span className="text-[12px] font-bold text-text-heading uppercase tracking-widest">Select AI Engine</span>
        </div>
        <div className="flex items-center justify-between p-1 bg-sidebar border border-border rounded-lg w-full">
          <button
            type="button"
            onClick={() => handleSelectEngine('default')}
            className={`flex-1 py-1.5 px-3 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${!useOpenRouter && !useLocalAI ? 'bg-background text-text-heading shadow-sm' : 'text-text-muted hover:text-text-heading'}`}
          >
            EulerFold AI
          </button>
          <button
            type="button"
            onClick={() => handleSelectEngine('openrouter')}
            className={`flex-1 py-1.5 px-3 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${useOpenRouter ? 'bg-background text-text-heading shadow-sm' : 'text-text-muted hover:text-text-heading'}`}
          >
            OpenRouter
          </button>
          <button
            type="button"
            onClick={() => handleSelectEngine('localai')}
            className={`flex-1 py-1.5 px-3 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${useLocalAI ? 'bg-background text-text-heading shadow-sm' : 'text-text-muted hover:text-text-heading'}`}
          >
            Local AI
          </button>
        </div>

        {!useOpenRouter && !useLocalAI && (
          <div className="p-4 border border-border rounded-lg bg-sidebar/50 transition-all duration-300 w-full mt-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 bg-background border border-border rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-[13px] font-bold text-text-heading leading-tight mb-0.5">
                    EulerFold AI (Default)
                  </h3>
                  <p className="text-[11px] text-text-muted leading-tight">
                    <span className="text-amber-500/90 font-bold">Costs 1 Credit per generation.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {useLocalAI && !localAIModelId && (
          <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center animate-in fade-in mt-4">
            Please configure a Local Model below
          </div>
        )}
        {useOpenRouter && !openRouterKey && (
          <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center animate-in fade-in mt-4">
            Please configure an API Key below
          </div>
        )}
      </div>

      {useLocalAI ? (
        <div className="p-4 border border-border rounded-lg bg-sidebar/50 transition-all duration-300 w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 bg-background border border-border rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                <Cpu className="w-5 h-5 text-text-heading" />
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-text-heading leading-tight mb-0.5">
                  {localAIModelId ? 'Local Hardware Connected' : 'Free Compute: Bring Your Own GPU'}
                </h3>
                <p className="text-[11px] text-text-muted leading-tight">
                  {localAIModelId 
                    ? <span>Ready to decode using <span className="font-bold text-accent">{localAIModelName}</span>.</span> 
                    : 'Run models natively in your browser using WebGPU. Unlimited generations, 100% private.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              {localAIModelId && (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('local_ai_model');
                    localStorage.removeItem('local_ai_model_name');
                    window.dispatchEvent(new Event('ai_settings_changed'));
                  }}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-background border border-border hover:border-red-500/50 hover:text-red-500 hover:bg-red-500/10 text-[11px] font-bold uppercase tracking-widest transition-all rounded-lg text-text-muted shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Unlink className="w-3.5 h-3.5" /> Remove
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsLocalAIModalOpen(true)}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-background border border-border hover:border-accent hover:text-accent text-[11px] font-bold uppercase tracking-widest transition-all rounded-lg text-text-heading shadow-sm"
              >
                {localAIModelId ? 'Change Model' : 'Configure'}
              </button>
            </div>
          </div>
        </div>
      ) : useOpenRouter ? (
        <div className="p-4 border border-border rounded-lg bg-sidebar/50 transition-all duration-300 w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 bg-background border border-border rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-text-heading">
                  <path d="M16.778 1.844v1.919q-.569-.026-1.138-.032-.708-.008-1.415.037c-1.93.126-4.023.728-6.149 2.237-2.911 2.066-2.731 1.95-4.14 2.75-.396.223-1.342.574-2.185.798-.841.225-1.753.333-1.751.333v4.229s.768.108 1.61.333c.842.224 1.789.575 2.185.799 1.41.798 1.228.683 4.14 2.75 2.126 1.509 4.22 2.11 6.148 2.236.88.058 1.716.041 2.555.005v1.918l7.222-4.168-7.222-4.17v2.176c-.86.038-1.611.065-2.278.021-1.364-.09-2.417-.357-3.979-1.465-2.244-1.593-2.866-2.027-3.68-2.508.889-.518 1.449-.906 3.822-2.59 1.56-1.109 2.614-1.377 3.978-1.466.667-.044 1.418-.017 2.278.02v2.176L24 6.014Z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-text-heading leading-tight mb-0.5">
                  {openRouterKey ? 'OpenRouter Connected' : 'Power-User: Bring Your Own Key'}
                </h3>
                <p className="text-[11px] text-text-muted leading-tight">
                  {openRouterKey 
                    ? <span>Ready to decode using <span className="font-bold text-accent">{openRouterModel || 'openai/gpt-4o'}</span>.</span> 
                    : 'Use any AI model via OpenRouter. Unlimited generations, zero credits required.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              {openRouterKey && (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('openrouter_key');
                    window.dispatchEvent(new Event('ai_settings_changed'));
                  }}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-background border border-border hover:border-red-500/50 hover:text-red-500 hover:bg-red-500/10 text-[11px] font-bold uppercase tracking-widest transition-all rounded-lg text-text-muted shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Unlink className="w-3.5 h-3.5" /> Unlink
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpenRouterModalOpen(true)}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-background border border-border hover:border-accent hover:text-accent text-[11px] font-bold uppercase tracking-widest transition-all rounded-lg text-text-heading shadow-sm"
              >
                {openRouterKey ? 'Change Model' : 'Configure'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
