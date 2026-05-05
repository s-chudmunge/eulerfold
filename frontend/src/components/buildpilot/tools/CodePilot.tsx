"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Github, 
  ExternalLink, 
  RefreshCw, 
  Link as LinkIcon, 
  Info, 
  AlertCircle, 
  Terminal, 
  GitCommit, 
  Folder, 
  File, 
  CheckCircle2, 
  ArrowUpRight,
  Code2,
  Plus
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

interface CodePilotProps {
  roadmapSlug: string;
  moduleNumber: number;
  onCommitSelect: (url: string) => void;
}

interface Commit {
  sha: string;
  commit: {
    message: string;
    author: {
      date: string;
    };
  };
}

const CodePilot: React.FC<CodePilotProps> = ({ roadmapSlug, moduleNumber, onCommitSelect }) => {
  const { user } = useAuth();
  const [repoUrl, setRepoUrl] = useState('');
  const [isUrlValid, setIsUrlValid] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [repoData, setRepoData] = useState<{ commits: any[], files: any[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRepoData = useCallback(async (url: string) => {
    if (!url.startsWith('https://github.com/')) return;
    
    setSyncing(true);
    setError(null);
    try {
      // Clean the URL: remove protocol, then strip trailing slash, then strip .git
      let path = url.replace('https://github.com/', '').replace(/\/$/, '');
      if (path.endsWith('.git')) {
        path = path.substring(0, path.length - 4);
      }
      
      const parts = path.split('/');
      const owner = parts[0];
      const repo = parts[1];
      
      if (!owner || !repo) throw new Error("Invalid repository path");

      // Fetch commits and contents in parallel with cache busting
      const timestamp = new Date().getTime();
      const [commitsRes, contentsRes] = await Promise.all([
        fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=5&t=${timestamp}`),
        fetch(`https://api.github.com/repos/${owner}/${repo}/contents?t=${timestamp}`)
      ]);

      let commits = [];
      let contents = [];

      if (commitsRes.ok) {
        commits = await commitsRes.json();
      } else if (commitsRes.status === 409 || commitsRes.status === 404) {
        // Repo exists but is empty
        commits = [];
      } else {
        throw new Error("Could not reach repository. Verify it is Public and the URL is correct.");
      }
      
      if (contentsRes.ok) {
        contents = await contentsRes.json();
      }

      setRepoData({
        commits: Array.isArray(commits) ? commits : [],
        files: Array.isArray(contents) ? contents : []
      });
    } catch (err: any) {
      setError(err.message);
      setRepoData(null);
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(`buildpilot_repo_${roadmapSlug}_${moduleNumber}`);
    if (saved) {
      setRepoUrl(saved);
      onCommitSelect(saved);
      fetchRepoData(saved);
    }
  }, [roadmapSlug, moduleNumber, onCommitSelect, fetchRepoData]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRepoUrl(val);
    const isValid = val === '' || val.startsWith('https://github.com/');
    setIsUrlValid(isValid);
  };

  const handleConnect = () => {
    if (isUrlValid && repoUrl !== '') {
      onCommitSelect(repoUrl);
      localStorage.setItem(`buildpilot_repo_${roadmapSlug}_${moduleNumber}`, repoUrl);
      fetchRepoData(repoUrl);
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  // Pre-filled GitHub URL for creating a new repo
  const createRepoUrl = `https://github.com/new?name=eulerfold-${roadmapSlug}-m${moduleNumber}&description=EulerFold Build: ${roadmapSlug.replace(/-/g, ' ')}&visibility=public`;

  if (!repoData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-start pt-12 p-8 animate-in fade-in duration-500 bg-background overflow-y-auto no-scrollbar">
        <div className="max-w-xl w-full">
          <div className="bg-header border border-border p-8 space-y-8 shadow-sm">
            <div className="space-y-6">
               <div className="p-4 bg-teal-700/5 border border-teal-700/20 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0">
                     <Plus className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                     <p className="text-[13px] font-bold text-text-heading mb-1">Step 1: Create GitHub Repository</p>
                     <p className="text-[12px] text-text-muted leading-relaxed mb-4">Click below to create a new repository on GitHub with pre-filled details.</p>
                     <a 
                       href={createRepoUrl} 
                       target="_blank" 
                       className="inline-flex items-center gap-2 px-4 py-2 bg-background border border-border text-[11px] font-bold uppercase tracking-widest text-text-heading hover:bg-sidebar transition-all"
                     >
                       Go to GitHub <ArrowUpRight className="w-3.5 h-3.5" />
                     </a>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="inconsolata-ui text-[10px] font-black uppercase tracking-[0.2em] text-text-heading">Step 2: Link Repository URL</label>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <LinkIcon className={`w-4 h-4 ${repoUrl ? 'text-teal-700' : 'text-text-muted opacity-40'}`} />
                      </div>
                      <input 
                        type="text"
                        value={repoUrl}
                        onChange={handleUrlChange}
                        placeholder="https://github.com/username/repo"
                        className={`w-full pl-11 pr-4 py-3 bg-sidebar/30 border manrope-body text-[14px] font-bold focus:outline-none transition-all ${!isUrlValid ? 'border-red-500/50' : 'border-border focus:border-teal-700'}`}
                      />
                    </div>
                    <button 
                      onClick={handleConnect}
                      disabled={syncing || !repoUrl || !isUrlValid}
                      className="px-6 bg-teal-700 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-teal-800 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Connect'}
                    </button>
                  </div>
                  {error && (
                    <p className="text-[11px] font-bold text-red-500 flex items-center gap-2 animate-in fade-in duration-200">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {error}
                    </p>
                  )}
               </div>
            </div>

            <div className="p-5 bg-sidebar/40 border border-border flex items-start gap-4">
              <div className="mt-1">
                <Info className="w-4 h-4 text-teal-700 opacity-60" />
              </div>
              <div className="space-y-2">
                <p className="text-[12px] font-bold text-text-heading leading-tight">Public Repository Required</p>
                <p className="text-[11px] text-text-muted leading-relaxed italic">
                  For automated verification, your repository must be set to <span className="text-text-heading font-bold not-italic">Public</span> so our Audit Senate can pull your code for review.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background text-text-primary overflow-hidden animate-in fade-in duration-300">
      {/* Repository Header */}
      <div className="h-9 bg-sidebar/20 border-b border-border flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[12px] font-bold inconsolata-ui">
            <Github className="w-3.5 h-3.5 opacity-40" />
            <span className="text-teal-700">{repoUrl.replace('https://github.com/', '').split('/')[0]}</span>
            <span className="text-text-muted opacity-40">/</span>
            <span className="text-text-heading">{repoUrl.replace('https://github.com/', '').split('/')[1]}</span>
          </div>
          <div className="px-1.5 py-0.5 border border-border text-[8px] text-text-muted font-black uppercase tracking-widest inconsolata-ui bg-background">
            Connected
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchRepoData(repoUrl)}
            disabled={syncing}
            className="p-1.5 hover:bg-sidebar transition-colors text-text-muted hover:text-teal-700"
            title="Sync with GitHub"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          </button>
          <div className="h-5 w-[1px] bg-border mx-1" />
          
          <div className="flex items-center bg-sidebar/30 border border-border p-0.5">
             <a 
               href={`cursor://vscode.git/clone?url=${repoUrl}`}
               className="flex items-center gap-2 px-3 py-1 hover:bg-background text-[9px] font-bold text-text-heading transition-all inconsolata-ui uppercase tracking-widest border-r border-border"
             >
               <Terminal className="w-3 h-3 opacity-60" />
               Cursor
             </a>
             <a 
               target="_blank"
               href={repoUrl}
               className="flex items-center gap-2 px-3 py-1 hover:bg-background text-[9px] font-bold text-text-heading transition-all inconsolata-ui uppercase tracking-widest"
             >
               <Github className="w-3 h-3 opacity-60" />
               View
             </a>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* File Explorer (Real) */}
        <aside className="w-56 border-r border-border bg-sidebar/10 hidden md:block overflow-y-auto no-scrollbar">
           <div className="p-3 border-b border-border bg-background/50 sticky top-0 z-10">
              <span className="text-[9px] font-black text-text-muted uppercase tracking-widest inconsolata-ui opacity-60">Directory</span>
           </div>
           <div className="p-2 space-y-0.5">
              {repoData.files.map((file: any) => (
                <div key={file.path} className="flex items-center gap-2 px-2 py-1 hover:bg-sidebar cursor-default text-[12px] transition-colors group">
                  {file.type === 'dir' ? (
                    <Folder className="w-3 h-3 text-teal-700 opacity-60" />
                  ) : (
                    <File className="w-3 h-3 text-text-muted opacity-40" />
                  )}
                  <span className="manrope-body font-medium text-[12px] truncate">{file.name}</span>
                </div>
              ))}
              {repoData.files.length === 0 && (
                <p className="p-4 text-center text-[10px] text-text-muted italic">No files found.</p>
              )}
           </div>
        </aside>

        {/* Commit History (Real) */}
        <main className="flex-1 overflow-y-auto no-scrollbar p-6">
           <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="inconsolata-ui text-[12px] font-bold text-text-heading flex items-center gap-2">
                   <GitCommit className="w-3.5 h-3.5 text-teal-700 opacity-40" />
                   Verification Stream
                </h3>
              </div>

              <div className="space-y-1.5">
                {repoData.commits.map((c: any) => (
                  <div 
                    key={c.sha}
                    className="w-full flex items-center justify-between p-3 border border-border bg-sidebar/5 hover:border-teal-700/20 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-background border border-border flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold text-text-heading mb-0.5 tracking-tight leading-tight truncate">{c.commit.message}</p>
                        <div className="flex items-center gap-2 text-[9px] font-bold text-text-muted inconsolata-ui uppercase tracking-wider opacity-60">
                          <span className="font-mono text-teal-700">{c.sha.substring(0, 7)}</span>
                          <span>•</span>
                          <span>{getTimeAgo(c.commit.author.date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {repoData.commits.length === 0 && (
                  <div className="p-12 text-center border border-dashed border-border rounded-xl">
                    <Code2 className="w-8 h-8 text-text-muted opacity-20 mx-auto mb-4" />
                    <p className="manrope-body text-[13px] text-text-muted">No commits found in this branch.</p>
                  </div>
                )}
              </div>
           </div>
        </main>
      </div>
    </div>
  );
};

export default CodePilot;
