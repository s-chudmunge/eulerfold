"use client"

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { roadmapsAPI, submissionsAPI, authAPI } from '@/lib/api';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import { 
    Github, 
    ExternalLink, 
    ShieldCheck, 
    Clock, 
    Target, 
    Code2, 
    ChevronRight,
    Terminal,
    Users,
    Activity,
    Lock,
    Eye,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight,
    Info,
    Rocket,
    X,
    Calendar,
    Share2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import TTSListenButton from '@/components/TTSListenButton';

interface PublicProjectViewProps {
    project: any;
    slug: string;
}

export default function PublicProjectView({ project: initialProject, slug }: PublicProjectViewProps) {
    const [project, setProject] = useState(initialProject);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [selectedAudit, setSelectedAudit] = useState<any>(null);
    
    const router = useRouter();

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const authStatus = !!session;
            setIsAuthenticated(authStatus);
            
            if (session) {
                const sessionEmail = session.user.email?.toLowerCase();
                const projectEmail = project?.email?.toLowerCase();
                setIsOwner(sessionEmail === projectEmail);
            }

            try {
                const subData = await submissionsAPI.listSubmissions(project.id);
                setSubmissions(subData.submissions || []);
            } catch (err) {
                console.error("Failed to fetch submissions:", err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [project.id, project.email]);

    // Calculate overall status based on latest submission
    const latestSubmission = submissions.length > 0 ? submissions[0] : null;
    const verificationLevel = latestSubmission?.evaluation_level || 'Pending';

    return (
        <div className="min-h-screen bg-background text-text-primary flex flex-col manrope-body">
            <PublicHeader />
            
            <main className="flex-grow">
                {/* Hero Section */}
                <div className="border-b border-border bg-sidebar/5 relative overflow-hidden">
                    {/* Decorative Background Accent */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-700/5 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/4" />
                    
                    <div className="max-w-[1000px] mx-auto px-6 py-10 md:py-16 relative">
                        <Breadcrumbs 
                            items={[
                                { label: 'Explore', href: '/explore' },
                                { label: 'Projects', href: '/explore?tab=projects' },
                                { label: project.title }
                            ]} 
                        />
                        
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                            <div className="space-y-6 flex-1">
                                <div>
                                    <h1 className="text-3xl md:text-5xl font-black text-text-heading tracking-tight mb-4">
                                        {project.title}
                                    </h1>
                                    <p className="text-[16px] text-text-muted leading-relaxed max-w-2xl font-medium italic">
                                        &ldquo;{project.goal || project.description}&rdquo;
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 pt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-none bg-teal-700/10 border border-teal-700/20 flex items-center justify-center text-teal-700 font-bold inconsolata-ui">
                                            {project.email?.[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest inconsolata-ui">Architect</p>
                                            <p className="text-[13px] font-bold text-text-heading">{project.email?.split('@')[0]}</p>
                                        </div>
                                    </div>
                                    <div className="h-8 w-[1px] bg-border hidden sm:block" />
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-text-muted opacity-40" />
                                        <div>
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest inconsolata-ui">Initiated</p>
                                            <p className="text-[13px] font-bold text-text-heading">{new Date(project.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 shrink-0">
                                {isOwner ? (
                                    <Link 
                                        href={`/project/${slug}/build/1`}
                                        className="inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-teal-700 text-white font-bold text-[13px] uppercase tracking-widest hover:bg-teal-800 transition-all shadow-xl shadow-teal-700/20 active:scale-[0.98] rounded-none"
                                    >
                                        <Terminal className="w-4 h-4" /> Open Workspace
                                    </Link>
                                ) : (
                                    <button 
                                        onClick={() => router.push('/buildpilot')}
                                        className="inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-text-heading text-background font-bold text-[13px] uppercase tracking-widest hover:opacity-90 transition-all shadow-xl active:scale-[0.98] rounded-none"
                                    >
                                        <Rocket className="w-4 h-4" /> Start BuildPilot
                                    </button>
                                )}
                                
                                {latestSubmission?.link && (
                                    <a 
                                        href={latestSubmission.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-sidebar border border-border text-text-heading font-bold text-[13px] uppercase tracking-widest hover:bg-background transition-all rounded-none"
                                    >
                                        <Github className="w-4 h-4" /> View Repository <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1000px] mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Left Column: Side Info */}
                    <div className="lg:col-span-1 space-y-12">
                        <section className="p-6 bg-teal-700/5 border border-teal-700/10 rounded-none">
                            <div className="flex items-center gap-3 mb-4">
                                <ShieldCheck className="w-5 h-5 text-teal-700" />
                                <h3 className="inconsolata-ui text-[12px] font-black uppercase tracking-widest text-text-heading">EulerFold Verified</h3>
                            </div>
                            <p className="text-[13px] text-text-muted leading-relaxed mb-6 font-medium">
                                This project has been audited by the EulerFold Senate. Verification level is based on technical depth, authenticity, and objective alignment.
                            </p>
                            <div className="pt-4 border-t border-teal-700/10 flex items-center justify-between text-[11px] font-bold inconsolata-ui uppercase tracking-widest">
                                <span className="text-text-muted">Protocol</span>
                                <span className="text-teal-700">Verification Engine</span>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Audit Logs */}
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <Code2 className="w-4 h-4 text-teal-700" />
                                    <h2 className="inconsolata-ui text-[11px] font-black uppercase tracking-[0.2em] text-text-muted">Audit History</h2>
                                </div>
                                <div className="text-[11px] font-bold text-text-muted inconsolata-ui uppercase tracking-widest bg-sidebar/50 px-3 py-1 border border-border rounded-none">
                                    {submissions.length} Logged Entries
                                </div>
                            </div>

                            <div className="space-y-6">
                                {loading ? (
                                    <div className="py-20 flex flex-col items-center justify-center gap-4 text-text-muted">
                                        <Activity className="w-8 h-8 animate-spin" />
                                        <p className="inconsolata-ui text-[11px] font-bold uppercase tracking-widest">Retrieving audit chain...</p>
                                    </div>
                                ) : submissions.length > 0 ? (
                                    submissions.map((sub, idx) => (
                                        <div key={sub.id} className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-border group">
                                            <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-none bg-border group-hover:bg-teal-700 transition-colors" />
                                            
                                            <div className="bg-header border border-border p-6 rounded-none hover:border-teal-700/20 transition-all">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                    <div>
                                                        <p className="text-[15px] font-bold text-text-heading tracking-tight mb-1">
                                                            {sub.senate_summary || "Project Audit Verification"}
                                                        </p>
                                                        <div className="flex items-center gap-3 text-[11px] font-bold text-text-muted inconsolata-ui uppercase tracking-wider opacity-60">
                                                            <span>Submission #{submissions.length - idx}</span>
                                                            <span>•</span>
                                                            <span>{new Date(sub.submitted_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-none text-[10px] font-black uppercase tracking-widest inconsolata-ui border ${
                                                        sub.evaluation_level === 'Solid' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-600' :
                                                        sub.evaluation_level === 'Developing' ? 'bg-amber-500/5 border-amber-500/10 text-amber-600' :
                                                        'bg-zinc-500/5 border-zinc-500/10 text-text-muted'
                                                    }`}>
                                                        {sub.evaluation_level}
                                                    </div>
                                                </div>

                                                <p className="text-[14px] text-text-muted leading-relaxed mb-6 italic">
                                                    &ldquo;{sub.description}&rdquo;
                                                </p>

                                                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                                    <div className="flex items-center gap-4">
                                                        {sub.senate_votes?.map((vote: string, vi: number) => (
                                                            <div key={vi} className={`w-1.5 h-1.5 rounded-none ${
                                                                vote === 'Solid' ? 'bg-emerald-500' : vote === 'Developing' ? 'bg-amber-500' : 'bg-zinc-300'
                                                            }`} />
                                                        ))}
                                                    </div>
                                                    <button 
                                                        onClick={() => setSelectedAudit(sub)}
                                                        className="text-[11px] font-bold text-text-muted hover:text-teal-700 transition-colors uppercase tracking-widest inconsolata-ui flex items-center gap-1.5"
                                                    >
                                                        Review Senate Reasoning <ChevronRight className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center bg-sidebar/20 border border-dashed border-border rounded-none">
                                        <Terminal className="w-10 h-10 text-text-muted opacity-20 mx-auto mb-4" />
                                        <h3 className="inconsolata-ui text-[14px] font-bold text-text-heading mb-2">No Audits Found</h3>
                                        <p className="text-[13px] text-text-muted max-w-xs mx-auto">
                                            The builder has not yet submitted this project for verification to the Audit Senate.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            {/* Audit Details Modal */}
            {selectedAudit && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
                    <div className="w-full max-w-2xl max-h-[85vh] bg-background border border-border shadow-2xl rounded-none flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Fixed Header */}
                        <div className="px-8 py-6 border-b border-border flex justify-between items-start bg-background shrink-0">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="inconsolata-ui text-xl font-bold text-text-heading tracking-tight">Audit Verification Record</h3>
                                    <div className={`px-2.5 py-1 rounded-none text-[10px] font-black uppercase tracking-widest inconsolata-ui border ${
                                        selectedAudit.evaluation_level === 'Solid' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-600' :
                                        selectedAudit.evaluation_level === 'Developing' ? 'bg-amber-500/5 border-amber-500/10 text-amber-600' :
                                        'bg-zinc-500/5 border-zinc-500/10 text-text-muted'
                                    }`}>
                                        {selectedAudit.evaluation_level}
                                    </div>
                                </div>
                                <p className="text-[12px] font-bold text-text-muted inconsolata-ui uppercase tracking-wider opacity-60">
                                    Submitted on {new Date(selectedAudit.submitted_at).toLocaleString()}
                                </p>
                            </div>
                            <button onClick={() => setSelectedAudit(null)} className="text-text-muted hover:text-text-heading p-1 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-8 overflow-y-auto">
                            <div className="space-y-8 pb-4">
                                <section className="space-y-3">
                                    <h4 className="inconsolata-ui text-[11px] font-black uppercase tracking-widest text-text-muted">Builder Notes</h4>
                                    <div className="p-5 bg-sidebar/30 border border-border rounded-none">
                                        <p className="text-[15px] text-text-heading leading-relaxed italic">
                                            &ldquo;{selectedAudit.description}&rdquo;
                                        </p>
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <h4 className="inconsolata-ui text-[11px] font-black uppercase tracking-[0.2em] text-text-muted">Senate Deliberation</h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        {[
                                            { role: 'Technician', vote: selectedAudit.senate_votes?.[0], reasoning: selectedAudit.senate_reasoning?.technician, icon: Code2 },
                                            { role: 'Educator', vote: selectedAudit.senate_votes?.[1], reasoning: selectedAudit.senate_reasoning?.educator, icon: Target },
                                            { role: 'Relevance Judge', vote: selectedAudit.senate_votes?.[2], reasoning: selectedAudit.senate_reasoning?.relevance_judge, icon: ShieldCheck }
                                        ].map((item) => (
                                            <div key={item.role} className="p-6 bg-header border border-border rounded-none space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <item.icon className="w-4 h-4 text-teal-700/50" />
                                                        <p className="text-[11px] font-black uppercase tracking-widest text-text-muted inconsolata-ui">{item.role}</p>
                                                        {item.reasoning && (
                                                            <TTSListenButton text={`${item.role} evaluation: ${item.reasoning}`} label={item.role} />
                                                        )}
                                                    </div>
                                                    <p className={`text-[11px] font-black uppercase tracking-widest inconsolata-ui ${
                                                        item.vote === 'Solid' ? 'text-emerald-600' :
                                                        item.vote === 'Developing' ? 'text-amber-600' :
                                                        'text-text-muted'
                                                    }`}>{item.vote || 'Pending'}</p>
                                                </div>
                                                <p className="text-[14px] text-text-heading leading-relaxed font-medium">
                                                    {item.reasoning || 'No detailed reasoning provided.'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    {selectedAudit.senate_summary && (
                                        <div className="p-5 bg-teal-700/5 border border-teal-700/10 rounded-none flex items-center justify-between gap-4">
                                            <p className="text-[14px] text-teal-700 font-bold leading-relaxed">
                                                Verdict: {selectedAudit.senate_summary}
                                            </p>
                                            <TTSListenButton 
                                                text={`Final Verdict: ${selectedAudit.senate_summary}`} 
                                                variant="full" 
                                                label="Listen to Verdict" 
                                            />
                                        </div>
                                    )}
                                </section>

                                {selectedAudit.link && (
                                    <section className="space-y-3">
                                        <h4 className="inconsolata-ui text-[11px] font-black uppercase tracking-widest text-text-muted">Evidence Chain</h4>
                                        <a 
                                            href={selectedAudit.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-between p-4 bg-background border border-border rounded-none group hover:border-teal-700/30 transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Github className="w-5 h-5 text-text-muted group-hover:text-teal-700 transition-colors" />
                                                <span className="text-[13px] font-bold text-text-heading">Source Code Repository</span>
                                            </div>
                                            <ArrowUpRight className="w-4 h-4 text-text-muted" />
                                        </a>
                                    </section>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <Footer />
        </div>
    );
}
