import React, { useState, useEffect } from 'react';
import { X, Cpu, HardDrive, Download, AlertTriangle, PlayCircle, Loader2 } from 'lucide-react';
import { hasModelInCache, CreateMLCEngine } from '@mlc-ai/web-llm';

interface LocalAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModel: (modelId: string, modelName: string) => void;
}

export const LOCAL_MODELS = [
  {
    id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
    name: 'Llama 3.2 1B',
    size: '1.2 GB',
    vram: '2 GB+',
    description: 'Ultra-lightweight. Best for integrated Intel GPUs and devices with low memory.',
    recommended: true
  },
  {
    id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
    name: 'Qwen 2.5 1.5B',
    size: '1.2 GB',
    vram: '2 GB+',
    description: 'Incredibly fast and smart for its size. Excels at coding and reasoning.',
    recommended: false
  },
  {
    id: 'gemma-2-2b-it-q4f16_1-MLC',
    name: 'Gemma 2 2B',
    size: '1.5 GB',
    vram: '3 GB+',
    description: 'Built by Google. Very capable for small edge devices.',
    recommended: false
  },
  {
    id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
    name: 'Llama 3.2 3B',
    size: '2.0 GB',
    vram: '4 GB+',
    description: 'Perfect balance of speed and high-quality reasoning. Great for M1/M2 Macs.',
    recommended: false
  },
  {
    id: 'Phi-3-mini-4k-instruct-q4f16_1-MLC',
    name: 'Phi-3 Mini',
    size: '2.3 GB',
    vram: '4 GB+',
    description: 'Fast and lightweight. Built by Microsoft. Works well on older hardware.',
    recommended: false
  },
  {
    id: 'Llama-3.1-8B-Instruct-q4f32_1-MLC',
    name: 'Llama 3.1 8B',
    size: '4.8 GB',
    vram: '6 GB+',
    description: 'Highly capable. Best for complex JSON formatting and detailed roadmaps.',
    recommended: false
  },
  {
    id: 'gemma-2-9b-it-q4f16_1-MLC',
    name: 'Gemma 2 9B',
    size: '5.5 GB',
    vram: '8 GB+',
    description: 'Powerful flagship model from Google. Requires high-end dedicated GPU.',
    recommended: false
  },
  {
    id: 'DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC',
    name: 'DeepSeek R1 (7B)',
    size: '4.5 GB',
    vram: '6 GB+',
    description: 'DeepSeek reasoning model distilled from Qwen. Extremely capable at logic.',
    recommended: false
  },
  {
    id: 'Mistral-7B-Instruct-v0.3-q4f16_1-MLC',
    name: 'Mistral 7B v0.3',
    size: '4.2 GB',
    vram: '6 GB+',
    description: 'Highly acclaimed open-source model with strong generalization.',
    recommended: false
  },
  {
    id: 'Phi-4-mini-instruct-q4f16_1-MLC',
    name: 'Phi-4 Mini',
    size: '2.5 GB',
    vram: '4 GB+',
    description: 'Next-gen lightweight model from Microsoft. Excellent reasoning capabilities.',
    recommended: false
  }
];

export function LocalAIModal({ isOpen, onClose, onSelectModel }: LocalAIModalProps) {
  const [webGPUStatus, setWebGPUStatus] = useState<'checking' | 'supported' | 'unsupported'>('checking');
  const [cachedModels, setCachedModels] = useState<Record<string, boolean>>({});
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: string }>({});
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkCompatibility();
      checkCache();
    }
  }, [isOpen]);

  const checkCompatibility = async () => {
    if (!navigator.gpu) {
      setWebGPUStatus('unsupported');
    } else {
      setWebGPUStatus('supported');
    }
  };

  const checkCache = async () => {
    const status: Record<string, boolean> = {};
    for (const model of LOCAL_MODELS) {
      try {
        const cached = await hasModelInCache(model.id);
        status[model.id] = cached;
      } catch (e) {
        status[model.id] = false;
      }
    }
    setCachedModels(status);
  };

  const handleDownload = async (modelId: string) => {
    if (isDownloading) return;
    setIsDownloading(modelId);
    setDownloadProgress({ ...downloadProgress, [modelId]: 'Initializing download...' });

    try {
      const initProgressCallback = (report: { text: string }) => {
        setDownloadProgress((prev) => ({ ...prev, [modelId]: report.text }));
      };
      
      const engine = await CreateMLCEngine(modelId, { initProgressCallback });
      await engine.unload();
      
      setCachedModels(prev => ({ ...prev, [modelId]: true }));
      setDownloadProgress(prev => ({ ...prev, [modelId]: 'Finished!' }));
    } catch (err: any) {
      console.error(err);
      setDownloadProgress((prev) => ({ ...prev, [modelId]: 'Download failed. Please try again.' }));
    } finally {
      setIsDownloading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-background border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-border bg-sidebar/50">
          <div>
            <h2 className="text-xl font-bold text-text-heading flex items-center gap-2">
              <Cpu className="w-5 h-5 text-accent" /> Local AI Inference
            </h2>
            <p className="text-xs text-text-muted font-medium mt-1">Run AI natively in your browser using WebGPU</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-border/50 rounded-full transition-colors text-text-muted hover:text-text-heading">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {webGPUStatus === 'unsupported' ? (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-text-heading mb-2">WebGPU Not Supported</h3>
              <p className="text-sm text-text-muted">
                Your current browser or device does not support WebGPU, which is required to run AI models locally. 
                Please use Google Chrome, Microsoft Edge, or a WebGPU-enabled browser on a desktop device.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-accent/5 border border-accent/20 p-4 rounded-xl flex items-start gap-3">
                <HardDrive className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-[12px] text-text-muted leading-relaxed">
                    Local models run entirely on your device. They must be downloaded to your browser cache (IndexedDB) once. 
                    Subsequent generations will load instantly from cache.
                  </p>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    <strong className="text-text-heading">Quality Note:</strong> Local models are significantly smaller than cloud-based frontier models (like GPT-4o or Gemini). The generated roadmaps may occasionally be lower in quality, less detailed, or contain formatting errors.
                  </p>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[13px] font-bold text-amber-600 mb-1">Hardware Crash Warning</h4>
                  <p className="text-[11px] text-amber-600/80 leading-relaxed font-medium">
                    If your browser crashes ("Aw Snap") when loading the model, your device's GPU ran out of memory. 
                    If you are using an Integrated GPU (like Intel), we highly recommend using the <strong>Llama 3.2 1B</strong> model below.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {LOCAL_MODELS.map((model) => {
                  const isCached = cachedModels[model.id];
                  const downloadingThis = isDownloading === model.id;
                  const progress = downloadProgress[model.id];

                  return (
                    <div key={model.id} className={`p-5 rounded-xl border transition-all ${isCached ? 'border-accent bg-accent/5' : 'border-border bg-sidebar'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-bold text-text-heading">{model.name}</h3>
                            {model.recommended && (
                              <span className="px-2 py-0.5 bg-accent/10 text-accent text-[9px] font-bold uppercase tracking-widest rounded-full">Recommended</span>
                            )}
                          </div>
                          <p className="text-xs text-text-muted mb-3">{model.description}</p>
                          <div className="flex items-center gap-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                            <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" /> {model.size}</span>
                            <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> RAM: {model.vram}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0 gap-2">
                          {isCached ? (
                            <button
                              onClick={() => {
                                onSelectModel(model.id, model.name);
                                onClose();
                              }}
                              className="px-5 py-2.5 bg-accent text-white text-[11px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-2 hover:opacity-90 shadow-xl shadow-accent/20"
                            >
                              <PlayCircle className="w-4 h-4" /> Select Model
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDownload(model.id)}
                              disabled={isDownloading !== null}
                              className={`px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-2 transition-all ${
                                downloadingThis 
                                  ? 'bg-border text-text-muted cursor-not-allowed'
                                  : isDownloading !== null 
                                    ? 'bg-sidebar text-text-muted opacity-50 cursor-not-allowed'
                                    : 'bg-text-heading text-background hover:opacity-90'
                              }`}
                            >
                              {downloadingThis ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                              {downloadingThis ? 'Downloading...' : 'Download to Cache'}
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {progress && downloadingThis && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <p className="text-[10px] font-mono text-accent animate-pulse">
                            {progress}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LocalAIModal;
