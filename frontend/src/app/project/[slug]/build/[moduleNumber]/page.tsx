"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { roadmapsAPI, submissionsAPI } from '@/lib/api';
import { ChevronLeft, Rocket, Shield, Info, CheckCircle, ExternalLink, Github, FileText, Layout, Plus, Sparkles, User as UserIcon, Code, Palette, Search, AlertCircle, X } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

// Modular Components
import MissionSidecar from '@/components/buildpilot/MissionSidecar';
import CodePilot from '@/components/buildpilot/tools/CodePilot';
import ResearchPilot from '@/components/buildpilot/tools/ResearchPilot';
import DesignPilot from '@/components/buildpilot/tools/DesignPilot';

function SearchParamsHandler({ onParams }: { onParams: (params: URLSearchParams) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    onParams(searchParams);
  }, [searchParams, onParams]);
  return null;
}

export default function BuildPilotPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const moduleNumber = parseInt(params.moduleNumber as string);

  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  
  // Workspace States
  const [markdown, setMarkdown] = useState('');
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [workspaceType, setWorkspaceType] = useState<'code' | 'research' | 'design'>('code');

  // URL Auth Errors
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSearchParams = (searchParams: URLSearchParams) => {
    const errorCode = searchParams.get('error_code');
    if (errorCode === 'identity_already_exists') {
      setAuthError("This GitHub account is already linked to another EulerFold user. Please use a different GitHub account or contact support.");
      // Clean up the URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    } else if (searchParams.get('error')) {
      setAuthError(searchParams.get('error_description') || "An error occurred during authentication.");
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  };

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push(`/project/${slug}`);
        return;
      }
      setUser(session.user);

      try {
        const data = await roadmapsAPI.getRoadmapBySlug(slug);
        setRoadmap(data);
        
        if (data.roadmap_plan?.modules[moduleNumber - 1]) {
          // Default to code as per user preference
          setWorkspaceType('code');
        }
        
        // Load draft from localStorage
        const draftKey = `buildpilot_draft_${slug}_${moduleNumber}`;
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
          setMarkdown(savedDraft);
          setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load roadmap');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [slug, moduleNumber, router]);

  const handleSaveResearch = (content: string) => {
    setMarkdown(content);
    localStorage.setItem(`buildpilot_draft_${slug}_${moduleNumber}`, content);
    setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const handleSubmit = async () => {
    const activeModule = roadmap.roadmap_plan?.modules[moduleNumber - 1];
    const type = activeModule?.workspace_type || 'research';

    if (type === 'research' && (!markdown || markdown.length < 50)) {
      alert("Please write at least 50 characters for a quality audit.");
      return;
    }
    if (type === 'code' && !selectedCommit) {
      alert("Please provide a GitHub repository URL to submit for audit.");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const payload = {
        roadmap_id: roadmap.id,
        module_number: moduleNumber,
        description: type === 'code' ? `Code submission for verification: ${selectedCommit}` : markdown,
        link: type === 'code' ? selectedCommit : '',
        files: []
      };

      await submissionsAPI.createSubmission(payload, session.access_token);

      // Clear draft on success
      localStorage.removeItem(`buildpilot_draft_${slug}_${moduleNumber}`);
      router.push(`/project/${slug}?success=true`);
    } catch (err: any) {
      alert(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-teal-700/10 border-t-teal-700 rounded-full animate-spin" />
          <Rocket className="w-5 h-5 text-teal-700 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="text-center">
           <p className="inconsolata-ui text-[11px] font-bold text-text-heading uppercase tracking-widest mb-1">Connecting</p>
           <p className="manrope-body text-[11px] text-text-muted italic">Establishing secure workspace...</p>
        </div>
      </div>
    </div>
  );

  if (error || !roadmap) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8 text-center">
      <div className="max-w-md">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-none border border-red-500/20 flex items-center justify-center mx-auto mb-6">
           <Shield className="w-8 h-8" />
        </div>
        <h2 className="inconsolata-ui text-xl font-bold text-text-heading mb-3 tracking-tight">Access Restricted</h2>
        <p className="manrope-body text-text-muted mb-8 text-[14px] leading-relaxed">
           We couldn't establish a secure connection to this module. {error || 'Please verify your credentials.'}
        </p>
        <Link href={`/project/${slug}`} className="inline-flex items-center gap-2 px-6 py-3 bg-teal-700 text-white rounded-none inconsolata-ui text-[11px] font-bold tracking-widest uppercase hover:opacity-90 transition-all shadow-lg shadow-teal-700/20">
          <ChevronLeft className="w-4 h-4" />
          Return to Project
        </Link>
      </div>
    </div>
  );

  const activeModule = roadmap.roadmap_plan?.modules[moduleNumber - 1];
  if (!activeModule) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8 text-center">
        <p className="manrope-body text-text-muted">Module not found</p>
      </div>
    );
  }

  return (
    <div 
      className="h-screen bg-background flex flex-col overflow-hidden text-text-primary manrope-body"
      style={{ paddingTop: 'var(--announcement-height, 0px)' }}
    >
      {/* Professional Navbar */}
      <header className="h-9 border-b border-border flex items-center justify-between px-6 bg-background z-[60] shrink-0">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity active:scale-95 duration-200">
            <img src="/apple-touch-icon.png" alt="" className="w-4 h-4" />
            <span className="text-[13px] font-bold text-text-heading tracking-tight hidden md:block">Euler<span className="text-teal-700">Fold</span></span>
          </Link>

          <div className="h-3 w-[1px] bg-border hidden md:block" />
        </div>

        <div className="flex items-center gap-3">
           {lastSaved && (
             <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-sidebar/30 border border-border rounded-none">
                <div className="w-1 h-1 bg-teal-500 rounded-full animate-pulse" />
                <span className="inconsolata-ui text-[8px] font-bold text-text-muted uppercase tracking-wider">Synced {lastSaved}</span>
             </div>
           )}
           <div className="h-5 w-[1px] bg-border mx-1" />
           <Link href={`/project/${slug}`} className="p-1.5 hover:bg-sidebar transition-colors text-text-muted hover:text-text-heading">
             <ChevronLeft className="w-3.5 h-3.5" />
           </Link>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <Suspense fallback={null}>
          <SearchParamsHandler onParams={handleSearchParams} />
        </Suspense>

        <MissionSidecar 
          module={activeModule} 
          onSubmit={handleSubmit}
          submitting={submitting}
        />

        <main className="flex-1 bg-background relative flex flex-col min-w-0">
          {authError && (
            <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-1.5 flex items-center justify-between animate-in slide-in-from-top duration-300">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-3 h-3 text-red-500" />
                <p className="manrope-body text-[11px] font-medium text-red-600">{authError}</p>
              </div>
              <button 
                onClick={() => setAuthError(null)}
                className="text-red-500 hover:text-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Internal Workspace Header */}
          <div className="h-8 border-b border-border flex items-center justify-between px-6 shrink-0 bg-background">
             <div className="flex items-center gap-6">
                <div className="flex items-center bg-sidebar/80 p-0.5 border border-border rounded-none">
                  {[
                    { id: 'code', icon: Code, label: 'Code' },
                    { id: 'research', icon: Search, label: 'Editor' },
                    { id: 'design', icon: Palette, label: 'Design' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setWorkspaceType(type.id as any)}
                      className={`
                        flex items-center gap-2 px-2.5 py-0.5 inconsolata-ui text-[9px] font-bold uppercase tracking-widest transition-all
                        ${workspaceType === type.id 
                          ? 'bg-background text-teal-700 shadow-sm border border-border/50' 
                          : 'text-text-muted hover:text-text-heading hover:bg-background/40'}
                      `}
                    >
                      <type.icon className={`w-2.5 h-2.5 ${workspaceType === type.id ? 'text-teal-700' : 'opacity-40'}`} />
                      <span className="hidden lg:block">{type.label}</span>
                    </button>
                  ))}
                </div>
             </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
             {workspaceType === 'code' && (
               <CodePilot 
                 roadmapSlug={slug} 
                 moduleNumber={moduleNumber} 
                 onCommitSelect={setSelectedCommit} 
               />
             )}
             
             {workspaceType === 'research' && (
               <ResearchPilot 
                 initialContent={markdown} 
                 onSave={handleSaveResearch} 
                 lastSaved={lastSaved}
               />
             )}

             {workspaceType === 'design' && (
               <DesignPilot moduleTitle={activeModule.title} />
             )}
          </div>
        </main>
      </div>
    </div>
  );
}

// Add simple RefreshCw icon for loading state
function RefreshCw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  )
}
