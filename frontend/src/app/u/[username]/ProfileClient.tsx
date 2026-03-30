"use client";

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
    Clock, 
    Target, 
    ChevronDown, 
    ChevronUp, 
    ExternalLink, 
    Download,
    Share2,
    ShieldCheck,
    Award,
    Settings,
    FileText,
    BarChart3,
    Search,
    Globe,
    LayoutDashboard,
    ArrowRight,
    AlertCircle,
    Scale,
    Menu,
    X
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { PublicProfile } from '@/lib/api';
import ShareMenu from '@/components/ShareMenu';

interface Props {
    profile: PublicProfile;
}

export default function ProfileClient({ profile }: Props) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isOwner, setIsOwner] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
            if (session?.user?.id === profile.supabase_uid) {
                setIsOwner(true);
            }
        };
        checkAuth();
    }, [profile.supabase_uid]);

    const filteredSkills = (profile.skills || []).filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const strongSkills = filteredSkills.filter(s => s.confidence_score >= 80);
    const developingSkills = filteredSkills.filter(s => s.confidence_score >= 40 && s.confidence_score < 80);
    const exposureSkills = filteredSkills.filter(s => s.confidence_score < 40);

    const handleExportPDF = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/profile/${profile.username}/export`);
            if (!response.ok) throw new Error('Export failed');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${profile.username}-credential.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Failed to export PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background text-text-primary selection:bg-teal-500/30 selection:text-text-heading">
            {/* Header */}
            <header 
                style={{ top: 'var(--announcement-height, 0px)' }}
                className="inconsolata-ui border-b border-border bg-header h-[48px] shrink-0 z-50 fixed inset-x-0 transition-all duration-500 ease-in-out"
            >
                <div className="w-full px-4 md:px-6 flex h-full items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-4">
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 -ml-2 lg:hidden text-text-muted hover:text-text-heading transition-colors"
                        >
                            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <Link className="flex items-center group shrink-0" href="/">
                            <img src="/apple-touch-icon.png" alt="EulerFold" className="w-7 h-7 group-hover:opacity-80 transition-opacity" />
                        </Link>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6">
                        <Link href="/explore" className="hidden sm:flex text-[11px] font-bold text-text-muted hover:text-text-heading transition-colors items-center gap-1.5 tracking-wide">
                            <Globe className="w-3.5 h-3.5" /> Explore
                        </Link>
                        {isLoggedIn && (
                            <Link href="/dashboard" className="hidden sm:flex text-[11px] font-bold text-text-muted hover:text-text-heading transition-colors items-center gap-1.5 tracking-wide">
                                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                            </Link>
                        )}
                        <div className="h-4 w-px bg-[var(--border)] mx-1 hidden sm:block"></div>
                        <button 
                            onClick={handleExportPDF}
                            className="text-[11px] font-bold text-text-muted hover:text-text-heading transition-colors flex items-center gap-1.5 tracking-wide"
                        >
                            <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Export</span>
                        </button>
                        {isOwner ? (
                            <Link href="/settings" className="whitespace-nowrap rounded-full bg-[var(--text-heading)] px-3 md:px-5 py-1.5 text-[var(--bg-main)] text-[10px] md:text-[12px] font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
                                <Settings className="w-3.5 h-3.5" /> Settings
                            </Link>
                        ) : (
                            <ShareMenu 
                                title={`${profile.display_name || profile.username}'s Technical Profile`}
                                text={`Check out ${profile.display_name || profile.username}'s proven technical skills on EulerFold.`}                                url={`https://www.ulerfold.com/u/${profile.username}`}
                            />
                        )}
                    </div>
                </div>
            </header>

            <div 
                style={{ marginTop: 'calc(48px + var(--announcement-height, 0px))' }}
                className="flex flex-1 relative h-full overflow-hidden transition-all duration-500 ease-in-out"
            >
                {/* Mobile Overlay */}
                {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/20 z-[35] lg:hidden backdrop-blur-[2px] transition-all"
                        onClick={() => setIsSidebarOpen(false)}
                        style={{ top: 'calc(48px + var(--announcement-height, 0px))' }}
                    />
                )}

                {/* Sidebar */}
                <aside 
                    style={{ top: 'calc(48px + var(--announcement-height, 0px))' }}
                    className={`
                        manrope-body bg-sidebar border-r border-border w-[230px] flex flex-col shrink-0 z-40 
                        fixed bottom-0 left-0 transition-all duration-200 ease-in-out
                        lg:static lg:translate-x-0
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}
                >
                    <div className="p-6 flex flex-col h-full overflow-y-auto no-scrollbar">
                        <div className="mb-6">
                            <div className="w-12 h-12 bg-callout-bg border border-border rounded-lg flex items-center justify-center text-xl font-black text-text-heading overflow-hidden">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover grayscale-[0.5]" />
                                ) : (
                                    profile.display_name?.[0] || profile.username[0].toUpperCase()
                                )}
                            </div>
                        </div>

                        <div className="mb-8">
                            <h1 className="text-[15px] font-bold text-text-heading tracking-tight leading-tight">
                                {profile.display_name || profile.username}
                            </h1>
                            <p className="text-[11px] font-medium text-text-muted font-mono opacity-60">@{profile.username}</p>
                        </div>

                        {/* Flat Stats */}
                        <div className="space-y-0.5 mb-8">
                            <p className="px-2.5 mb-2 text-[10px] font-bold text-gray-400 tracking-wide">Highlights</p>
                            {[
                                { label: 'Skills', val: profile.skills?.length || 0, icon: BarChart3 },
                                { label: 'Evidence', val: profile.submissions?.length || 0, icon: FileText },
                                { label: 'Roadmaps', val: profile.total_roadmaps || 0, icon: Target },
                                { label: 'Benchmarks', val: profile.skills?.filter(s => s.last_assessment_score).length || 0, icon: Award }
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13px] font-medium text-gray-700 dark:text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <item.icon className="w-3.5 h-3.5 opacity-60" />
                                        <span className="text-[12px]">{item.label}</span>
                                    </div>
                                    <span className="font-bold text-text-heading text-[12px]">{item.val}</span>
                                </div>
                            ))}
                        </div>

                        {/* Practice Stats */}
                        <div className="px-2.5 mb-8">
                            <p className="mb-3 text-[10px] font-bold text-gray-400 tracking-wide">Practice</p>
                            <div className="space-y-4">
                                {[
                                    { label: 'Level I', count: profile.practice_stats?.easy || 0, color: 'bg-accent' },
                                    { label: 'Level II', count: profile.practice_stats?.medium || 0, color: 'bg-accent opacity-70' },
                                    { label: 'Level III', count: profile.practice_stats?.hard || 0, color: 'bg-accent opacity-40' }
                                ].map((item) => {
                                    const total = profile.practice_stats?.total || 1;
                                    const percentage = (item.count / total) * 100;
                                    return (
                                        <div key={item.label} className="space-y-1.5">
                                            <div className="flex justify-between items-end">
                                                <span className="text-[10px] font-medium text-text-muted">{item.label}</span>
                                                <span className="text-[11px] font-bold text-text-heading">{item.count}</span>
                                            </div>
                                            <div className="h-1 w-full bg-callout-bg rounded-full overflow-hidden border border-border">
                                                <div 
                                                    className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                                                    style={{ width: `${item.count > 0 ? Math.max(percentage, 5) : 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        {profile.submissions && profile.submissions.length > 0 && (
                            <div className="px-2.5">
                                <p className="mb-3 text-[10px] font-bold text-gray-400 tracking-wide">Recent Activity</p>
                                <div className="space-y-4 pb-4">
                                    {profile.submissions.slice(0, 10).map((sub, i) => (
                                        <div key={i} className="relative pl-4 group/item cursor-default">
                                            {/* Vertical Accent Bar */}
                                            <div className="absolute left-0 top-1 bottom-1 w-[1.5px] bg-[var(--border)] group-hover/item:bg-accent transition-colors rounded-full" />
                                            
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-bold text-text-heading leading-tight truncate group-hover/item:text-accent transition-colors">
                                                    {sub.roadmaps?.title || 'Technical Roadmap'}
                                                </p>
                                                <p className="text-[9px] text-text-muted font-medium mt-0.5 opacity-80">
                                                    Module {sub.module_number} Proven • {new Date(sub.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto p-4 border-t border-border bg-sidebar/50 dark:bg-white/[0.01]">
                        {!isOwner ? (
                            <Link 
                                href="/explore"
                                className="w-full py-2 bg-background border border-border rounded-lg text-[11px] font-bold tracking-wide text-text-heading hover:bg-callout-bg transition-all flex items-center justify-center gap-2"
                            >
                                Explore Paths <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        ) : (
                            <div className="flex flex-col items-center gap-1">
                                <p className="text-[10px] font-bold text-text-muted tracking-wide opacity-40">Proven Explorer</p>
                                <div className="flex gap-1">
                                    <div className="w-1 h-1 rounded-full bg-[var(--border)]"></div>
                                    <div className="w-1 h-1 rounded-full bg-[var(--border)]"></div>
                                    <div className="w-1 h-1 rounded-full bg-[var(--border)]"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 h-full overflow-y-auto bg-background">
                    <div className="max-w-[850px] mx-auto px-6 py-12 md:px-10">
                        
                        {/* Search Bar */}
                        <div className="relative mb-12">
                            <input 
                                className="w-full bg-callout-bg border border-border rounded-lg px-10 py-3.5 text-[14px] text-text-heading placeholder:text-text-muted outline-none focus:border-[var(--accent)] transition-all font-medium"
                                placeholder="Search proven skills..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        </div>

                        {/* Skills Section */}
                        <section className="mb-16">
                            <div className="flex items-center gap-4 mb-8">
                                <h2 className="inconsolata-ui text-[12px] font-bold text-text-muted  tracking-wide">Technical Growth</h2>
                                <div className="h-[1px] flex-1 bg-[var(--border)]"></div>
                            </div>

                            <div className="space-y-12">
                                {strongSkills.length > 0 && (
                                    <div>
                                        <h3 className="inconsolata-ui text-[11px] font-bold text-accent tracking-wide mb-4">Expertise</h3>
                                        <div className="border-t border-border divide-y divide-[var(--border)]">
                                            {strongSkills.map(skill => <SkillCard key={skill.id} skill={skill} />)}
                                        </div>
                                    </div>
                                )}

                                {developingSkills.length > 0 && (
                                    <div>
                                        <h3 className="inconsolata-ui text-[11px] font-bold text-text-muted tracking-wide mb-4 mt-8">Advancing</h3>
                                        <div className="border-t border-border divide-y divide-[var(--border)]">
                                            {developingSkills.map(skill => <SkillCard key={skill.id} skill={skill} />)}
                                        </div>
                                    </div>
                                )}

                                {exposureSkills.length > 0 && (
                                    <div>
                                        <h3 className="inconsolata-ui text-[11px] font-bold text-text-muted opacity-60 tracking-wide mb-4 mt-8">Foundations</h3>
                                        <div className="border-t border-border divide-y divide-[var(--border)]">
                                            {exposureSkills.map(skill => <SkillCard key={skill.id} skill={skill} />)}
                                        </div>
                                    </div>
                                )}

                                {filteredSkills.length === 0 && (
                                    <div className="py-12 text-center bg-callout-bg border border-dashed border-border rounded-xl">
                                        <p className="manrope-body text-[13px] text-text-muted italic">No artifacts matching &quot;{searchQuery}&quot; found.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Submissions Section */}
                        <section className="mb-20">
                            <div className="flex items-center gap-4 mb-8">
                                <h2 className="inconsolata-ui text-[12px] font-bold text-text-muted  tracking-wide">Verification Logs</h2>
                                <div className="h-[1px] flex-1 bg-[var(--border)]"></div>
                            </div>

                            <div className="space-y-6">
                                {profile.submissions && profile.submissions.length > 0 ? (
                                    profile.submissions.map((sub, idx) => (
                                        <div key={idx} className="bg-background border border-border rounded-xl p-8 relative group hover:border-[var(--accent)] transition-all shadow-sm">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="inconsolata-ui text-[10px] font-bold text-accent  tracking-wide bg-accent-muted px-2.5 py-1 rounded">
                                                            Log #{profile.submissions.length - idx}
                                                        </div>
                                                        {sub.is_senate_eval && (
                                                            <div className="inconsolata-ui text-[10px] font-bold text-text-muted  tracking-wide bg-callout-bg px-2.5 py-1 rounded border border-border">
                                                                Audit Senate ({sub.senate_agreement}/3)
                                                            </div>
                                                        )}
                                                        <div className={`inconsolata-ui text-[10px] font-bold  tracking-wide px-2.5 py-1 rounded border ${
                                                            sub.evaluation_level === 'Solid' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                                                            sub.evaluation_level === 'Developing' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' :
                                                            'bg-sidebar0/10 text-gray-600 dark:text-gray-400 border-gray-500/20'
                                                        }`}>
                                                            {sub.evaluation_level}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="inconsolata-ui text-[10px] font-bold text-text-muted  tracking-normal">
                                                            {sub.roadmaps?.title || 'Technical Roadmap'}
                                                        </span>
                                                        <span className="w-1 h-1 bg-[var(--text-muted)] opacity-20 rounded-full"></span>
                                                        <span className="inconsolata-ui text-[10px] font-bold text-text-muted  tracking-normal">
                                                            Module {sub.module_number}
                                                        </span>
                                                    </div>
                                                    {sub.re_eval_count > 0 && (
                                                        <div className="inconsolata-ui text-[10px] font-bold text-amber-600 dark:text-amber-400  tracking-wide flex items-center gap-1.5 mt-1">
                                                            <ShieldCheck className="w-3.5 h-3.5" /> Verified via Senior Audit
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="inconsolata-ui text-[10px] font-bold text-text-muted  tracking-wide">
                                                    {new Date(sub.submitted_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>

                                            <div className="manrope-body prose prose-sm max-w-none text-text-primary mb-8">
                                                {sub.is_senate_eval && sub.senate_summary ? (
                                                    <p className="text-[15px] font-bold text-text-heading leading-relaxed border-l-4 border-[var(--accent)] pl-4 py-1 italic">
                                                        &ldquo;{sub.senate_summary}&rdquo;
                                                    </p>
                                                ) : (
                                                    <ReactMarkdown components={{
                                                        h3: ({node, ...props}) => <h3 className="inconsolata-ui text-[13px] font-bold  tracking-wide mt-0 mb-3 text-text-heading" {...props} />,
                                                        p: ({node, ...props}) => <p className="mb-4 leading-relaxed font-medium" {...props} />,
                                                        ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-4 space-y-1.5 opacity-80" {...props} />,
                                                        li: ({node, ...props}) => <li className="text-[13px]" {...props} />,
                                                        code: ({node, ...props}) => <code className="bg-callout-bg border border-border px-1.5 py-0.5 rounded text-[12px] font-mono text-accent" {...props} />,
                                                        pre: ({node, ...props}) => <pre className="bg-callout-bg border border-border p-4 rounded-lg my-4 overflow-x-auto font-mono text-[11px]" {...props} />,
                                                    }}>
                                                        {sub.evaluation}
                                                    </ReactMarkdown>
                                                )}
                                            </div>

                                            {sub.is_senate_eval && sub.senate_reasoning && (
                                                <details className="group/audit mb-8">
                                                    <summary className="inconsolata-ui text-[10px] font-bold text-text-muted  tracking-wide cursor-pointer hover:text-accent transition-colors list-none flex items-center gap-2">
                                                        <ChevronDown className="w-3 h-3 group-open/audit:rotate-180 transition-transform" />
                                                        Audit Evidence
                                                    </summary>
                                                    <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                        {[
                                                            { id: 'technician', label: 'Technical Depth', data: sub.senate_reasoning.technician, vote: sub.senate_votes?.[0] },
                                                            { id: 'educator', label: 'Learning Proof', data: sub.senate_reasoning.educator, vote: sub.senate_votes?.[1] },
                                                            { id: 'relevance_judge', label: 'Alignment', data: sub.senate_reasoning.relevance_judge, vote: sub.senate_votes?.[2] }
                                                        ].map((auditor) => (
                                                            <div key={auditor.id} className="flex flex-col md:flex-row gap-2 md:gap-6 p-4 rounded-xl bg-callout-bg border border-border group/item hover:border-[var(--accent)] transition-all">
                                                                <div className="w-full md:w-32 shrink-0">
                                                                    <p className="inconsolata-ui text-[9px] font-bold text-text-muted  tracking-wider mb-1">{auditor.label}</p>
                                                                    <span className={`inconsolata-ui text-[9px] font-bold  px-2 py-0.5 rounded border ${
                                                                        auditor.vote === 'Solid' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                                                        auditor.vote === 'Developing' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'
                                                                    }`}>{auditor.vote}</span>
                                                                </div>
                                                                <p className="text-[12px] text-text-primary leading-relaxed italic opacity-90">&ldquo;{auditor.data}&rdquo;</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </details>
                                            )}



                                            {sub.dissent_note && (
                                                <div className="p-3 bg-callout-bg border border-border rounded-lg mb-6 flex items-start gap-3">
                                                    <Scale className="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5 opacity-60" />
                                                    <p className="text-[11px] text-text-muted font-medium leading-relaxed">
                                                        <span className="inconsolata-ui text-[10px] font-bold  tracking-wider mr-2 opacity-70">Committee Detail:</span> {sub.dissent_note}
                                                    </p>
                                                </div>
                                            )}

                                            {sub.link && (
                                                <Link href={sub.link} target="_blank" className="inconsolata-ui text-[12px] font-bold text-accent hover:underline flex items-center gap-2  tracking-wide mt-4">
                                                    Source Material <ExternalLink className="w-3.5 h-3.5" />
                                                </Link>
                                            )}


                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center bg-callout-bg border border-dashed border-border rounded-xl">
                                        <p className="manrope-body text-[13px] text-text-muted italic">Awaiting verification logs.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                    </div>
                </main>
            </div>
        </div>
    );
}

function SkillCard({ skill }: { skill: any }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="group py-3 flex flex-col transition-all">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Name & Category */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <h4 className="inconsolata-ui text-[14px] font-bold text-text-heading group-hover:text-accent transition-colors truncate">
                            {skill.name}
                        </h4>
                        <span className="inconsolata-ui text-[9px] font-bold text-text-muted opacity-60 tracking-wide bg-sidebar dark:bg-white/5 px-1.5 py-0.5 rounded uppercase">
                            {skill.category}
                        </span>
                    </div>
                </div>

                {/* Stats - Minimal */}
                <div className="hidden md:flex items-center gap-6 px-6 shrink-0 border-x border-border h-6">
                    <div className="flex items-center gap-2" title="Time Invested">
                        <Clock className="w-3 h-3 text-text-muted opacity-40" />
                        <span className="inconsolata-ui text-[11px] font-bold text-text-heading">{Math.round(skill.time_invested)}h</span>
                    </div>
                    <div className="flex items-center gap-2" title="Contributing Units">
                        <Target className="w-3 h-3 text-text-muted opacity-40" />
                        <span className="inconsolata-ui text-[11px] font-bold text-text-heading">{skill.contributing_roadmap_ids?.length || 1} units</span>
                    </div>
                    {skill.last_assessment_score && (
                        <div className="flex items-center gap-2" title="Benchmark Score">
                            <Award className="w-3 h-3 text-accent opacity-60" />
                            <span className="inconsolata-ui text-[11px] font-bold text-accent">{Math.round(skill.last_assessment_score)}%</span>
                        </div>
                    )}
                </div>

                {/* Score & Tier */}
                <div className="flex items-center gap-3 shrink-0 min-w-[120px] justify-end">
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 text-text-muted hover:text-text-heading hover:bg-sidebar dark:hover:bg-background/5 rounded transition-all"
                        title={isExpanded ? "Hide Analytics" : "Show Analytics"}
                    >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <div className="flex items-center gap-2 bg-callout-bg border border-border px-2 py-1 rounded-md">
                        <span className="inconsolata-ui text-[11px] font-black text-accent opacity-80">
                            {skill.tier || 'F'}
                        </span>
                        <div className="w-[1px] h-3 bg-[var(--border)]" />
                        <span className="inconsolata-ui text-[13px] font-bold text-text-heading">
                            {skill.confidence_score.toFixed(1)}
                        </span>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="mt-4 mb-2 pl-4 border-l-2 border-[var(--accent)] space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { label: 'Project Proof', val: Math.min(skill.pow_score * 40, 40).toFixed(1), max: 40 },
                            { label: 'Recall Score', val: Math.min(skill.practice_score * 30, 30).toFixed(1), max: 30 },
                            { label: 'Topic Coverage', val: Math.min(skill.topic_completion * 15, 15).toFixed(1), max: 15 },
                            { label: 'Concept Depth', val: Math.min(skill.depth_score * 15, 15).toFixed(1), max: 15 }
                        ].map((item) => (
                            <div key={item.label} className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <span className="inconsolata-ui text-[9px] font-bold text-text-muted tracking-wide">{item.label}</span>
                                    <span className="text-[10px] font-bold text-text-heading inconsolata-ui">{item.val}<span className="opacity-30">/{item.max}</span></span>
                                </div>
                                <div className="h-1 w-full bg-callout-bg rounded-full overflow-hidden border border-border">
                                    <div 
                                        className="h-full bg-accent rounded-full transition-all duration-1000" 
                                        style={{ width: `${(parseFloat(item.val) / item.max) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
