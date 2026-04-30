"use client";

import React, { useState, useEffect, useRef } from 'react';
import { submissionsAPI } from '@/lib/api';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { X, CheckCircle, AlertCircle, Link as LinkIcon, FileText, Upload, Send, ChevronRight, Eye, RefreshCw, MessageSquare, Scale, Github, ChevronDown } from 'lucide-react';

interface Props {
  roadmapId: number;
  moduleNumber: number;
  onClose: () => void;
  onCompleted: (result?: any) => void;
  existingSubmission?: any;
  instructions?: {
    what_to_build: string;
    what_counts_as_evidence: string;
    eval_criteria: string[];
  };
}

export default function SubmissionModal({ roadmapId, moduleNumber, onClose, onCompleted, existingSubmission, instructions }: Props) {
  const { user } = useAuth();
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(existingSubmission?.evaluation_level ? existingSubmission : null);
  const [error, setError] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<number | null>(existingSubmission?.id || null);
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // GitHub Repos State
  const [repos, setRepos] = useState<any[]>([]);
  const [fetchingRepos, setFetchingRepos] = useState(false);
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);
  
  // Dispute State
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeContext, setDisputeContext] = useState('');
  const [disputeLoading, setDisputeLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [evaluation, showDisputeForm, showPreview]);

  // Fetch GitHub repos if connected
  useEffect(() => {
    if (user?.github_username && repos.length === 0) {
      const fetchRepos = async () => {
        setFetchingRepos(true);
        try {
          const res = await fetch(`https://api.github.com/users/${user.github_username}/repos?sort=updated&per_page=50`);
          if (res.ok) {
            const data = await res.json();
            setRepos(data);
          }
        } catch (err) {
          console.error("Failed to fetch GitHub repos:", err);
        } finally {
          setFetchingRepos(false);
        }
      };
      fetchRepos();
    }
  }, [user?.github_username]);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
  const MAX_TOTAL_SIZE = 5 * 1024 * 1024; // 5MB total
  const TEXT_EXTS = ["py", "js", "ts", "java", "cpp", "c", "jsx", "tsx", "html", "css", "txt", "md"];
  const IMG_EXTS = ["jpg", "jpeg", "png", "webp"];
  const PDF_EXTS = ["pdf"];

  const resizeImage = (file: File): Promise<{ content: string, size: number }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 1024;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const dataURL = canvas.toDataURL('image/jpeg', 0.85);
          const approxSize = Math.round((dataURL.length - 'data:image/jpeg;base64,'.length) * 0.75);
          resolve({ content: dataURL, size: approxSize });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const readFileContent = (file: File, asDataURL: boolean): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || "");
      if (asDataURL) reader.readAsDataURL(file);
      else reader.readAsText(file);
    });
  };

  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    setError(null);
    const newFiles: any[] = [];
    let currentTotal = selectedFiles.reduce((sum, f) => sum + f.size, 0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      let content = "";
      let size = file.size;

      if (IMG_EXTS.includes(ext)) {
        const resized = await resizeImage(file);
        content = resized.content;
        size = resized.size;
      } else if (PDF_EXTS.includes(ext)) {
        content = await readFileContent(file, true);
      } else if (TEXT_EXTS.includes(ext)) {
        content = await readFileContent(file, false);
      }

      if (size > MAX_FILE_SIZE) {
        setError(`"${file.name}" exceeds 5MB.`);
        return;
      }
      if (currentTotal + size > MAX_TOTAL_SIZE) {
        setError("Total attachment size cannot exceed 5MB.");
        return;
      }
      currentTotal += size;
      newFiles.push({ name: file.name, size, type: file.type, content });
    }
    setSelectedFiles([...selectedFiles, ...newFiles]);
  };

  const validate = () => {
    if (!description || description.trim().length < 300) return "Please provide a more detailed description (>300 chars).";
    const hasLink = link && link.trim().length > 5;
    const hasFiles = selectedFiles.length > 0;
    if (!hasLink && !hasFiles) return "Please provide a link or an attachment.";
    return null;
  };

  const submit = async () => {
    setError(null); setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not signed in');
      const res = await submissionsAPI.createSubmission({ roadmap_id: roadmapId, module_number: moduleNumber, link, description, files: selectedFiles }, session.access_token);
      setEvaluation(res.evaluation || null);
      if (res.submission?.id) setSubmissionId(res.submission.id);
      setShowPreview(false);
    } catch (err: any) {
      console.error("Submission Error:", err.response?.data);
      const backendMessage = err.response?.data?.detail || err.response?.data?.message || err.response?.data;
      setError(typeof backendMessage === 'string' ? backendMessage : err.message);
    } finally { setLoading(false); }
  };

  const handleDispute = async () => {
    if (disputeContext.length < 20) return setError("Context too short.");
    setDisputeLoading(true); setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await submissionsAPI.requestReEvaluation(submissionId!, disputeContext, session?.access_token);
      if (res.status === 'exhausted') {
        onCompleted(); onClose();
      } else {
        setEvaluation(res.evaluation);
        setShowDisputeForm(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Dispute failed.");
    } finally { setDisputeLoading(false); }
  };

  const isRejected = evaluation?.evaluation_level === "Beginner";

  return (
    <div data-testid="submission-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 manrope-body">
      <div className="bg-background w-full max-w-[660px] border-[0.5px] border-border rounded-none relative max-h-[90vh] flex flex-col shadow-none transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-[0.5px] border-border">
          <h3 className="inconsolata-ui text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
            WEEK {moduleNumber} — SUBMIT WORK
          </h3>
          <button onClick={onClose} data-testid="submission-close-button" className="text-text-muted hover:text-text-heading transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto no-scrollbar flex-1" ref={scrollRef}>
          {/* Instructions Section */}
          {instructions && !evaluation && !showDisputeForm && !showPreview && (
            <div className="animate-in fade-in duration-300">
              <div className="px-6 py-6 border-b-[0.5px] border-border bg-callout-bg/30">
                <div className="mb-4">
                  <p className="inconsolata-ui text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-2">The Goal</p>
                  <p className="text-[14px] font-bold text-text-heading leading-[1.5]">{instructions.what_to_build}</p>
                </div>
                
                <div className="flex items-start gap-2 py-2 px-3 bg-background border border-border/50 rounded-lg">
                  <div className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-accent/40" />
                  <p className="text-[12px] text-text-muted italic leading-relaxed">
                    <span className="font-bold not-italic text-[10px] uppercase tracking-wider mr-1">Evidence:</span> 
                    {instructions.what_counts_as_evidence}
                  </p>
                </div>
              </div>

              {instructions.eval_criteria?.length > 0 && (
                <div className="px-6 py-5 border-b-[0.5px] border-border">
                  <p className="inconsolata-ui text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-4">Evaluation Criteria</p>
                  <div className="grid grid-cols-1 gap-y-3">
                    {instructions.eval_criteria.map((c, i) => (
                      <div key={i} className="flex items-start gap-3 group">
                        <div className="mt-1.5 shrink-0 w-1 h-1 bg-border group-hover:bg-accent transition-colors" />
                        <p className="text-[12px] text-text-primary leading-tight font-medium">{c.charAt(0).toUpperCase() + c.slice(1).toLowerCase()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="px-6 py-6">
            {evaluation && !showDisputeForm ? (
              <div data-testid="evaluation-result-container" className="space-y-6 animate-in slide-in-from-bottom-2">
                <div className={`p-5 border-[0.5px] ${isRejected ? 'border-red-500/40' : 'border-[var(--accent)]/40'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    {isRejected ? <AlertCircle className="h-4 w-4 text-red-500" /> : <CheckCircle className="h-4 w-4 text-accent" />}
                    <span data-testid="evaluation-result-badge" className="inconsolata-ui text-[11px] font-bold uppercase tracking-widest text-text-heading">
                      {evaluation.evaluation_level} {evaluation.is_senate_eval && `(${evaluation.senate_agreement}/3 Audit)`}
                    </span>
                  </div>

                  {evaluation.is_senate_eval && evaluation.senate_summary && (
                    <p className="text-[14px] font-bold text-text-heading leading-relaxed italic mb-6 border-l-[3px] border-[var(--accent)] pl-4">
                      &ldquo;{evaluation.senate_summary}&rdquo;
                    </p>
                  )}

                  {evaluation.is_senate_eval && evaluation.senate_reasoning && (
                    <div className="space-y-4 mb-6">
                      {[
                        { id: 'technician', label: 'Technical Quality', data: evaluation.senate_reasoning.technician, vote: evaluation.senate_votes?.[0] },
                        { id: 'educator', label: 'Learning Evidence', data: evaluation.senate_reasoning.educator, vote: evaluation.senate_votes?.[1] },
                        { id: 'relevance_judge', label: 'Subject Alignment', data: evaluation.senate_reasoning.relevance_judge, vote: evaluation.senate_votes?.[2] }
                      ].map((auditor) => (
                        <div key={auditor.id} className="border-b-[0.5px] border-border last:border-b-0 pb-4 last:pb-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="inconsolata-ui text-[9px] font-bold text-text-muted uppercase tracking-wider">{auditor.label}</span>
                            <span className="inconsolata-ui text-[9px] font-bold uppercase">{auditor.vote}</span>
                          </div>
                          <p className="text-[12px] text-text-muted leading-relaxed italic">&ldquo;{auditor.data}&rdquo;</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {evaluation.dissent_note && (
                    <div className="p-3 bg-callout-bg border-[0.5px] border-border mb-4 flex items-start gap-2.5">
                       <Scale className="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5 opacity-60" />
                       <p className="text-[11px] text-text-muted font-medium leading-tight">{evaluation.dissent_note}</p>
                    </div>
                  )}
                  
                  {isRejected && evaluation.follow_up_question && (
                    <div className="p-4 border-[0.5px] border-red-500/20 bg-red-500/[0.02]">
                      <p className="inconsolata-ui text-[10px] font-bold text-red-500 uppercase mb-1">Reflection Required</p>
                      <p data-testid="evaluation-challenge-question" className="text-[13px] font-bold text-text-heading">{evaluation.follow_up_question}</p>
                    </div>
                  )}
                </div>

                {isRejected ? (
                  <div className="flex gap-4">
                    <button onClick={() => { setEvaluation(null); setShowPreview(false); }} data-testid="try-again-button" className="flex-1 py-4 border-[0.5px] border-border text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-callout-bg">Fix & Retry</button>
                    {(!evaluation.re_eval_count || evaluation.re_eval_count < 1) && (
                      <button onClick={() => setShowDisputeForm(true)} data-testid="dispute-button" className="flex-1 py-4 border-[0.5px] border-amber-500/40 text-amber-600 dark:text-amber-400 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-amber-500/5">Dispute</button>
                    )}
                  </div>
                ) : (
                  <button onClick={() => { onCompleted(evaluation); onClose(); }} data-testid="continue-journey-button" className="w-full py-4 bg-black text-white rounded-none font-bold text-[11px] uppercase tracking-[0.2em] hover:opacity-90">Continue Journey</button>
                )}
              </div>

            ) : showDisputeForm ? (
              <div data-testid="dispute-form" className="space-y-6 animate-in slide-in-from-right-4">
                <h4 className="inconsolata-ui text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">Request Audit</h4>
                <p className="text-[13px] text-text-muted leading-relaxed italic">Why was the initial evaluation incorrect? Be specific about what the mentor might have missed.</p>
                <textarea value={disputeContext} onChange={(e) => setDisputeContext(e.target.value)} data-testid="dispute-context-input" placeholder="Provide technical context..." className="w-full p-4 bg-transparent border-[0.5px] border-border rounded-none text-[13px] h-32 focus:border-[var(--accent)] outline-none text-text-primary transition-all resize-none placeholder:text-text-muted" />
                <div className="flex gap-4">
                  <button onClick={() => setShowDisputeForm(false)} className="flex-1 py-4 text-text-muted text-[11px] font-bold uppercase tracking-[0.2em] hover:text-text-heading">Cancel</button>
                  <button onClick={handleDispute} disabled={disputeLoading || disputeContext.length < 20} data-testid="dispute-submit-button" className="flex-[2] py-4 bg-black text-white rounded-none text-[11px] font-bold uppercase tracking-[0.2em] disabled:opacity-50">
                    {disputeLoading ? 'Auditing...' : 'Submit Audit Request'}
                  </button>
                </div>
              </div>
            ) : showPreview ? (
              <div data-testid="submission-preview" className="animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="flex flex-col -mx-6 -mt-6">
                  <div className="px-6 py-4 border-b-[0.5px] border-border">
                    <h4 className="inconsolata-ui text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">Review Submission</h4>
                  </div>
                  
                  {link && (
                    <div className="px-6 py-5 border-b-[0.5px] border-border">
                      <p className="inconsolata-ui text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Proof Link</p>
                      <p data-testid="preview-link" className="text-[13px] font-bold text-accent truncate">{link}</p>
                    </div>
                  )}

                  {selectedFiles.length > 0 && (
                    <div className="px-6 py-5 border-b-[0.5px] border-border">
                      <p className="inconsolata-ui text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Attachments</p>
                      <div className="flex flex-col gap-2">
                        {selectedFiles.map((f, i) => (
                          <div key={i} className="text-[11px] font-medium text-text-primary flex items-center gap-2">
                            <div className="w-1 h-1 bg-[var(--text-muted)] opacity-40"></div>
                            {f.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="px-6 py-6 border-b-[0.5px] border-border">
                    <p className="inconsolata-ui text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Technical Description</p>
                    <div data-testid="preview-description" className="text-[13px] text-text-primary whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto no-scrollbar">{description}</div>
                  </div>

                  <div className="px-6 py-6 flex gap-4">
                    <button onClick={() => setShowPreview(false)} disabled={loading} data-testid="edit-submission-button" className="flex-1 py-4 border-[0.5px] border-border text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-callout-bg transition-colors">Edit</button>
                    <button onClick={submit} disabled={loading} data-testid="finalize-submission-button" className="flex-[2] py-4 bg-black text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:opacity-90 transition-all">{loading ? 'Processing...' : 'Finalize & Audit'}</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-0 border-[0.5px] border-border">
                {/* GitHub Repo Selection */}
                {user?.github_username ? (
                  <div className="border-b-[0.5px] border-border bg-sidebar/10 relative">
                    <button 
                      onClick={() => setShowRepoDropdown(!showRepoDropdown)}
                      className="w-full px-3 h-[44px] flex items-center justify-between text-[11px] font-bold text-text-muted hover:text-text-heading transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <Github className="w-3.5 h-3.5" />
                        <span className="uppercase tracking-widest">
                          {fetchingRepos ? 'Loading Repos...' : 'Select GitHub Repository'}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showRepoDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showRepoDropdown && (
                      <div className="absolute top-full left-0 w-full bg-background border-x-[0.5px] border-b-[0.5px] border-border z-[110] max-h-[200px] overflow-y-auto no-scrollbar shadow-2xl animate-in slide-in-from-top-1">
                        {repos.length > 0 ? (
                          repos.map((repo) => (
                            <button
                              key={repo.id}
                              onClick={() => {
                                setLink(repo.html_url);
                                if (!description) {
                                  setDescription(`GitHub Repository: ${repo.name}\n\n${repo.description || ''}`);
                                }
                                setShowRepoDropdown(false);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-sidebar/20 border-b-[0.5px] border-border last:border-b-0 group flex flex-col gap-0.5"
                            >
                              <span className="text-[13px] font-bold text-text-heading group-hover:text-accent transition-colors">{repo.name}</span>
                              <span className="text-[10px] text-text-muted opacity-60 truncate">{repo.description || 'No description'}</span>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-[11px] text-text-muted italic">
                            {fetchingRepos ? 'Connecting to GitHub...' : 'No public repositories found.'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border-b-[0.5px] border-border bg-sidebar/5">
                    <button 
                      onClick={async () => {
                        try {
                          await supabase.auth.signInWithOAuth({
                            provider: 'github',
                            options: {
                              redirectTo: window.location.href,
                              queryParams: { access_type: 'offline', prompt: 'consent' }
                            }
                          });
                        } catch (err) {
                          console.error("GitHub link failed:", err);
                        }
                      }}
                      className="w-full px-3 h-[44px] flex items-center justify-start gap-2 text-[10px] font-bold text-text-muted hover:text-accent transition-all group"
                    >
                      <Github className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                      <span className="uppercase tracking-[0.15em]">Connect GitHub to select repositories</span>
                    </button>
                  </div>
                )}

                {/* Proof Link */}
                <div className="border-b-[0.5px] border-border h-[40px] flex items-center">
                  <input value={link} onChange={(e) => setLink(e.target.value)} data-testid="submission-link-input" placeholder="Paste Proof Link (GitHub, demo, etc.)" className="w-full px-3 bg-transparent text-[13px] font-medium text-text-primary outline-none transition-all placeholder:text-text-muted rounded-none" />
                </div>

                {/* Dropzone */}
                <div className="border-b-[0.5px] border-border">
                  <div onDragEnter={() => setDragActive(true)} onDragLeave={() => setDragActive(false)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); setDragActive(false); addFiles(e.dataTransfer.files); }} className={`h-[56px] transition-all ${dragActive ? 'bg-accent/5' : 'bg-transparent hover:bg-callout-bg'}`}>
                    <input type="file" multiple onChange={(e) => addFiles(e.target.files)} data-testid="submission-file-input" className="hidden" id="file-input" />
                    <label htmlFor="file-input" className="cursor-pointer w-full h-full flex items-center justify-center gap-3 border-[0.5px] border-dashed border-border">
                      <Upload className="h-3.5 w-3.5 text-text-muted" />
                      <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Drop Evidence or Browse</span>
                    </label>
                  </div>
                  {selectedFiles.length > 0 && <div className="px-6 py-3 flex flex-wrap gap-2 border-t-[0.5px] border-border">{selectedFiles.map((file, idx) => <div key={idx} className="flex items-center gap-2 text-[10px] border-[0.5px] border-border px-2 py-1"><span className="text-text-muted truncate max-w-[150px]">{file.name}</span><button onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))} className="text-red-500">✕</button></div>)}</div>}
                </div>

                {/* Description */}
                <div className="relative">
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} data-testid="submission-description-input" className="w-full p-[10px_12px] bg-transparent text-[13px] leading-[1.5] font-medium text-text-primary outline-none transition-all resize-none no-scrollbar placeholder:text-text-muted h-[110px] rounded-none" placeholder="What did you build or solve? What was the hardest part? Share your approach." />
                  <div className="absolute bottom-2 right-3">
                    <p data-testid="submission-char-counter" className={`inconsolata-ui text-[10px] font-bold ${description.trim().length >= 300 ? 'text-accent' : 'text-text-muted opacity-40'}`}>{description.trim().length}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {!evaluation && !showDisputeForm && !showPreview && (
          <div className="px-6 py-4 border-t-[0.5px] border-border flex items-center justify-between">
            <button onClick={onClose} data-testid="submission-cancel-button" className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted hover:text-text-heading transition-colors">Cancel</button>
            <button onClick={() => { const err = validate(); if (err) setError(err); else setShowPreview(true); }} data-testid="submission-preview-button" className="px-10 py-3.5 bg-black text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:opacity-90 transition-all rounded-none">Submit</button>
          </div>
        )}

        {error && !evaluation && (
          <div className="px-6 py-3 border-t-[0.5px] border-red-500/20 bg-red-500/[0.02]">
            <p data-testid="submission-error-message" className="inconsolata-ui text-[10px] font-bold text-red-500 uppercase flex items-center gap-2 leading-none">
              <AlertCircle className="h-3.5 w-3.5" /> {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
