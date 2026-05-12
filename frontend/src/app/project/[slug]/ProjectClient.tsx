"use client"

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { roadmapsAPI, submissionsAPI, authAPI, exploreAPI } from '@/lib/api';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import { 
    ChevronLeft, 
    ChevronRight,
    Github, 
    ShieldCheck, 
    Terminal, 
    Code2,
    Activity, 
    Target, 
    Layout, 
    MessageSquare,
    Eye,
    Globe,
    Share2,
    Settings,
    MoreVertical,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    Hammer,
    Menu,
    X,
    Trash2,
    Lock,
    Calendar
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AppSidebar from '@/components/AppSidebar';
import ShareMenu from '@/components/ShareMenu';
import Breadcrumbs from '@/components/Breadcrumbs';
import TTSListenButton from '@/components/TTSListenButton';

interface Props {
  slug: string;
  initialProject: any;
}

export default function ProjectClient({ slug, initialProject }: Props) {
    const [project, setProject] = useState<any>(initialProject);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [selectedAudit, setSelectedAudit] = useState<any>(null);
    const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
    
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsAuthenticated(!!session);
            
            if (session) {
                const sessionEmail = session.user.email?.toLowerCase();
                setIsOwner(sessionEmail === project?.email?.toLowerCase());
            }

            try {
                const subData = await submissionsAPI.listSubmissions(project.id);
                setSubmissions(subData.submissions || []);
                
                // Handle initial audit selection from URL
                const auditId = searchParams.get('audit');
                if (auditId && subData.submissions) {
                    const audit = subData.submissions.find((s: any) => s.id.toString() === auditId);
                    if (audit) setSelectedAudit(audit);
                }
            } catch (err) {
                console.error("Failed to fetch submissions:", err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [project.id, project.email, searchParams]);

    const handleUpdateStatus = async (status: string) => {
        try {
            await roadmapsAPI.updateStatus(project.id, status as any);
            setProject({ ...project, status });
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    const handleUpdateVisibility = async () => {
        if (isUpdatingVisibility) return;
        setIsUpdatingVisibility(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const newPublicStatus = !project.is_public;
            await exploreAPI.updateVisibility(project.id, { 
                is_public: newPublicStatus, 
                show_author: true 
            }, session.access_token);
            
            setProject({ ...project, is_public: newPublicStatus });
        } catch (err) {
            console.error("Failed to update visibility:", err);
        } finally {
            setIsUpdatingVisibility(false);
        }
    };

    const latestSubmission = submissions.length > 0 ? submissions[0] : null;
    const verificationLevel = latestSubmission?.evaluation_level || 'Pending';

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-background text-text-primary manrope-body overflow-hidden">
            {/* Header */}
            <header className="h-12 border-b border-border bg-header shrink-0 flex items-center justify-between px-6 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 -ml-2 text-text-muted">
                        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                    <Link href="/" className="flex items-center gap-2.5">
                        <img src="/apple-touch-icon.png" alt="" className="w-5 h-5" />
                        <span className="text-[14px] font-bold text-text-heading tracking-tight hidden md:block">Euler<span className="text-teal-700">Fold</span></span>
                    </Link>
                    <div className="h-4 w-[1px] bg-border mx-2 hidden md:block" />
                </div>

                <div className="flex items-center gap-4">
                    {/* Header items removed as requested */}
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <AppSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} activePath="/buildpilot">
                    {/* Sidebar content simplified as requested */}
                </AppSidebar>

                <main className="flex-1 overflow-y-auto bg-background">
                    <div className="max-w-[1000px] mx-auto px-6 py-10 pb-24">
                        <Breadcrumbs 
                            items={[
                                { label: 'BuildPilot', href: '/buildpilot' },
                                { label: project.title }
                            ]} 
                        />

                        {/* Status Banner */}
                        <div className="mb-12 relative flex flex-col bg-sidebar border border-border rounded-none shadow-sm overflow-hidden">
                            {/* Decorative Background Accent */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-700/5 rounded-full blur-3xl pointer-events-none" />
                            
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 p-8 md:p-10 pb-6 md:pb-8">
                                <div className="relative space-y-4 flex-1">
                                    <div>
                                        <h1 className="text-3xl md:text-4xl font-black text-text-heading tracking-tight mb-3">{project.title}</h1>
                                        <p className="text-text-muted text-[15px] font-medium leading-relaxed max-w-3xl italic">
                                            &ldquo;{project.goal || project.description}&rdquo;
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center gap-6 pt-2">
                                        <div className="flex items-center gap-2 text-text-muted">
                                            <Calendar className="w-4 h-4 opacity-50" />
                                            <span className="text-[12px] font-bold inconsolata-ui uppercase tracking-widest">
                                                Initiated {new Date(project.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative flex flex-col sm:flex-row items-center gap-6 shrink-0">
                                    <div className="text-center sm:text-right bg-background/50 p-4 border border-border rounded-none">
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest inconsolata-ui mb-1 flex items-center justify-center sm:justify-end gap-1.5">
                                            Audit Precision
                                        </p>
                                        <div className="flex items-center justify-center sm:justify-end gap-2">
                                            <p className="text-3xl font-black text-text-heading">
                                                {verificationLevel === 'Solid' ? '100%' : verificationLevel === 'Developing' ? '70%' : '0%'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 md:px-10 pb-8 md:pb-10 pt-2 relative z-10 flex flex-wrap items-center gap-3">
                                <Link 
                                    href={`/project/${slug}/build/1`}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-700 text-white text-[12px] font-bold uppercase tracking-widest hover:bg-teal-800 transition-all rounded-none shadow-xl shadow-teal-700/20 active:scale-[0.98]"
                                >
                                    <Terminal className="w-4 h-4" /> Open Workspace
                                </Link>
                                
                                {latestSubmission?.link && (
                                    <a 
                                        href={latestSubmission.link} 
                                        target="_blank" 
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-background border border-border text-[11px] font-bold uppercase tracking-widest text-text-heading hover:bg-sidebar transition-all rounded-none"
                                        title="View Repository"
                                    >
                                        <Github className="w-4 h-4" /> Source Code
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-2 space-y-12">
                                {/* Audit Trail */}
                                <section>
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <Activity className="w-4 h-4 text-teal-700" />
                                            <h2 className="inconsolata-ui text-[11px] font-black uppercase tracking-[0.2em] text-text-muted">Verification Trail</h2>
                                        </div>
                                        <button 
                                            onClick={() => router.push(`/project/${slug}/build/1`)}
                                            className="text-[11px] font-bold text-teal-700 hover:underline inconsolata-ui uppercase tracking-widest"
                                        >
                                            New Submission
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {loading ? (
                                            <div className="py-12 flex items-center justify-center">
                                                <Activity className="w-6 h-6 text-teal-700 animate-spin" />
                                            </div>
                                        ) : submissions.length > 0 ? (
                                            submissions.map((sub, i) => (
                                                <div key={sub.id} className="p-6 bg-header border border-border rounded-none hover:border-teal-700/20 transition-all">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div>
                                                            <p className="text-[14px] font-bold text-text-heading mb-1">{sub.senate_summary || "Build Verification"}</p>
                                                            <div className="flex items-center gap-3 text-[10px] font-bold text-text-muted inconsolata-ui uppercase tracking-wider opacity-60">
                                                                <span>{new Date(sub.submitted_at).toLocaleDateString()}</span>
                                                                <span>•</span>
                                                                <span className="text-teal-700">Audit #{submissions.length - i}</span>
                                                            </div>
                                                        </div>
                                                        <div className={`px-2.5 py-1 rounded-none text-[9px] font-black uppercase tracking-widest inconsolata-ui border ${
                                                            sub.evaluation_level === 'Solid' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-600' :
                                                            sub.evaluation_level === 'Developing' ? 'bg-amber-500/5 border-amber-500/10 text-amber-600' :
                                                            'bg-zinc-500/5 border-zinc-500/10 text-text-muted'
                                                        }`}>
                                                            {sub.evaluation_level}
                                                        </div>
                                                    </div>
                                                    <p className="text-[13px] text-text-muted leading-relaxed line-clamp-2 italic mb-4">
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
                                                            Review Details <ChevronRight className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-20 text-center border border-dashed border-border rounded-none">
                                                <Hammer className="w-8 h-8 text-text-muted opacity-20 mx-auto mb-4" />
                                                <p className="text-[13px] text-text-muted mb-6">No audits recorded yet.</p>
                                                <Link href={`/project/${slug}/build/1`} className="inline-flex items-center gap-2 px-6 py-2.5 bg-sidebar border border-border text-[11px] font-bold uppercase tracking-widest text-text-heading hover:bg-background transition-all rounded-none">
                                                    Initiate first audit
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>

                            <div className="lg:col-span-1 space-y-12">
                                {/* Quick Actions */}
                                <section className="p-6 bg-teal-700/5 border border-teal-700/10 rounded-none">
                                    <h3 className="inconsolata-ui text-[11px] font-black uppercase tracking-widest text-text-heading mb-4">Project Visibility</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-background border border-border rounded-none">
                                            <div className="flex items-center gap-3">
                                                {project.is_public ? <Globe className="w-4 h-4 text-emerald-500" /> : <Lock className="w-4 h-4 text-text-muted" />}
                                                <span className="text-[12px] font-bold text-text-heading">{project.is_public ? 'Public' : 'Private'}</span>
                                            </div>
                                            <button 
                                                onClick={handleUpdateVisibility}
                                                disabled={isUpdatingVisibility}
                                                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest inconsolata-ui border transition-all ${
                                                    project.is_public 
                                                    ? 'bg-zinc-100 border-zinc-200 text-text-muted hover:bg-zinc-200' 
                                                    : 'bg-teal-700 border-teal-800 text-white hover:bg-teal-800 shadow-lg shadow-teal-700/20'
                                                } disabled:opacity-50 rounded-none`}
                                            >
                                                {isUpdatingVisibility ? 'Updating...' : project.is_public ? 'Set Private' : 'Make Public'}
                                            </button>
                                        </div>
                                        <p className="text-[11px] text-text-muted leading-relaxed italic">
                                            {project.is_public 
                                                ? "This project is currently visible on your public profile and Explore."
                                                : "Public projects appear on your profile and earn you 10 EulerCoins."}
                                        </p>
                                        {project.is_public && (
                                            <div className="pt-2">
                                                <ShareMenu 
                                                    slug={slug}
                                                    title={project.title}
                                                    type="project"
                                                    triggerClassName="w-full flex justify-center items-center gap-2 px-4 py-2 bg-background border border-border text-[11px] font-black uppercase tracking-widest text-text-heading hover:bg-sidebar transition-all rounded-none"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </section>
                                
                                <button 
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-background border border-border text-[11px] font-bold uppercase tracking-widest text-text-heading hover:bg-sidebar transition-all rounded-none"
                                    title="Project Settings"
                                >
                                    <Settings className="w-4 h-4" /> Config
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

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
        </div>
    );
}
