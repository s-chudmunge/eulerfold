'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Save,
  ExternalLink,
  ShieldCheck,
  Settings,
  Github,
  Globe,
  Loader2,
  ChevronRight,
  Zap,
  History,
  Cpu,
  Unlink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase/client';
import { authAPI, profileAPI, api } from '@/lib/api';
import { useSettings } from './SettingsProvider';
import Link from 'next/link';
import { LocalAIModal } from './landing/LocalAIModal';

type TabId = 'general' | 'appearance' | 'connections' | 'usage' | 'account';

export default function SettingsModal() {
  const { isOpen, closeSettings } = useSettings();
  const { user: authUser, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [profile, setProfile] = useState<any>(null);
  const [identities, setIdentities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [openRouterKey, setOpenRouterKey] = useState<string | null>(null);
  const [openRouterModel, setOpenRouterModel] = useState<string>('openai/gpt-4o');
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [usageHistory, setUsageHistory] = useState<any[]>([]);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);
  const [keyInfo, setKeyInfo] = useState<any>(null);
  
  const [localAIModelId, setLocalAIModelId] = useState<string | null>(null);
  const [localAIModelName, setLocalAIModelName] = useState<string | null>(null);
  const [isLocalAIModalOpen, setIsLocalAIModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      async function getIdentities() {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.identities) {
          setIdentities(user.identities);
        }
      }
      getIdentities();

      // Check initial theme
      if (document.documentElement.classList.contains('dark')) {
        setTheme('dark');
      } else {
        setTheme('light');
      }
      
      const key = localStorage.getItem('openRouterKey');
      setOpenRouterKey(key);
      const savedModel = localStorage.getItem('openRouterModel') || 'openai/gpt-4o';
      setOpenRouterModel(savedModel);

      setLocalAIModelId(localStorage.getItem('localAIModelId'));
      setLocalAIModelName(localStorage.getItem('localAIModelName'));

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
        
        fetch("https://openrouter.ai/api/v1/models")
          .then(res => res.json())
          .then(data => {
            if (data && data.data) {
              setAvailableModels(data.data);
            }
          })
          .catch(console.error);
      }
      try {
        const history = JSON.parse(localStorage.getItem('openRouterUsageHistory') || '[]');
        setUsageHistory(history);
      } catch (e) {}
    }
  }, [isOpen]);

  useEffect(() => {
    if (authUser && isOpen) {
      setProfile(authUser);
      setDisplayName(authUser.display_name || '');
      setUsername(authUser.username || '');
      setEmail(authUser.email || '');
      setLoading(false);
      
      setIsLoadingUsage(true);
      api.get('/ai-usage?limit=100')
        .then(res => {
          if (res.data) setUsageHistory(res.data);
        })
        .catch(e => console.error("Failed to load usage history", e))
        .finally(() => setIsLoadingUsage(false));
    }
  }, [authUser, isOpen]);

  const handleLinkGithub = async () => {
    try {
      const { error } = await supabase.auth.linkIdentity({
        provider: 'github',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to link GitHub.' });
    }
  };

  const toggleTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('eulerfold-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: displayName }
      });
      if (authError) throw authError;

      await authAPI.updateProfile({
        display_name: displayName,
        username: username
      });

      setMessage({ type: 'success', text: 'Settings saved successfully.' });
      setTimeout(() => setMessage(null), 4000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.detail || error.message || 'Failed to sync changes.' });
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: 'general', label: 'General', icon: UserIcon },
    { id: 'appearance', label: 'Appearance', icon: Settings },
    { id: 'connections', label: 'Connections', icon: Globe },
    { id: 'usage', label: 'Usage', icon: Zap },
    { id: 'account', label: 'Account', icon: Trash2 },
  ];

  const renderContent = () => {
    if (!authUser && !authLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-20 text-center px-6">
          <ShieldCheck className="h-12 w-12 text-text-muted opacity-20 mb-6" />
          <h2 className="inconsolata-ui text-[16px] font-bold text-text-heading mb-2">Authentication Required</h2>
          <p className="manrope-body text-[12px] text-text-muted italic opacity-60 mb-8 max-w-xs">
            Please sign in to access and manage your system settings.
          </p>
          <Link 
            href="/login" 
            onClick={closeSettings}
            className="inconsolata-ui px-6 py-2 bg-text-heading text-background text-[11px] font-bold tracking-wide rounded-lg hover:opacity-90 transition-all uppercase"
          >
            Sign in
          </Link>
        </div>
      );
    }

    if (loading && !profile) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-20">
          <Loader2 className="h-6 w-6 text-accent animate-spin mb-4" />
          <p className="inconsolata-ui text-[11px] font-bold text-text-muted tracking-wide">Accessing system settings...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="pb-2 border-b border-border/50">
              <h2 className="inconsolata-ui text-[14px] font-bold tracking-tight text-text-heading">IDENTITY</h2>
              <p className="manrope-body text-[11px] text-text-muted italic opacity-60">Manage your public presence and account details.</p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="inconsolata-ui block text-[10px] font-bold tracking-wide text-text-muted opacity-60 uppercase">
                    Display name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-[13px] font-bold text-text-heading outline-none focus:border-accent transition-all"
                    placeholder="Enter full name"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="inconsolata-ui block text-[10px] font-bold tracking-wide text-text-muted opacity-60 uppercase">
                    Handle
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-bold inconsolata-ui opacity-40">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-lg text-[13px] font-bold text-text-heading outline-none focus:border-accent transition-all"
                      placeholder="username"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="inconsolata-ui block text-[10px] font-bold tracking-wide text-text-muted opacity-60 uppercase">
                    System email
                  </label>
                  <div className="flex items-center gap-3 px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-[12px] text-text-muted font-medium italic">
                    <Mail className="h-3.5 w-3.5 opacity-30" />
                    <span className="inconsolata-ui">{email}</span>
                    <ShieldCheck className="h-3.5 w-3.5 ml-auto text-accent opacity-30" />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                {username && (
                    <Link 
                      href={`/u/${username}`} 
                      onClick={closeSettings}
                      className="inconsolata-ui text-[10px] font-bold text-accent hover:underline tracking-wide flex items-center gap-1.5"
                    >
                      View public profile <ExternalLink className="h-3 w-3" />
                    </Link>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="inconsolata-ui inline-flex items-center gap-2 px-5 py-2 bg-text-heading text-background text-[11px] font-bold tracking-wide rounded-lg hover:opacity-90 transition-all disabled:opacity-50 uppercase"
                >
                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                  {saving ? 'Syncing...' : 'Apply changes'}
                </button>
              </div>
            </form>
          </div>
        );
      case 'appearance':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="pb-2 border-b border-border/50">
              <h2 className="inconsolata-ui text-[14px] font-bold tracking-tight text-text-heading">APPEARANCE</h2>
              <p className="manrope-body text-[11px] text-text-muted italic opacity-60">Visual environment preference.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-6 p-4 bg-background border border-border rounded-xl">
                <div className="space-y-0.5">
                  <h3 className="inconsolata-ui text-[12px] font-bold text-text-heading">System Theme</h3>
                  <p className="manrope-body text-[10px] text-text-muted italic opacity-60">Visual environment preference.</p>
                </div>
                
                <div className="flex bg-sidebar p-1 rounded-lg border border-border">
                  <button
                    onClick={() => toggleTheme('light')}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold inconsolata-ui transition-all ${
                      theme === 'light' 
                        ? 'bg-text-heading text-background shadow-sm' 
                        : 'text-text-muted hover:text-text-heading'
                    }`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => toggleTheme('dark')}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold inconsolata-ui transition-all ${
                      theme === 'dark' 
                        ? 'bg-text-heading text-background shadow-sm' 
                        : 'text-text-muted hover:text-text-heading'
                    }`}
                  >
                    Dark
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'connections':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="pb-2 border-b border-border/50">
              <h2 className="inconsolata-ui text-[14px] font-bold tracking-tight text-text-heading">CONNECTIONS</h2>
              <p className="manrope-body text-[11px] text-text-muted italic opacity-60">Connect your account with external services.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-6 p-4 bg-background border border-border rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-sidebar border border-border rounded-lg flex items-center justify-center">
                    <Github className="w-4 h-4 text-text-heading" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="inconsolata-ui text-[12px] font-bold text-text-heading">GitHub</h3>
                    <p className="manrope-body text-[10px] text-text-muted italic opacity-60">
                      Connect your GitHub account.
                    </p>
                  </div>
                </div>
                
                {identities.some(id => id.provider === 'github') ? (
                  <div className="flex flex-col items-end gap-1">
                    <div className="px-3 py-1 rounded-md text-[10px] font-bold inconsolata-ui bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 uppercase">
                      Active
                    </div>
                    <span className="text-[9px] font-bold text-text-muted opacity-50 uppercase">Connected</span>
                  </div>
                ) : (
                  <button
                    onClick={handleLinkGithub}
                    className="px-4 py-1.5 rounded-md text-[10px] font-bold inconsolata-ui bg-text-heading text-background hover:opacity-90 transition-all uppercase"
                  >
                    Connect
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between gap-6 p-4 bg-background border border-border rounded-xl">
                <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${keyInfo && !keyInfo.is_free_tier ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-sidebar border-border'}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={keyInfo && !keyInfo.is_free_tier ? 'text-yellow-500' : 'text-text-heading'}>
                      <path d="M16.778 1.844v1.919q-.569-.026-1.138-.032-.708-.008-1.415.037c-1.93.126-4.023.728-6.149 2.237-2.911 2.066-2.731 1.95-4.14 2.75-.396.223-1.342.574-2.185.798-.841.225-1.753.333-1.751.333v4.229s.768.108 1.61.333c.842.224 1.789.575 2.185.799 1.41.798 1.228.683 4.14 2.75 2.126 1.509 4.22 2.11 6.148 2.236.88.058 1.716.041 2.555.005v1.918l7.222-4.168-7.222-4.17v2.176c-.86.038-1.611.065-2.278.021-1.364-.09-2.417-.357-3.979-1.465-2.244-1.593-2.866-2.027-3.68-2.508.889-.518 1.449-.906 3.822-2.59 1.56-1.109 2.614-1.377 3.978-1.466.667-.044 1.418-.017 2.278.02v2.176L24 6.014Z"/>
                    </svg>
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="inconsolata-ui text-[12px] font-bold text-text-heading">OpenRouter</h3>
                    <p className="manrope-body text-[10px] text-text-muted italic opacity-60">
                      Bring Your Own Key for AI generation.
                    </p>
                  </div>
                </div>
                
                {openRouterKey ? (
                  <div className="flex flex-col items-end gap-1.5 w-full">
                    <div className="flex items-center gap-2">
                       {keyInfo && (
                          <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${keyInfo.is_free_tier ? 'bg-sidebar text-text-muted border-border' : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'}`}>
                            {keyInfo.is_free_tier ? 'Free Tier' : 'Paid Tier'}
                          </div>
                       )}
                       <div className="px-3 py-1 rounded-md text-[10px] font-bold inconsolata-ui bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 uppercase">
                         Active
                       </div>
                    </div>
                    {keyInfo?.is_free_tier && (
                       <a href="https://openrouter.ai/credits" target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-accent hover:underline flex items-center gap-1 mb-2">
                         Upgrade to Paid <ExternalLink className="w-2.5 h-2.5" />
                       </a>
                    )}
                    
                    <div className="w-full mt-2 pt-3 border-t border-border/50 text-left">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-1.5">Preferred Default Model</label>
                      <select 
                        value={openRouterModel} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setOpenRouterModel(val);
                          localStorage.setItem('openRouterModel', val);
                        }}
                        className="w-full bg-sidebar border border-border rounded-lg px-3 py-2 text-[11px] font-bold text-text-heading outline-none focus:border-accent transition-colors"
                      >
                        {availableModels.length > 0 ? availableModels.map(m => (
                          <option key={m.id} value={m.id}>{m.name || m.id}</option>
                        )) : (
                          <option value={openRouterModel}>{openRouterModel} (Loading...)</option>
                        )}
                      </select>
                    </div>

                    <button 
                      onClick={() => { localStorage.removeItem('openRouterKey'); setOpenRouterKey(null); setKeyInfo(null); }}
                      className="text-[9px] font-bold text-red-500 hover:underline uppercase mt-3"
                    >
                      Disconnect OpenRouter
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      const callbackUrl = encodeURIComponent(window.location.origin + "/auth/openrouter");
                      window.location.href = `https://openrouter.ai/auth?callback_url=${callbackUrl}`;
                    }}
                    className="px-4 py-1.5 rounded-md text-[10px] font-bold inconsolata-ui bg-text-heading text-background hover:opacity-90 transition-all uppercase"
                  >
                    Connect
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between gap-6 p-4 bg-background border border-border rounded-xl">
                <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${localAIModelId ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-sidebar border-border'}`}>
                    <Cpu className={localAIModelId ? 'w-4 h-4 text-emerald-500' : 'w-4 h-4 text-text-heading'} />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="inconsolata-ui text-[12px] font-bold text-text-heading">Local AI</h3>
                    <p className="manrope-body text-[10px] text-text-muted italic opacity-60">
                      Run models privately on your hardware via WebGPU.
                    </p>
                  </div>
                </div>
                
                {localAIModelId ? (
                  <div className="flex flex-col items-end gap-1.5 w-full">
                    <div className="px-3 py-1 rounded-md text-[10px] font-bold inconsolata-ui bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 uppercase mb-2">
                      Connected
                    </div>
                    
                    <div className="w-full pt-3 border-t border-border/50 text-left">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-1.5">Selected Model</label>
                      <div className="w-full bg-sidebar border border-border rounded-lg px-3 py-2 text-[11px] font-bold text-text-heading outline-none">
                        {localAIModelName || localAIModelId}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      <button 
                        onClick={() => { localStorage.removeItem('localAIModelId'); localStorage.removeItem('localAIModelName'); setLocalAIModelId(null); setLocalAIModelName(null); }}
                        className="text-[9px] font-bold text-red-500 hover:underline uppercase"
                      >
                        Disconnect
                      </button>
                      <button
                        onClick={() => setIsLocalAIModalOpen(true)}
                        className="text-[9px] font-bold text-text-heading hover:text-accent hover:underline uppercase"
                      >
                        Change Model
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsLocalAIModalOpen(true)}
                    className="px-4 py-1.5 rounded-md text-[10px] font-bold inconsolata-ui bg-text-heading text-background hover:opacity-90 transition-all uppercase"
                  >
                    Configure
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      case 'usage':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="pb-2 border-b border-border/50 flex items-center justify-between">
              <div>
                <h2 className="inconsolata-ui text-[14px] font-bold tracking-tight text-text-heading">EXTERNAL AI USAGE</h2>
                <p className="manrope-body text-[11px] text-text-muted italic opacity-60">Your OpenRouter and Local AI generation history.</p>
              </div>
              <a href="https://openrouter.ai/activity" target="_blank" rel="noopener noreferrer" className="inconsolata-ui text-[10px] font-bold text-accent hover:underline flex items-center gap-1.5">
                Full Log <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {isLoadingUsage ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-background border border-border/50 rounded-xl shadow-sm animate-pulse">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="h-4 bg-border/40 rounded w-2/3 mb-2"></div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <div className="h-3 bg-border/40 rounded w-20"></div>
                        <div className="h-3 bg-border/40 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      <div className="h-4 bg-border/40 rounded w-16 mb-1"></div>
                      <div className="h-3 bg-border/40 rounded w-12"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : usageHistory.length === 0 ? (
              <div className="p-8 text-center bg-sidebar/50 rounded-xl border border-border">
                <History className="w-8 h-8 text-text-muted mx-auto mb-3 opacity-20" />
                <p className="inconsolata-ui text-[12px] font-bold text-text-heading">No usage history found</p>
                <p className="manrope-body text-[11px] text-text-muted mt-1">Generations made using OpenRouter or Local AI will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {usageHistory.map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-background border border-border/50 rounded-xl shadow-sm">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="text-[13px] font-bold text-text-heading line-clamp-2 mb-1">{h.subject}</div>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border truncate ${
                          (h.model || h.model_name || '').includes('gemini') 
                            ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' 
                            : (h.model || h.model_name || '').includes('/') 
                              ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' 
                              : 'bg-teal-500/10 text-teal-600 border-teal-500/20'
                        }`}>{h.model || h.model_name}</span>
                        <span className="text-[10px] text-text-muted italic whitespace-nowrap">{new Date(h.created_at || h.date).toLocaleDateString()} {new Date(h.created_at || h.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        {(h.model || h.model_name) && (h.model || h.model_name).includes('/') && (
                          <a href="https://openrouter.ai/activity" target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent hover:underline flex items-center gap-1">
                            <ExternalLink className="w-2.5 h-2.5" /> OpenRouter Logs
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      <div className="text-[12px] font-black text-accent tracking-tight">{h.total_tokens.toLocaleString()} <span className="text-[9px] font-bold uppercase opacity-60">tokens</span></div>
                      <div className="text-[9px] text-text-muted flex gap-2">
                        <span title="Prompt Tokens">P: {h.prompt_tokens.toLocaleString()}</span>
                        <span title="Completion Tokens">C: {h.completion_tokens.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'account':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="pb-2 border-b border-red-500/10">
              <h2 className="inconsolata-ui text-[14px] font-bold tracking-tight text-red-500/80">TERMINATION</h2>
              <p className="manrope-body text-[11px] text-text-muted italic opacity-60">Danger zone actions for your account.</p>
            </div>

            <div className="p-5 bg-red-500/[0.02] border border-red-500/10 rounded-xl">
              <h3 className="inconsolata-ui text-[12px] font-bold text-red-600 tracking-tight mb-1">Purge intelligence</h3>
              <p className="manrope-body text-[11px] text-text-muted mb-4 leading-relaxed italic opacity-80">
                Permanently erase identity and history. Non-reversible.
              </p>
              <button
                className="inconsolata-ui text-[10px] font-bold text-red-600/80 hover:text-red-600 tracking-wide underline underline-offset-4 transition-colors uppercase"
                onClick={async () => {
                  if (confirm('CRITICAL: This will permanently delete your account and all learning data. This cannot be undone. Proceed?')) {
                    try {
                      await profileAPI.deleteProfile();
                      await supabase.auth.signOut();
                      window.location.href = '/';
                    } catch (err) {
                      alert('Purge failed. Please contact eulerfold@gmail.com');
                    }
                  }
                }}
              >
                Request data purge
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 md:p-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSettings}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[800px] h-full max-h-[600px] bg-sidebar border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col md:flex-row"
          >
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-sidebar/50">
              <h1 className="inconsolata-ui text-[14px] font-black tracking-tighter">SETTINGS</h1>
              <button onClick={closeSettings} className="p-1 hover:bg-border rounded-lg transition-colors">
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>

            {/* Sidebar */}
            <div className="w-full md:w-[240px] border-r border-border bg-sidebar/50 flex flex-col">
              <div className="hidden md:flex items-center justify-between p-6 border-b border-border/50">
                <span className="inconsolata-ui text-[12px] font-black tracking-tighter opacity-40">SYSTEM v0.1.1</span>
              </div>
              
              <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                        isActive 
                          ? 'bg-background border border-border text-text-heading shadow-sm' 
                          : 'text-text-muted hover:text-text-heading hover:bg-background/50 border border-transparent'
                      }`}
                    >
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-accent' : 'opacity-60 group-hover:opacity-100'}`} />
                      <span className="inconsolata-ui text-[13px] font-bold tracking-tight">{tab.label}</span>
                      {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-40" />}
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-border/50 hidden md:block">
                <div className="flex items-center gap-3 p-2 rounded-xl bg-background/40 border border-border/50">
                  <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center overflow-hidden">
                    <img 
                      src={(profile?.avatar_url?.includes('initials') ? null : profile?.avatar_url) || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(displayName || username || 'User')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="manrope-body text-[11px] font-bold text-text-heading truncate">{displayName || 'User'}</p>
                    <p className="inconsolata-ui text-[9px] text-text-muted truncate">@{username || 'handle'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-background/20 overflow-hidden relative">
              <div className="hidden md:flex items-center p-4 absolute top-0 left-0 z-10">
                <button 
                  onClick={closeSettings} 
                  className="p-1.5 hover:bg-border rounded-lg transition-all text-text-muted hover:text-text-heading group"
                >
                  <X className="w-5 h-5 transition-transform group-hover:scale-110" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 pt-6 md:pt-16">
                  {message && (
                    <div className={`mb-6 p-3 rounded-xl flex items-center gap-3 text-[12px] font-bold inconsolata-ui animate-in fade-in slide-in-from-top-2 duration-300 ${
                      message.type === 'success' 
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {message.type === 'success' ? <CheckCircle className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                      <span>{message.text}</span>
                    </div>
                  )}
                  
                  {renderContent()}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <LocalAIModal
        isOpen={isLocalAIModalOpen}
        onClose={() => setIsLocalAIModalOpen(false)}
        onSelectModel={(modelId, modelName) => {
          localStorage.setItem('localAIModelId', modelId);
          localStorage.setItem('localAIModelName', modelName);
          setLocalAIModelId(modelId);
          setLocalAIModelName(modelName);
        }}
      />
    </>
  );
}
