import React, { useState, useEffect, useMemo } from 'react';
import { X, Cpu, HardDrive, Download, AlertTriangle, PlayCircle, Loader2, Search, Sparkles, Terminal, Layers } from 'lucide-react';
import { hasModelInCache, CreateMLCEngine, prebuiltAppConfig } from '@mlc-ai/web-llm';

interface LocalAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModel: (modelId: string, modelName: string) => void;
}

// ── Curated Featured Models for Quick Selection ──────────────────────────────
export const LOCAL_MODELS = [
  {
    id: 'Llama-3.1-8B-Instruct-q4f32_1-MLC',
    name: 'Llama 3.1 8B',
    size: '4.8 GB',
    vram: '6 GB+',
    description: 'Best for complex reasoning, detailed course generation, and long-form prose.',
    recommended: true,
    category: 'Llama'
  },
  {
    id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
    name: 'Llama 3.2 3B',
    size: '2.0 GB',
    vram: '4 GB+',
    description: 'Optimal balance of speed and quality. Great for M1/M2 Macs & modern GPUs.',
    recommended: false,
    category: 'Llama'
  },
  {
    id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
    name: 'Llama 3.2 1B',
    size: '1.2 GB',
    vram: '2 GB+',
    description: 'Ultra-lightweight. Best for integrated Intel/AMD GPUs and mobile devices.',
    recommended: false,
    category: 'Llama'
  },
  {
    id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
    name: 'Qwen 2.5 1.5B',
    size: '1.2 GB',
    vram: '2 GB+',
    description: 'Fast and accurate for its size. Strong logic, code generation, and structured outputs.',
    recommended: false,
    category: 'Qwen & DeepSeek'
  },
  {
    id: 'DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC',
    name: 'DeepSeek R1 7B (Qwen Distill)',
    size: '4.5 GB',
    vram: '6 GB+',
    description: 'DeepSeek reasoning model. Excels at complex analytical tasks and step-by-step logic.',
    recommended: false,
    category: 'Qwen & DeepSeek'
  },
  {
    id: 'Mistral-7B-Instruct-v0.3-q4f16_1-MLC',
    name: 'Mistral 7B v0.3',
    size: '4.2 GB',
    vram: '6 GB+',
    description: 'Acclaimed open-source model with strong zero-shot reasoning.',
    recommended: false,
    category: 'Phi & Mistral'
  },
  {
    id: 'Phi-4-mini-instruct-q4f16_1-MLC',
    name: 'Phi-4 Mini (3.8B)',
    size: '2.5 GB',
    vram: '4 GB+',
    description: 'Next-gen reasoning model from Microsoft with strong math and logic accuracy.',
    recommended: false,
    category: 'Phi & Mistral'
  },
  {
    id: 'gemma-2-2b-it-q4f16_1-MLC',
    name: 'Gemma 2 2B',
    size: '1.5 GB',
    vram: '3 GB+',
    description: 'Compact Google architecture designed for on-device efficiency.',
    recommended: false,
    category: 'Gemma'
  },
  {
    id: 'gemma-2-9b-it-q4f16_1-MLC',
    name: 'Gemma 2 9B',
    size: '5.5 GB',
    vram: '8 GB+',
    description: 'Google flagship open model. High reasoning quality; requires dedicated GPU.',
    recommended: false,
    category: 'Gemma'
  },
  {
    id: 'SmolLM2-1.7B-Instruct-q4f16_1-MLC',
    name: 'SmolLM2 1.7B',
    size: '1.1 GB',
    vram: '2 GB+',
    description: 'Extremely lightweight HuggingFace model designed specifically for high-speed in-browser AI.',
    recommended: false,
    category: 'SmolLM & Mobile'
  }
];

export type CatalogModelItem = {
  id: string;
  name: string;
  vramMB: number;
  vramFormatted: string;
  category: string;
  quant: string;
  lowResource: boolean;
  contextSize?: number;
  url?: string;
};

export function LocalAIModal({ isOpen, onClose, onSelectModel }: LocalAIModalProps) {
  const [webGPUStatus, setWebGPUStatus] = useState<'checking' | 'supported' | 'unsupported'>('checking');
  const [cachedModels, setCachedModels] = useState<Record<string, boolean>>({});
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: string }>({});
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  // Gallery Navigation State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'featured' | 'all' | 'llama' | 'qwen' | 'gemma' | 'phi' | 'smollm' | 'custom'>('featured');
  const [customModelInput, setCustomModelInput] = useState('');

  // Extract full Web-LLM catalog (160+ models)
  const fullCatalog: CatalogModelItem[] = useMemo(() => {
    const list = prebuiltAppConfig?.model_list || [];
    return list.map((item: any) => {
      const id: string = item.model_id;
      const vramMB: number = item.vram_required_MB || 2000;
      const vramFormatted = (vramMB / 1024).toFixed(1) + ' GB';

      // Categorize model architecture
      let category = 'Other';
      const idLower = id.toLowerCase();
      if (idLower.includes('llama')) category = 'Llama';
      else if (idLower.includes('qwen') || idLower.includes('deepseek')) category = 'Qwen & DeepSeek';
      else if (idLower.includes('gemma')) category = 'Gemma';
      else if (idLower.includes('phi') || idLower.includes('mistral') || idLower.includes('hermes')) category = 'Phi & Mistral';
      else if (idLower.includes('smollm') || idLower.includes('tinyllama') || vramMB < 1500) category = 'SmolLM & Mobile';

      // Quantization extraction
      let quant = 'q4f16_1';
      const quantMatch = id.match(/(q[048]f(?:16|32)(?:_\d+)?)/i);
      if (quantMatch) quant = quantMatch[1];

      // Format readable title
      let name = id
        .replace(/-MLC.*/, '')
        .replace(/_/g, ' ');

      return {
        id,
        name,
        vramMB,
        vramFormatted,
        category,
        quant,
        lowResource: !!item.low_resource_required,
        contextSize: item.overrides?.context_window_size,
        url: item.model,
      };
    });
  }, []);

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
    // Check featured models
    for (const model of LOCAL_MODELS) {
      try {
        status[model.id] = await hasModelInCache(model.id);
      } catch (e) {
        status[model.id] = false;
      }
    }
    // Check catalog models
    for (const model of fullCatalog.slice(0, 50)) {
      if (status[model.id] === undefined) {
        try {
          status[model.id] = await hasModelInCache(model.id);
        } catch (e) {
          status[model.id] = false;
        }
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
      setDownloadProgress((prev) => ({ ...prev, [modelId]: 'Download failed. Please check device memory.' }));
    } finally {
      setIsDownloading(null);
    }
  };

  // Filter models based on search & category tab
  const filteredCatalog = useMemo(() => {
    return fullCatalog.filter((m) => {
      // Category check
      if (activeTab === 'llama' && m.category !== 'Llama') return false;
      if (activeTab === 'qwen' && m.category !== 'Qwen & DeepSeek') return false;
      if (activeTab === 'gemma' && m.category !== 'Gemma') return false;
      if (activeTab === 'phi' && m.category !== 'Phi & Mistral') return false;
      if (activeTab === 'smollm' && m.category !== 'SmolLM & Mobile') return false;

      // Search query check
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.id.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q) ||
          m.quant.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [fullCatalog, activeTab, searchQuery]);
  const featuredModelsList = useMemo(() => {
    const localModelIds = new Set(LOCAL_MODELS.map((m) => m.id));
    const extraCachedCatalogModels = fullCatalog
      .filter((cat) => !!cachedModels[cat.id] && !localModelIds.has(cat.id))
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        size: cat.vramFormatted,
        vram: cat.vramFormatted,
        description: `Downloaded model from ${cat.category} catalog (${cat.quant}).`,
        recommended: false,
        category: cat.category,
      }));

    const allFeatured = [...LOCAL_MODELS, ...extraCachedCatalogModels];

    return allFeatured.sort((a, b) => {
      const aCached = !!cachedModels[a.id];
      const bCached = !!cachedModels[b.id];
      if (aCached && !bCached) return -1;
      if (!aCached && bCached) return 1;
      return 0;
    });
  }, [cachedModels, fullCatalog]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-background border border-border w-full max-w-4xl rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-sidebar/50">
          <div>
            <h2 className="text-lg font-bold text-text-heading flex items-center gap-2">
              <Cpu className="w-5 h-5 text-accent" /> WebGPU Local AI Models Gallery
            </h2>
            <p className="text-xs text-text-muted font-medium mt-0.5">
              160+ prebuilt WebGPU models & custom HuggingFace MLC deployments running 100% on your device hardware
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-border/50 rounded-full transition-colors text-text-muted hover:text-text-heading">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {webGPUStatus === 'unsupported' ? (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-text-heading mb-2">WebGPU Not Supported</h3>
              <p className="text-sm text-text-muted">
                Your current browser or device does not support WebGPU, which is required to run AI models locally. 
                Please use Google Chrome, Microsoft Edge, or a WebGPU-enabled browser on a desktop device with a compatible GPU.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Device Warnings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-accent/5 border border-accent/20 p-3.5 rounded-lg flex items-start gap-2.5">
                  <HardDrive className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-[12px] font-bold text-text-heading">IndexedDB Browser Cache</p>
                    <p className="text-[11px] text-text-muted leading-tight">
                      Models are downloaded once to browser cache and execute entirely on device. No prompt or data leaves your machine.
                    </p>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-lg flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-[12px] font-bold text-amber-600">Hardware & VRAM Guardrails</p>
                    <p className="text-[11px] text-amber-600/80 leading-tight">
                      Models requiring 5GB+ VRAM (like 8B/9B variants) require dedicated GPUs. Integrated Intel/AMD GPUs should use 1B - 3B models to avoid memory crashes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                <div className="flex flex-wrap items-center gap-1 bg-sidebar border border-border p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab('featured')}
                    className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${
                      activeTab === 'featured' ? 'bg-background text-text-heading shadow-sm' : 'text-text-muted hover:text-text-heading'
                    }`}
                  >
                    Featured ({featuredModelsList.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${
                      activeTab === 'all' ? 'bg-background text-text-heading shadow-sm' : 'text-text-muted hover:text-text-heading'
                    }`}
                  >
                    All Catalog ({fullCatalog.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('llama')}
                    className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${
                      activeTab === 'llama' ? 'bg-background text-text-heading shadow-sm' : 'text-text-muted hover:text-text-heading'
                    }`}
                  >
                    Llama
                  </button>
                  <button
                    onClick={() => setActiveTab('qwen')}
                    className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${
                      activeTab === 'qwen' ? 'bg-background text-text-heading shadow-sm' : 'text-text-muted hover:text-text-heading'
                    }`}
                  >
                    Qwen / DeepSeek
                  </button>
                  <button
                    onClick={() => setActiveTab('gemma')}
                    className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${
                      activeTab === 'gemma' ? 'bg-background text-text-heading shadow-sm' : 'text-text-muted hover:text-text-heading'
                    }`}
                  >
                    Gemma
                  </button>
                  <button
                    onClick={() => setActiveTab('smollm')}
                    className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${
                      activeTab === 'smollm' ? 'bg-background text-text-heading shadow-sm' : 'text-text-muted hover:text-text-heading'
                    }`}
                  >
                    SmolLM / Mobile
                  </button>
                  <button
                    onClick={() => setActiveTab('custom')}
                    className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${
                      activeTab === 'custom' ? 'bg-background text-text-heading shadow-sm' : 'text-text-muted hover:text-text-heading'
                    }`}
                  >
                    Custom ID
                  </button>
                </div>

                {/* Search Bar */}
                {activeTab !== 'custom' && (
                  <div className="relative min-w-[220px]">
                    <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search 160+ models or quant..."
                      className="w-full bg-sidebar border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                )}
              </div>

              {/* TAB 1: FEATURED CURATED MODELS */}
              {activeTab === 'featured' && (
                <div className="grid gap-3">
                  {featuredModelsList.map((model) => {
                    const isCached = cachedModels[model.id];
                    const downloadingThis = isDownloading === model.id;
                    const progress = downloadProgress[model.id];

                    return (
                      <div key={model.id} className={`p-4 rounded-lg border transition-all ${isCached ? 'border-accent bg-accent/5' : 'border-border bg-sidebar/50'}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-bold text-text-heading truncate">{model.name}</h3>
                              {model.recommended && (
                                <span className="px-2 py-0.5 bg-accent/10 text-accent text-[9px] font-bold uppercase tracking-widest rounded">Best</span>
                              )}
                              {isCached && (
                                <span className="px-2 py-0.5 bg-green-500/10 text-green-600 text-[9px] font-bold uppercase tracking-widest rounded">Cached</span>
                              )}
                            </div>
                            <p className="text-xs text-text-muted mb-2 leading-relaxed">{model.description}</p>
                            <div className="flex items-center gap-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                              <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" /> Size: {model.size}</span>
                              <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> VRAM: {model.vram}</span>
                              <span className="font-mono text-[9px] opacity-75">{model.id}</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end shrink-0 gap-2">
                            {isCached ? (
                              <button
                                onClick={() => {
                                  onSelectModel(model.id, model.name);
                                  onClose();
                                }}
                                className="px-4 py-2 bg-accent text-white text-[10px] font-bold uppercase tracking-widest rounded-md flex items-center gap-1.5 hover:opacity-90 shadow-md shadow-accent/20"
                              >
                                <PlayCircle className="w-3.5 h-3.5" /> Select Model
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDownload(model.id)}
                                disabled={isDownloading !== null}
                                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md flex items-center gap-1.5 transition-all ${
                                  downloadingThis 
                                    ? 'bg-border text-text-muted cursor-not-allowed'
                                    : isDownloading !== null 
                                      ? 'bg-sidebar text-text-muted opacity-50 cursor-not-allowed'
                                      : 'bg-text-heading text-background hover:opacity-90'
                                }`}
                              >
                                {downloadingThis ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                                {downloadingThis ? 'Downloading...' : 'Download'}
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {progress && downloadingThis && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-[10px] font-mono text-accent animate-pulse">
                              {progress}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 2-6: FULL CATALOG GRID */}
              {activeTab !== 'featured' && activeTab !== 'custom' && (
                <div className="space-y-3">
                  <p className="text-[11px] font-medium text-text-muted">
                    Showing {filteredCatalog.length} models matching query. Click <strong className="text-text-heading">Download</strong> to pre-cache or <strong className="text-text-heading">Select</strong> to run instantly.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
                    {filteredCatalog.map((m) => {
                      const isCached = cachedModels[m.id];
                      const downloadingThis = isDownloading === m.id;
                      const progress = downloadProgress[m.id];

                      return (
                        <div
                          key={m.id}
                          className={`p-3.5 rounded-lg border text-left flex flex-col justify-between gap-3 transition-all ${
                            isCached ? 'border-accent/40 bg-accent/5' : 'border-border bg-sidebar/40'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="text-xs font-bold text-text-heading truncate" title={m.name}>
                                {m.name}
                              </h4>
                              {isCached && (
                                <span className="px-1.5 py-0.5 bg-green-500/10 text-green-600 text-[8px] font-bold uppercase tracking-widest rounded shrink-0">
                                  Cached
                                </span>
                              )}
                            </div>

                            <p className="text-[10px] font-mono text-text-muted truncate mb-2" title={m.id}>
                              {m.id}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-text-muted">
                              <span className="px-2 py-0.5 bg-background border border-border rounded flex items-center gap-1">
                                <HardDrive className="w-2.5 h-2.5" /> VRAM: ~{m.vramFormatted}
                              </span>
                              <span className="px-2 py-0.5 bg-background border border-border rounded font-mono">
                                {m.quant}
                              </span>
                              {m.contextSize && (
                                <span className="px-2 py-0.5 bg-background border border-border rounded">
                                  {Math.round(m.contextSize / 1024)}k ctx
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                            <span className="text-[9px] text-text-muted font-medium">
                              {m.lowResource ? 'Low Memory Compatible' : 'Standard WebGPU Engine'}
                            </span>

                            {isCached ? (
                              <button
                                onClick={() => {
                                  onSelectModel(m.id, m.name);
                                  onClose();
                                }}
                                className="px-3 py-1.5 bg-accent text-white text-[9px] font-bold uppercase tracking-widest rounded flex items-center gap-1 hover:opacity-90"
                              >
                                <PlayCircle className="w-3 h-3" /> Select
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDownload(m.id)}
                                disabled={isDownloading !== null}
                                className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded flex items-center gap-1 transition-all ${
                                  downloadingThis
                                    ? 'bg-border text-text-muted cursor-not-allowed'
                                    : 'bg-text-heading text-background hover:opacity-90'
                                }`}
                              >
                                {downloadingThis ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                                {downloadingThis ? 'Downloading' : 'Download'}
                              </button>
                            )}
                          </div>

                          {progress && downloadingThis && (
                            <p className="text-[9px] font-mono text-accent animate-pulse mt-1 pt-1 border-t border-border">
                              {progress}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 7: CUSTOM MODEL ENTRY */}
              {activeTab === 'custom' && (
                <div className="p-5 border border-border rounded-lg bg-sidebar/40 space-y-4">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-accent" />
                    <h3 className="text-xs font-bold text-text-heading uppercase tracking-widest">
                      Custom WebGPU Model Deployment
                    </h3>
                  </div>

                  <p className="text-xs text-text-muted leading-relaxed">
                    You can execute any open-weight LLM converted for WebGPU MLC runtime. Enter the pre-quantized HuggingFace model ID or full WebGPU build URL.
                  </p>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                      WebGPU Model ID or HuggingFace Repository
                    </label>
                    <input
                      type="text"
                      value={customModelInput}
                      onChange={(e) => setCustomModelInput(e.target.value)}
                      placeholder="e.g. Llama-3.2-1B-Instruct-q4f16_1-MLC or your-username/custom-model-MLC"
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      disabled={!customModelInput.trim() || isDownloading !== null}
                      onClick={() => {
                        const modelId = customModelInput.trim();
                        onSelectModel(modelId, modelId);
                        onClose();
                      }}
                      className="px-4 py-2 bg-accent text-white text-[10px] font-bold uppercase tracking-widest rounded-md flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50"
                    >
                      <PlayCircle className="w-3.5 h-3.5" /> Deploy Model
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LocalAIModal;
