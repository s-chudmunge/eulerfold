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
    X,
    User as UserIcon,
    Info
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { PublicProfile } from '@/lib/api';
import ShareMenu from '@/components/ShareMenu';
import PublicHeader from '@/components/PublicHeader';

interface Props {
    profile: PublicProfile;
}

export default function ProfileClient({ profile }: Props) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isOwner, setIsOwner] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [authUser, setAuthUser] = useState<any>(null);

    // Section collapse states
    const [isExpertiseOpen, setIsExpertiseOpen] = useState(true);
    const [isAdvancingOpen, setIsAdvancingOpen] = useState(true);
    const [isFoundationsOpen, setIsFoundationsOpen] = useState(false);
    const [isLogsOpen, setIsLogsOpen] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
            if (session?.user) {
                setAuthUser(session.user);
                if (profile.supabase_uid) {
                    if (session.user.id === profile.supabase_uid) {
                        setIsOwner(true);
                    }
                } else if (session.user.email === profile.email) {
                    setIsOwner(true);
                }
            }
        };
        checkAuth();
    }, [profile.email, profile.supabase_uid]);

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

    // Prioritize user_metadata if it's the owner
    const effectiveAvatarUrl = isOwner ? (authUser?.user_metadata?.avatar_url || profile.avatar_url) : profile.avatar_url;

    return (
        <div className="min-h-screen flex flex-col bg-background text-text-primary selection:bg-teal-500/30 selection:text-text-heading">
            <PublicHeader />

            <div 
                className="flex flex-1 relative h-full overflow-hidden transition-all duration-500 ease-in-out pt-[68px]"
            >
                {/* Mobile Overlay */}
                {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/20 z-[35] lg:hidden backdrop-blur-[2px] transition-all top-[68px]"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside 
                    className={`
                        manrope-body bg-sidebar border-r border-border w-[220px] flex flex-col shrink-0 z-40 
                        fixed bottom-0 left-0 transition-all duration-200 ease-in-out
                        lg:static lg:translate-x-0 pt-[20px]
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}
                >
                    <div className="p-5 flex flex-col h-full overflow-y-auto no-scrollbar">
                        <div className="mb-5">
                            <div className="w-16 h-16 rounded-full border-2 border-background shadow-md overflow-hidden bg-gradient-to-br from-teal-500/20 to-teal-700/20 flex items-center justify-center relative">
                                {effectiveAvatarUrl ? (
                                    <img src={effectiveAvatarUrl} alt={profile.username} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-teal-700 flex items-center justify-center text-white text-xl font-bold">
                                        {profile.display_name?.[0] || profile.username[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mb-6">
                            <h1 className="text-[16px] font-bold text-text-heading tracking-tight leading-tight">
                                {profile.display_name || profile.username}
                            </h1>
                            <p className="text-[12px] font-medium text-text-muted opacity-60 mt-0.5">@{profile.username}</p>
                        </div>

                        {/* Highlights */}
                        <div className="space-y-0.5 mb-6">
                            <p className="px-2 mb-2 text-[10px] font-bold text-gray-400 tracking-widest">Highlights</p>
                            {[
                                { label: 'Skills', val: profile.skills?.length || 0, icon: BarChart3 },
                                { label: 'Evidence', val: profile.submissions?.length || 0, icon: FileText },
                                { label: 'Roadmaps', val: profile.total_roadmaps || 0, icon: Target },
                                { label: 'Benchmarks', val: profile.skills?.filter(s => s.last_assessment_score).length || 0, icon: Award }
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between px-2 py-1.5 rounded-lg text-[12px] font-medium text-gray-700 dark:text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <item.icon className="w-3.5 h-3.5 opacity-50" />
                                        <span>{item.label}</span>
                                    </div>
                                    <span className="font-bold text-text-heading">{item.val}</span>
                                </div>
                            ))}
                        </div>

                        {/* Practice Stats */}
                        <div className="px-2 mb-6">
                            <p className="mb-3 text-[10px] font-bold text-gray-400 tracking-widest">Practice</p>
                            <div className="space-y-3.5">
                                {[
                                    { label: 'Level I', count: profile.practice_stats?.easy || 0, color: 'bg-teal-500' },
                                    { label: 'Level II', count: profile.practice_stats?.medium || 0, color: 'bg-teal-600' },
                                    { label: 'Level III', count: profile.practice_stats?.hard || 0, color: 'bg-teal-700' }
                                ].map((item) => {
                                    const total = profile.practice_stats?.total || 1;
                                    const percentage = (item.count / total) * 100;
                                    return (
                                        <div key={item.label} className="space-y-1.5">
                                            <div className="flex justify-between items-end">
                                                <span className="text-[10px] font-bold text-text-muted">{item.label}</span>
                                                <span className="text-[11px] font-black text-text-heading">{item.count}</span>
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

                        {/* Grading Scale Reference */}
                        <div className="px-2 mb-6 pt-2 border-t border-border/40">
                            <p className="mb-3 text-[10px] font-bold text-gray-400 tracking-widest">Grading scale</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-4">
                                {[
                                    { t: 'A+', s: '95+' },
                                    { t: 'A', s: '90+' },
                                    { t: 'A-', s: '85+' },
                                    { t: 'B+', s: '80+' },
                                    { t: 'B', s: '75+' },
                                    { t: 'B-', s: '70+' },
                                    { t: 'C', s: '60+' },
                                    { t: 'D', s: '40+' },
                                ].map((item) => (
                                    <div key={item.t} className="flex items-center justify-between py-0.5 group/grade">
                                        <span className="text-[10px] font-black text-accent opacity-70 group-hover/grade:opacity-100 transition-opacity">{item.t}</span>
                                        <span className="text-[10px] font-bold text-text-muted/50 tabular-nums">{item.s}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Subject Master Rule */}
                            <div className="mt-4 p-3 rounded-xl bg-accent/[0.03] border border-accent/10">
                                <div className="flex items-start gap-2 mb-2 text-accent">
                                    <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                    <span className="text-[10px] font-bold tracking-tight leading-tight">Subject master rule</span>
                                </div>
                                <p className="text-[10px] leading-relaxed text-text-muted/80 font-medium italic">
                                    Topic deviation is acceptable if the learner demonstrates mastery of the roadmap subject and module objectives.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto p-4 border-t border-border bg-sidebar/50">
                        <div className="flex flex-col items-center gap-1.5 py-1">
                            <div className="flex gap-1">
                                <div className="w-1 h-1 rounded-full bg-accent"></div>
                                <div className="w-1 h-1 rounded-full bg-accent"></div>
                                <div className="w-1 h-1 rounded-full bg-accent"></div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 h-full overflow-y-auto bg-background">
                    <div className="max-w-[850px] mx-auto px-6 py-8 md:px-10">
                        
                        {/* Search Bar */}
                        <div className="relative mb-8">
                            <input 
                                className="w-full bg-callout-bg border border-border rounded-xl px-10 py-2.5 text-[14px] text-text-heading placeholder:text-text-muted outline-none focus:ring-1 focus:ring-accent/20 focus:border-accent transition-all font-semibold manrope-body"
                                placeholder="Search proven skills..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted opacity-50" />
                        </div>

                        {/* Skills Section */}
                        <section className="mb-12">
                            <div className="flex items-center gap-4 mb-6">
                                <h2 className="manrope-body text-[12px] font-bold text-text-muted tracking-[0.1em]">Technical growth</h2>
                                <div className="h-[1px] flex-1 bg-border opacity-50"></div>
                            </div>

                            <div className="space-y-6">
                                {strongSkills.length > 0 && (
                                    <div className="border border-border rounded-xl overflow-hidden bg-sidebar/10">
                                        <button 
                                            onClick={() => setIsExpertiseOpen(!isExpertiseOpen)}
                                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-sidebar/20 transition-colors"
                                        >
                                            <h3 className="manrope-body text-[10px] font-black text-accent tracking-widest flex items-center gap-2">
                                                Expertise <span className="px-1.5 py-0.5 rounded-md bg-accent/10 text-[9px]">{strongSkills.length}</span>
                                            </h3>
                                            {isExpertiseOpen ? <ChevronUp className="w-3.5 h-3.5 text-text-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-text-muted" />}
                                        </button>
                                        {isExpertiseOpen && (
                                            <div className="px-4 pb-4 divide-y divide-border/50 animate-in fade-in slide-in-from-top-1 duration-200">
                                                {strongSkills.map(skill => <SkillCard key={skill.id} skill={skill} />)}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {developingSkills.length > 0 && (
                                    <div className="border border-border rounded-xl overflow-hidden bg-sidebar/5">
                                        <button 
                                            onClick={() => setIsAdvancingOpen(!isAdvancingOpen)}
                                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-sidebar/10 transition-colors"
                                        >
                                            <h3 className="manrope-body text-[10px] font-black text-text-muted tracking-widest flex items-center gap-2">
                                                Advancing <span className="px-1.5 py-0.5 rounded-md bg-text-muted/10 text-[9px]">{developingSkills.length}</span>
                                            </h3>
                                            {isAdvancingOpen ? <ChevronUp className="w-3.5 h-3.5 text-text-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-text-muted" />}
                                        </button>
                                        {isAdvancingOpen && (
                                            <div className="px-4 pb-4 divide-y divide-border/50 animate-in fade-in slide-in-from-top-1 duration-200">
                                                {developingSkills.map(skill => <SkillCard key={skill.id} skill={skill} />)}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {exposureSkills.length > 0 && (
                                    <div className="border border-border rounded-xl overflow-hidden bg-sidebar/5">
                                        <button 
                                            onClick={() => setIsFoundationsOpen(!isFoundationsOpen)}
                                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-sidebar/10 transition-colors opacity-60"
                                        >
                                            <h3 className="manrope-body text-[10px] font-black text-text-muted tracking-widest flex items-center gap-2">
                                                Foundations <span className="px-1.5 py-0.5 rounded-md bg-text-muted/10 text-[9px]">{exposureSkills.length}</span>
                                            </h3>
                                            {isFoundationsOpen ? <ChevronUp className="w-3.5 h-3.5 text-text-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-text-muted" />}
                                        </button>
                                        {isFoundationsOpen && (
                                            <div className="px-4 pb-4 divide-y divide-border/50 animate-in fade-in slide-in-from-top-1 duration-200">
                                                {exposureSkills.map(skill => <SkillCard key={skill.id} skill={skill} />)}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {filteredSkills.length === 0 && (
                                    <div className="py-12 text-center bg-callout-bg border border-dashed border-border rounded-xl">
                                        <p className="manrope-body text-[13px] text-text-muted font-medium italic opacity-60">No artifacts matching &quot;{searchQuery}&quot; found.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Submissions Section */}
                        <section className="mb-12">
                            <div className="flex items-center gap-4 mb-6">
                                <h2 className="manrope-body text-[12px] font-bold text-text-muted tracking-[0.1em]">Verification logs</h2>
                                <div className="h-[1px] flex-1 bg-border opacity-50"></div>
                            </div>

                            <div className="space-y-4">
                                <div className="border border-border rounded-xl overflow-hidden bg-sidebar/5">
                                    <button 
                                        onClick={() => setIsLogsOpen(!isLogsOpen)}
                                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-sidebar/10 transition-colors"
                                    >
                                        <h3 className="manrope-body text-[10px] font-black text-text-muted tracking-widest flex items-center gap-2">
                                            Evidence logs <span className="px-1.5 py-0.5 rounded-md bg-text-muted/10 text-[9px]">{profile.submissions?.length || 0}</span>
                                        </h3>
                                        {isLogsOpen ? <ChevronUp className="w-3.5 h-3.5 text-text-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-text-muted" />}
                                    </button>
                                    {isLogsOpen && (
                                        <div className="p-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                            {profile.submissions && profile.submissions.length > 0 ? (
                                                profile.submissions.map((sub, idx) => (
                                                    <div key={idx} className="bg-background border border-border rounded-xl p-6 relative group hover:border-accent/50 transition-all duration-200">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="flex flex-col gap-1.5">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="manrope-body text-[9px] font-black text-accent bg-accent-muted px-2 py-0.5 rounded-full">
                                                                        Log #{profile.submissions.length - idx}
                                                                    </div>
                                                                    <div className={`manrope-body text-[9px] font-black px-2 py-0.5 rounded-full border ${
                                                                        sub.evaluation_level === 'Solid' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                                                                        sub.evaluation_level === 'Developing' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' :
                                                                        'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20'
                                                                    }`}>
                                                                        {sub.evaluation_level}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="manrope-body text-[11px] font-bold text-text-muted tracking-tight opacity-70">
                                                                        {sub.roadmaps?.title || 'Technical Roadmap'}
                                                                    </span>
                                                                    <span className="w-1 h-1 bg-border rounded-full"></span>
                                                                    <span className="manrope-body text-[11px] font-bold text-text-muted tracking-tight opacity-70">
                                                                        Module {sub.module_number}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <span className="manrope-body text-[10px] font-bold text-text-muted opacity-40">
                                                                {new Date(sub.submitted_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                            </span>
                                                        </div>

                                                        <div className="manrope-body prose prose-sm max-w-none text-text-primary mb-4 leading-relaxed font-medium">
                                                            {sub.is_senate_eval && sub.senate_summary ? (
                                                                <p className="text-[14px] font-bold text-text-heading leading-relaxed border-l-2 border-accent pl-4 py-1 italic bg-accent-muted/20 rounded-r-lg">
                                                                    &ldquo;{sub.senate_summary}&rdquo;
                                                                </p>
                                                            ) : (
                                                                <ReactMarkdown components={{
                                                                    h3: ({node, ...props}) => <h3 className="manrope-body text-[14px] font-bold tracking-tight mt-4 mb-2 text-text-heading" {...props} />,
                                                                    p: ({node, ...props}) => <p className="mb-3 leading-relaxed" {...props} />,
                                                                    ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1.5 opacity-90" {...props} />,
                                                                    li: ({node, ...props}) => <li className="text-[13px]" {...props} />,
                                                                    code: ({node, ...props}) => <code className="bg-callout-bg border border-border px-1.5 py-0.5 rounded text-[12px] font-mono text-accent font-bold" {...props} />,
                                                                    pre: ({node, ...props}) => <pre className="bg-text-heading text-background p-4 rounded-xl my-4 overflow-x-auto font-mono text-[11px]" {...props} />,
                                                                }}>
                                                                    {sub.evaluation}
                                                                </ReactMarkdown>
                                                            )}
                                                        </div>

                                                        {sub.is_senate_eval && sub.senate_reasoning && (
                                                            <details className="group/audit mb-4">
                                                                <summary className="manrope-body text-[10px] font-black text-text-muted cursor-pointer hover:text-accent transition-colors list-none flex items-center gap-2">
                                                                    <ChevronDown className="w-3 h-3 group-open/audit:rotate-180 transition-transform" />
                                                                    Audit evidence
                                                                </summary>
                                                                <div className="mt-3 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                    {[
                                                                        { id: 'technician', label: 'Technical depth', data: sub.senate_reasoning.technician, vote: sub.senate_votes?.[0] },
                                                                        { id: 'educator', label: 'Learning proof', data: sub.senate_reasoning.educator, vote: sub.senate_votes?.[1] },
                                                                        { id: 'relevance_judge', label: 'Alignment', data: sub.senate_reasoning.relevance_judge, vote: sub.senate_votes?.[2] }
                                                                    ].map((auditor) => (
                                                                        <div key={auditor.id} className="flex flex-col md:flex-row gap-2 md:gap-6 p-4 rounded-xl bg-callout-bg border border-border hover:border-accent/30 transition-all">
                                                                            <div className="w-full md:w-32 shrink-0">
                                                                                <p className="manrope-body text-[9px] font-black text-text-muted mb-1">{auditor.label}</p>
                                                                                <span className={`manrope-body text-[9px] font-black px-2 py-0.5 rounded-full border ${
                                                                                    auditor.vote === 'Solid' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                                                                    auditor.vote === 'Developing' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'
                                                                                }`}>{auditor.vote}</span>
                                                                            </div>
                                                                            <p className="text-[13px] text-text-primary leading-relaxed italic opacity-90 manrope-body font-medium">&ldquo;{auditor.data}&rdquo;</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </details>
                                                        )}

                                                        {sub.link && (
                                                            <Link href={sub.link} target="_blank" className="manrope-body text-[11px] font-bold text-accent hover:text-teal-500 flex items-center gap-1.5 tracking-wide mt-2 transition-colors">
                                                                Source material <ArrowRight className="w-3 h-3" />
                                                            </Link>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-12 text-center bg-callout-bg border border-dashed border-border rounded-xl">
                                                    <p className="manrope-body text-[13px] text-text-muted font-medium italic opacity-60">Awaiting verification logs.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Export Section at Bottom */}
                        <div className="mt-20 pt-12 border-t border-border/50 flex flex-col items-center text-center">
                            <div className="mb-6">
                                <EulerLogoCanvas size={32} className="opacity-20 grayscale" />
                            </div>
                            <h3 className="manrope-body text-[16px] font-bold text-text-heading mb-2">Download your verified profile</h3>
                            <p className="manrope-body text-[13px] text-text-muted max-w-sm mb-8">
                                Get a PDF version of your skills to add to your resume or share on social media.
                            </p>
                            <button 
                                onClick={handleExportPDF}
                                className="inline-flex items-center gap-2.5 px-8 py-3 bg-text-heading text-background rounded-full font-bold text-[13px] hover:opacity-90 transition-all shadow-xl shadow-black/5"
                            >
                                <Download className="w-4 h-4" /> Download audit report (PDF)
                            </button>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}

function SkillCard({ skill }: { skill: any }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="group py-1.5 flex flex-col transition-all">
            <div className="flex items-center min-h-[40px] gap-4">
                {/* Name & Category */}
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <h4 className="manrope-body text-[14px] font-bold text-text-heading group-hover:text-accent transition-colors tracking-tight leading-tight">
                        {skill.name}
                    </h4>
                    <span className="manrope-body text-[9px] font-semibold text-text-muted opacity-40 bg-sidebar dark:bg-white/5 px-2 py-0.5 rounded-md whitespace-nowrap w-fit">
                        {skill.category}
                    </span>
                </div>

                {/* Stats - Tabular look */}
                <div className="hidden lg:flex items-center gap-6 px-6 border-x border-border/50 h-4">
                    <div className="flex items-center gap-1.5" title="Time invested">
                        <Clock className="w-3 h-3 text-text-muted opacity-20" />
                        <span className="manrope-body text-[11px] font-bold text-text-muted/60">{Math.round(skill.time_invested)}h</span>
                    </div>
                    <div className="flex items-center gap-1.5" title="Contributing units">
                        <Target className="w-3 h-3 text-text-muted opacity-20" />
                        <span className="manrope-body text-[11px] font-bold text-text-muted/60">{skill.contributing_roadmap_ids?.length || 1} units</span>
                    </div>
                </div>

                {/* Report Card Style Grade/Score */}
                <div className="flex items-center gap-2 shrink-0">
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 text-text-muted/30 hover:text-accent hover:bg-sidebar rounded transition-all"
                    >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    
                    <div className="flex items-center h-[30px] bg-sidebar border border-border rounded-lg overflow-hidden shadow-sm">
                        <div className="px-2.5 h-full flex items-center bg-accent/[0.03]">
                            <span className="manrope-body text-[12px] font-black text-accent tracking-tighter">
                                {skill.tier || 'F'}
                            </span>
                        </div>
                        <div className="w-px h-full bg-border/50" />
                        <div className="px-2.5 h-full flex items-center">
                            <span className="manrope-body text-[12px] font-bold text-text-heading tabular-nums">
                                {skill.confidence_score.toFixed(1)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="mt-3 mb-4 pl-4 border-l-2 border-accent/20 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2 max-w-[600px]">
                        {[
                            { label: 'Project evidence', val: Math.min(skill.pow_score * 40, 40).toFixed(1), max: 40 },
                            { label: 'Practice score', val: Math.min(skill.practice_score * 30, 30).toFixed(1), max: 30 },
                            { label: 'Topic coverage', val: Math.min(skill.topic_completion * 15, 15).toFixed(1), max: 15 },
                            { label: 'Concept depth', val: Math.min(skill.depth_score * 15, 15).toFixed(1), max: 15 }
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between group/metric py-0.5">
                                <span className="manrope-body text-[11px] font-medium text-text-muted/80 whitespace-nowrap">
                                    {item.label}
                                </span>
                                <div className="mx-2 h-px flex-1 border-b border-dotted border-border opacity-40 group-hover/metric:opacity-100 transition-opacity"></div>
                                <div className="flex items-baseline gap-1">
                                    <span className="manrope-body text-[11px] font-bold text-text-primary tabular-nums">
                                        {item.val}
                                    </span>
                                    <span className="manrope-body text-[9px] font-medium text-text-muted opacity-30">
                                        / {item.max}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper component for EulerLogoCanvas if needed, or import it if it exists globally
// I'll assume it exists or use a simple image fallback if not found
import EulerLogoCanvas from '@/components/EulerLogoCanvas';