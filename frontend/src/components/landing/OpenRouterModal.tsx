import React, { useState, useEffect, useRef } from 'react';
import { X, Key, Cpu, Zap, Loader2, Link2, Unlink, CheckCircle2, History, ExternalLink, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase/client';

interface OpenRouterModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData?: any;
  onSuccess?: (roadmap: any) => void;
  onSave?: (key: string, model: string) => void;
  onRemove?: () => void;
}

export function OpenRouterModal({ isOpen, onClose, formData, onSuccess, onSave, onRemove }: OpenRouterModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('openai/gpt-4o');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [modelSearch, setModelSearch] = useState('');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [usageHistory, setUsageHistory] = useState<any[]>([]);
  const [keyInfo, setKeyInfo] = useState<any>(null);
  const [manualKey, setManualKey] = useState('');
  
  const handleManualSave = () => {
    if (!manualKey.trim()) return;
    const key = manualKey.trim();
    localStorage.setItem('openRouterKey', key);
    setApiKey(key);
    setManualKey('');
    
    fetch("https://openrouter.ai/api/v1/auth/key", {
      headers: { "Authorization": `Bearer ${key}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.data) {
         setKeyInfo(data.data);
      }
    })
    .catch(console.error);
  };
  
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const key = localStorage.getItem('openRouterKey') || '';
      setApiKey(key);
      
      if (key && !keyInfo) {
        fetch("https://openrouter.ai/api/v1/auth/key", {
          headers: { "Authorization": `Bearer ${key}` }
        })
        .then(res => res.json())
        .then(data => {
          if (data && data.data) {
             setKeyInfo(data.data);
          }
        })
        .catch(console.error);
      }

      const savedModel = localStorage.getItem('openRouterModel') || 'openai/gpt-4o';
      setModel(savedModel);
      setModelSearch(savedModel);
      
      const fetchUsage = async () => {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession) {
          try {
            const res = await api.get('/ai-usage?limit=5');
            const mappedHistory = res.data.map((log: any) => ({
              subject: log.subject,
              model: log.model_name,
              total_tokens: log.total_tokens,
              date: log.created_at
            }));
            setUsageHistory(mappedHistory);
          } catch (err) {
            console.error("Failed to load AI usage history", err);
          }
        } else {
          try {
            const history = JSON.parse(localStorage.getItem('openRouterUsageHistory') || '[]');
            setUsageHistory(history);
          } catch (e) {}
        }
      };
      fetchUsage();

      if (availableModels.length === 0) {
        setIsLoadingModels(true);
        fetch("https://openrouter.ai/api/v1/models")
          .then(res => res.json())
          .then(data => {
            if (data && data.data) {
              setAvailableModels(data.data);
            }
          })
          .catch(console.error)
          .finally(() => setIsLoadingModels(false));
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredModels = availableModels.filter(m => 
    m.id.toLowerCase().includes(modelSearch.toLowerCase()) || 
    (m.name && m.name.toLowerCase().includes(modelSearch.toLowerCase()))
  ).slice(0, 50);

  if (!isOpen) return null;

  const handleConnect = () => {
    const callbackUrl = encodeURIComponent(window.location.origin + "/auth/openrouter");
    window.location.href = `https://openrouter.ai/auth?callback_url=${callbackUrl}`;
  };

  const handleDisconnect = () => {
    localStorage.removeItem('openRouterKey');
    setApiKey('');
    if (onRemove) onRemove();
  };

  const handleSave = () => {
    if (apiKey) {
      localStorage.setItem('openRouterModel', model);
      if (onSave) onSave(apiKey, model);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-background border-2 border-border p-6 rounded-lg w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-text-heading transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${keyInfo && !keyInfo.is_free_tier ? 'bg-yellow-500/10' : 'bg-accent/10'}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className={keyInfo && !keyInfo.is_free_tier ? 'text-yellow-500' : 'text-accent'}>
              <path d="M16.778 1.844v1.919q-.569-.026-1.138-.032-.708-.008-1.415.037c-1.93.126-4.023.728-6.149 2.237-2.911 2.066-2.731 1.95-4.14 2.75-.396.223-1.342.574-2.185.798-.841.225-1.753.333-1.751.333v4.229s.768.108 1.61.333c.842.224 1.789.575 2.185.799 1.41.798 1.228.683 4.14 2.75 2.126 1.509 4.22 2.11 6.148 2.236.88.058 1.716.041 2.555.005v1.918l7.222-4.168-7.222-4.17v2.176c-.86.038-1.611.065-2.278.021-1.364-.09-2.417-.357-3.979-1.465-2.244-1.593-2.866-2.027-3.68-2.508.889-.518 1.449-.906 3.822-2.59 1.56-1.109 2.614-1.377 3.978-1.466.667-.044 1.418-.017 2.278.02v2.176L24 6.014Z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-heading">OpenRouter Integrations</h2>
            <p className="text-xs text-text-muted font-medium mt-0.5">Use any model you want securely</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {!apiKey ? (
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg text-center space-y-4">
              <div className="w-12 h-12 bg-sidebar rounded-full flex items-center justify-center">
                <Link2 className="w-6 h-6 text-text-muted" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-heading">Not Connected</h3>
                <p className="text-xs text-text-muted mt-1 max-w-[250px]">
                  Connect your OpenRouter account to generate roadmaps using any AI model without giving us your API keys.
                </p>
              </div>
              <div className="w-full space-y-3">
                <button
                  onClick={handleConnect}
                  className="w-full px-6 py-2.5 bg-accent text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:opacity-90 transition-all shadow-xl shadow-accent/20"
                >
                  Create New App Key
                </button>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border"></div>
                  <div className="text-[9px] text-text-muted font-bold uppercase tracking-widest">or</div>
                  <div className="flex-1 h-px bg-border"></div>
                </div>
                <div className="w-full relative">
                  <input
                    type="password"
                    placeholder="Paste an existing API Key (sk-or-v1-...)"
                    value={manualKey}
                    onChange={(e) => setManualKey(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-sidebar border border-border rounded-lg outline-none focus:border-accent font-mono pr-16"
                  />
                  {manualKey && (
                     <button 
                       onClick={handleManualSave}
                       className="absolute right-1 top-1 bottom-1 px-3 bg-accent text-white text-[10px] uppercase font-bold tracking-widest rounded-md transition-all hover:bg-accent/90"
                     >
                       Save
                     </button>
                  )}
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-2 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest text-center">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Stored locally in browser • Never hits our backend</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between p-4 bg-accent/5 border border-accent/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-text-heading">Connected</h3>
                      <p className="text-[10px] text-text-muted">Stored safely in browser memory</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Disconnect"
                  >
                    <Unlink className="w-4 h-4" />
                  </button>
                </div>
                
                {keyInfo && (
                  <div className="flex flex-col gap-3 px-4 py-3 bg-sidebar/50 rounded-lg border border-border">
                    <div className="flex items-start justify-between w-full">
                      <div className="flex items-center gap-2 mt-0.5">
                         <Zap className={`w-3.5 h-3.5 ${keyInfo.is_free_tier ? 'text-text-muted' : 'text-yellow-500'}`} />
                         <span className="text-[10px] font-bold text-text-heading uppercase tracking-widest">
                           {keyInfo.is_free_tier ? 'Free Tier' : 'Paid Tier'}
                         </span>
                      </div>
                      {keyInfo.is_free_tier && keyInfo.rate_limit && (
                         <div className="flex flex-col gap-1 items-end">
                           <div className="text-[10px] font-medium text-text-muted">
                             Limit: {keyInfo.rate_limit.requests} reqs / {keyInfo.rate_limit.interval}
                           </div>
                           <a href="https://openrouter.ai/credits" target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-accent hover:underline flex items-center gap-1">
                             Upgrade to Paid <ExternalLink className="w-2.5 h-2.5" />
                           </a>
                         </div>
                      )}
                    </div>
                    {typeof keyInfo.limit === 'number' && typeof keyInfo.usage === 'number' && keyInfo.limit > 0 && (
                       <div className="flex flex-col gap-1.5 w-full pt-2 border-t border-border/50">
                         <div className="flex items-center justify-between text-[9px] font-medium text-text-muted">
                           <span><strong className="text-text-heading">${keyInfo.usage.toFixed(3)}</strong> consumed</span>
                           <span>${(keyInfo.limit - keyInfo.usage).toFixed(3)} remaining</span>
                         </div>
                         <div className="w-full h-1.5 bg-background border border-border rounded-full overflow-hidden">
                           <div 
                             className={`h-full rounded-full transition-all duration-500 ${(keyInfo.usage / keyInfo.limit) > 0.85 ? 'bg-red-500' : 'bg-accent'}`} 
                             style={{ width: `${Math.min(100, Math.max(0, (keyInfo.usage / keyInfo.limit) * 100))}%` }} 
                           />
                         </div>
                       </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2 relative" ref={modelDropdownRef}>
                <label className="text-xs font-bold text-text-heading uppercase tracking-widest flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" /> Model ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={isModelDropdownOpen ? modelSearch : model}
                    onFocus={() => { setIsModelDropdownOpen(true); setModelSearch(''); }}
                    onChange={(e) => {
                      setModelSearch(e.target.value);
                      setModel(e.target.value);
                    }}
                    placeholder={isLoadingModels ? "Loading available models..." : "Search or enter model ID..."}
                    className="w-full px-4 py-3 bg-callout-bg border border-border rounded-lg text-sm font-medium focus:outline-none focus:border-accent"
                  />
                  {isLoadingModels && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted animate-spin" />}
                  
                  {isModelDropdownOpen && !isLoadingModels && (
                    <div className="absolute z-50 w-full mt-1 bg-surface border border-border shadow-2xl max-h-60 overflow-y-auto no-scrollbar rounded-lg">
                      {filteredModels.map(m => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setModel(m.id);
                            setModelSearch(m.id);
                            setIsModelDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-sidebar transition-colors border-b border-border/50 last:border-0"
                        >
                          <div className="font-bold text-text-heading">{m.name || m.id}</div>
                          <div className="text-[10px] text-text-muted mt-0.5 font-mono">{m.id}</div>
                        </button>
                      ))}
                      {filteredModels.length === 0 && (
                        <div className="p-4 text-center text-sm text-text-muted">No models found. Custom ID will be used.</div>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-text-muted">Select from available OpenRouter models or type a custom ID.</p>
              </div>

              {usageHistory.length > 0 && (
                <div className="pt-4 border-t border-border mt-2">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-text-heading uppercase tracking-widest flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5" /> Generation History
                    </label>
                    <a 
                      href="https://openrouter.ai/activity" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-accent hover:underline flex items-center gap-1"
                    >
                      OpenRouter Log <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1 no-scrollbar">
                    {usageHistory.map((h, i) => (
                      <div key={i} className="p-3 bg-sidebar rounded-lg border border-border/50 text-xs flex justify-between items-center">
                        <div className="truncate pr-2">
                          <div className="font-bold text-text-heading truncate">{h.subject}</div>
                          <div className="text-[9px] font-mono text-text-muted mt-0.5">{h.model}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-bold text-accent">{h.total_tokens.toLocaleString()} tokens</div>
                          <div className="text-[9px] text-text-muted">{new Date(h.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={handleSave}
            disabled={!apiKey}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-text-heading text-background font-bold text-xs uppercase tracking-widest rounded-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-xl"
          >
            <CheckCircle2 className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
