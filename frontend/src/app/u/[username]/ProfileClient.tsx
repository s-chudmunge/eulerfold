"use client";

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { 
    Clock, 
    Target, 
    ChevronDown, 
    ChevronUp, 
    ExternalLink, 
    Download,
    ShieldCheck,
    Award,
    FileText,
    BarChart3,
    Search,
    Globe,
    ArrowRight,
    MessageSquare,
    BookOpen,
    Layout,
    History,
    Edit2,
    Camera,
    Loader2,
    Github,
    Code2,
    X,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { PublicProfile, profileAPI } from '@/lib/api';
import PublicHeader from '@/components/PublicHeader';
import ActivityChart from '@/components/dashboard/ActivityChart';
import ActivityHeatmap from '@/components/profile/ActivityHeatmap';
import TTSListenButton from '@/components/TTSListenButton';
import { useSettings } from '@/components/SettingsProvider';

interface Props {
    profile: PublicProfile;
}

type TabType = 'overview' | 'skills' | 'evidence' | 'assessments' | 'insights';

export default function ProfileClient({ profile }: Props) {
    const { openSettings } = useSettings();
    const [searchQuery, setSearchQuery] = useState("");
    const [isOwner, setIsOwner] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authUser, setAuthUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [uploading, setUploading] = useState(false);
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState(profile.avatar_url);
    const [selectedReview, setSelectedReview] = useState<any>(null);
    const [activityMap, setActivityMap] = useState<Record<string, number> | undefined>(undefined);

    // Section collapse states
    const [isExpertiseOpen, setIsExpertiseOpen] = useState(true);
    const [isAdvancingOpen, setIsAdvancingOpen] = useState(true);

    useEffect(() => {
        setCurrentAvatarUrl(profile.avatar_url);
    }, [profile.avatar_url]);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const data = await profileAPI.getActivity(profile.username);
                setActivityMap(data);
            } catch (err) {
                console.error("Failed to fetch activity:", err);
            }
        };
        fetchActivity();
    }, [profile.username]);

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

    const strongSkills = (profile.skills || []).filter(s => s.confidence_score >= 80);
    const developingSkills = filteredSkills.filter(s => s.confidence_score >= 40 && s.confidence_score < 80);

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

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }
            setUploading(true);
            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${profile.username}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Update Profile in DB via API
            await profileAPI.updateAvatar(publicUrl);
            
            // Update local state
            setCurrentAvatarUrl(publicUrl);
            
            // Also update auth user metadata if possible
            await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            });

        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const effectiveAvatarUrl = isOwner ? (authUser?.user_metadata?.avatar_url || currentAvatarUrl) : currentAvatarUrl;

    const tabs: { id: TabType; label: string; icon: any; count?: number }[] = [
        { id: 'overview', label: 'Overview', icon: Layout },
        { id: 'skills', label: 'Skills', icon: BarChart3, count: profile.skills?.length },
        { id: 'evidence', label: 'Evidence', icon: FileText, count: profile.submissions?.length },
        { id: 'assessments', label: 'Assessments', icon: History, count: profile.mcq_history?.length },
        { id: 'insights', label: 'Insights', icon: MessageSquare, count: profile.discussions?.length },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-background text-text-primary selection:bg-teal-500/30 selection:text-text-heading">
            <PublicHeader />

            <div className="flex-1 pt-6 md:pt-12">
                {/* Profile Header (Tabs Area) - GitHub style */}
                <div 
                    className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-[56px] z-30 hidden md:block"
                    style={{ top: 'calc(56px + var(--announcement-height, 0px))' }}
                >
                    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 flex items-center justify-between">
                        <div className="flex gap-8">
                            {/* Space for sidebar alignment */}
                            <div className="w-[260px] shrink-0"></div>
                            
                            <nav className="flex items-center">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`
                                                flex items-center gap-2 px-4 py-2 text-[12.5px] font-semibold border-b-2 transition-all relative manrope-body tracking-tight
                                                ${activeTab === tab.id 
                                                    ? 'border-accent text-text-heading' 
                                                    : 'border-transparent text-text-muted hover:text-text-heading hover:border-border'}
                                            `}
                                        >
                                            <Icon className={`w-3 h-3 ${activeTab === tab.id ? 'text-accent' : 'opacity-40'}`} />
                                            <span>{tab.label}</span>
                                            {tab.count !== undefined && (
                                                <span className={`ml-1 text-[10.5px] opacity-40 font-medium`}>
                                                    ({tab.count})
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>
                            </div>

                            <button 
                            onClick={handleExportPDF}
                            className="p-1.5 text-text-muted hover:text-accent transition-all opacity-40 hover:opacity-100"
                            title="Download PDF Report"
                            >
                            <Download className="w-3.5 h-3.5" />
                            </button>
                            </div>
                            </div>

                            <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 flex flex-col md:flex-row gap-8 py-8 md:py-12">
                            {/* Sidebar */}
                            <aside className="w-full md:w-[260px] shrink-0 flex flex-col">
                            {/* Avatar/Name Group */}
                            <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-0 mb-6 relative">
                            <div className="w-20 h-20 md:w-full md:h-auto aspect-square rounded-xl border border-border shadow-md overflow-hidden bg-header flex items-center justify-center relative z-10 group">
                                {effectiveAvatarUrl ? (
                                    <img src={effectiveAvatarUrl} alt={profile.username} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-sidebar flex items-center justify-center text-text-heading text-3xl font-bold inconsolata-ui">
                                        {profile.display_name?.[0] || profile.username[0].toUpperCase()}
                                    </div>
                                )}

                                {isOwner && (
                                    <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20">
                                        {uploading ? (
                                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                                        ) : (
                                            <>
                                                <Camera className="w-6 h-6 text-white mb-1" />
                                                <span className="text-[9px] font-bold text-white uppercase tracking-widest inconsolata-ui">Change Photo</span>
                                            </>
                                        )}
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*" 
                                            onChange={handleAvatarUpload}
                                            disabled={uploading}
                                        />
                                    </label>
                                )}
                            </div>

                            <div className="flex-1 md:mt-6">
                                <h1 className="text-[20px] md:text-[22px] font-bold text-text-heading tracking-tight leading-tight inconsolata-ui">
                                    {profile.display_name || profile.username}
                                </h1>
                                <p className="text-[14px] md:text-[15px] font-medium text-text-muted opacity-60 inconsolata-ui">@{profile.username}</p>
                            </div>
                            </div>

                            {isOwner && (
                            <button 
                                onClick={openSettings}
                                className="w-full py-2 mb-8 bg-sidebar border border-border hover:bg-callout-bg rounded-lg text-[11px] font-bold text-text-heading flex items-center justify-center gap-2 transition-all uppercase tracking-widest inconsolata-ui cursor-pointer shadow-sm hover:shadow"
                            >
                                <Edit2 className="w-3 h-3 opacity-60" /> Edit profile
                            </button>
                            )}

                            {/* Bio/Info */}
                            <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3 text-[12px] text-text-muted">
                                <Target className="w-4 h-4 opacity-30 text-accent" />
                                <span className="font-medium">{profile.total_roadmaps} Roadmaps Mastered</span>
                            </div>
                            <div className="flex items-center gap-3 text-[12px] text-text-muted">
                                <Clock className="w-4 h-4 opacity-30 text-accent" />
                                <span className="font-medium">{Math.round(profile.total_hours)} Hours Invested</span>
                            </div>
                            {profile.email && isOwner && (
                                <div className="flex items-center gap-3 text-[12px] text-text-muted">
                                    <Globe className="w-4 h-4 opacity-30 text-accent" />
                                    <span className="truncate opacity-60">{profile.email}</span>
                                </div>
                            )}
                            {profile.github_username && (
                                <Link 
                                    href={`https://github.com/${profile.github_username}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-[12px] text-text-muted hover:text-accent transition-colors"
                                >
                                    <Github className="w-4 h-4 opacity-30 text-accent" />
                                    <span className="font-medium truncate">github.com/{profile.github_username}</span>
                                </Link>
                            )}
                            </div>

                            {/* Intelligence Bars - Pricing page inspiration */}
                            <div className="space-y-4 pt-8 border-t border-border">
                            <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.25em] mb-4 inconsolata-ui">Intelligence Analytics</h3>
                            {(() => {
                                const standardTotal = (profile.practice_stats?.easy || 0) + (profile.practice_stats?.medium || 0) + (profile.practice_stats?.hard || 0);
                                const standardDisplayTotal = standardTotal || 1;
                                return [
                                    { label: 'Level I', count: profile.practice_stats?.easy || 0, color: 'bg-teal-500', total: standardDisplayTotal },
                                    { label: 'Level II', count: profile.practice_stats?.medium || 0, color: 'bg-teal-600', total: standardDisplayTotal },
                                    { label: 'Level III', count: profile.practice_stats?.hard || 0, color: 'bg-teal-700', total: standardDisplayTotal },
                                    { label: 'MCQ Mastery', count: profile.practice_stats?.mcq_correct || 0, color: 'bg-accent', total: profile.practice_stats?.mcq_total || 1 }
                                ].map((item) => {
                                    const percentage = (item.count / item.total) * 100;
                                    return (
                                        <div key={item.label} className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{item.label}</span>
                                                <span className="text-[11px] font-bold text-text-heading tabular-nums">{item.count}{item.label === 'MCQ Mastery' && ` / ${item.total}`}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-sidebar rounded-full overflow-hidden border border-border/50">
                                                <div
                                                    className={`h-full ${item.color} transition-all duration-1000 rounded-full`}
                                                    style={{ width: `${item.count > 0 ? Math.max(percentage, 5) : 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                            </div>                            </aside>

                            {/* Main Content Area */}
                            <main className="flex-1 min-w-0">
                            {/* Mobile Tabs */}
                            <div 
                            className="md:hidden border-b border-border mb-8 overflow-x-auto no-scrollbar bg-sidebar/20 sticky top-[56px] z-30"
                            style={{ top: 'calc(56px + var(--announcement-height, 0px))' }}
                            >
                            <div className="flex whitespace-nowrap px-4">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-3 py-2 text-[12.5px] font-semibold border-b-2 transition-all manrope-body tracking-tight ${activeTab === tab.id ? 'border-accent text-text-heading' : 'border-transparent text-text-muted'}`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            </div>
                        {activeTab === 'overview' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {/* Top Skills Grid */}
                                {strongSkills.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {strongSkills.slice(0, 4).map(skill => (
                                            <div key={skill.id} className="p-5 bg-header border border-border rounded-xl shadow-sm hover:shadow-md hover:border-accent/40 transition-all group relative overflow-hidden">
                                                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors duration-500 pointer-events-none" />
                                                <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <BookOpen className="w-4 h-4 text-accent opacity-40" />
                                                        <h4 className="text-[14px] font-bold text-text-heading group-hover:text-accent transition-colors tracking-tight">
                                                            {skill.name}
                                                        </h4>
                                                    </div>
                                                    <div className="px-2 py-0.5 border border-accent/20 bg-accent/5 text-[10px] font-black text-accent tabular-nums inconsolata-ui tracking-tighter">{skill.tier}</div>
                                                </div>
                                                <p className="text-[11px] text-text-muted mb-6 uppercase tracking-wider font-bold opacity-60">{skill.category}</p>
                                                <div className="flex items-center gap-6 text-[10px] font-bold text-text-muted uppercase tracking-widest inconsolata-ui">
                                                    <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 opacity-40" /> {Math.round(skill.time_invested)}H</span>
                                                    <span className="flex items-center gap-2"><Target className="w-3.5 h-3.5 opacity-40" /> {skill.confidence_score.toFixed(1)}</span>
                                                </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Activity Graph */}
                                <div className="p-6 border border-border rounded-xl shadow-sm bg-header relative overflow-hidden">
                                    <ActivityChart roadmaps={profile.roadmaps} profile={profile} />
                                </div>

                                <ActivityHeatmap profile={profile} activityMap={activityMap} />
                            </div>
                        )}

                        {activeTab === 'skills' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="relative mb-8">
                                    <input 
                                        className="w-full bg-header border border-border rounded-xl shadow-sm px-10 py-3 text-[13px] text-text-heading placeholder:text-text-muted outline-none focus:border-accent transition-all font-bold inconsolata-ui uppercase tracking-widest"
                                        placeholder="Filter Skills..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted opacity-30" />
                                </div>

                                <div className="space-y-6">
                                    {strongSkills.length > 0 && (
                                        <div className="border border-border rounded-xl shadow-sm overflow-hidden bg-header">
                                            <button onClick={() => setIsExpertiseOpen(!isExpertiseOpen)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-sidebar/20 border-b border-border/50">
                                                <h3 className="text-[11px] font-black text-accent tracking-[0.3em] uppercase inconsolata-ui">Expertise // {strongSkills.length}</h3>
                                                {isExpertiseOpen ? <ChevronUp className="w-3.5 h-3.5 text-text-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-text-muted" />}
                                            </button>
                                            {isExpertiseOpen && <div className="px-5 pb-5 divide-y divide-border/30">{strongSkills.map(skill => <SkillCard key={skill.id} skill={skill} />)}</div>}
                                        </div>
                                    )}
                                    {developingSkills.length > 0 && (
                                        <div className="border border-border rounded-xl shadow-sm overflow-hidden bg-header">
                                            <button onClick={() => setIsAdvancingOpen(!isAdvancingOpen)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-sidebar/10 border-b border-border/50">
                                                <h3 className="text-[11px] font-black text-text-muted tracking-[0.3em] uppercase inconsolata-ui">Advancing // {developingSkills.length}</h3>
                                                {isAdvancingOpen ? <ChevronUp className="w-3.5 h-3.5 text-text-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-text-muted" />}
                                            </button>
                                            {isAdvancingOpen && <div className="px-5 pb-5 divide-y divide-border/30">{developingSkills.map(skill => <SkillCard key={skill.id} skill={skill} />)}</div>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'evidence' && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                {profile.submissions && profile.submissions.length > 0 ? (
                                    profile.submissions.map((sub, idx) => (
                                        <div key={idx} className="bg-header border border-border shadow-sm rounded-xl p-6 relative group hover:border-accent/40 hover:shadow-md transition-all duration-300 overflow-hidden">
                                            <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-accent/5 rounded-full blur-[40px] group-hover:bg-accent/10 transition-colors duration-500 pointer-events-none" />
                                            <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-[9px] font-black text-accent bg-accent-muted px-2.5 py-0.5 rounded-md border border-accent/20 inconsolata-ui tracking-widest uppercase">LOG #{profile.submissions.length - idx}</div>
                                                        <div className={`text-[9px] font-black px-2.5 py-0.5 rounded-md border inconsolata-ui tracking-widest uppercase ${
                                                            sub.evaluation_level === 'Solid' || sub.evaluation_level === 'Expert' 
                                                            ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/5' 
                                                            : 'border-blue-500/30 text-blue-600 bg-blue-500/5'
                                                        }`}>{sub.evaluation_level}</div>
                                                    </div>
                                                    <h4 className="text-[15px] font-bold text-text-heading tracking-tight">
                                                        {sub.roadmaps?.title || (sub.roadmap_id ? 'Technical Roadmap' : 'Independent Build')}
                                                    </h4>
                                                </div>
                                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest inconsolata-ui opacity-40">{new Date(sub.submitted_at).toLocaleDateString()}</span>
                                            </div>
                                            <div className="manrope-body prose prose-sm max-w-none text-text-primary mb-6 leading-relaxed font-medium">
                                                <ReactMarkdown 
                                                    remarkPlugins={[remarkMath]} 
                                                    rehypePlugins={[rehypeKatex]}
                                                >
                                                    {sub.senate_summary || sub.evaluation}
                                                </ReactMarkdown>
                                            </div>
                                            <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                                <div className="flex items-center gap-4">
                                                    {sub.link ? (
                                                        <Link href={sub.link} target="_blank" className="text-[10px] font-bold text-accent hover:opacity-80 flex items-center gap-2 uppercase tracking-[0.2em] inconsolata-ui transition-all">
                                                            Source Material <ArrowRight className="w-3 h-3" />
                                                        </Link>
                                                    ) : (
                                                        <div />
                                                    )}
                                                </div>
                                                <button 
                                                    onClick={() => setSelectedReview(sub)}
                                                    className="text-[10px] font-bold text-text-muted hover:text-accent transition-colors uppercase tracking-widest inconsolata-ui flex items-center gap-1.5"
                                                >
                                                    View Full Log <ChevronRight className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center border border-dashed border-border rounded-xl bg-sidebar/5">
                                        <p className="text-[13px] text-text-muted italic opacity-60">Awaiting review logs.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'assessments' && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                {profile.mcq_history && profile.mcq_history.length > 0 ? (
                                    profile.mcq_history.map((mcq, idx) => (
                                        <AssessmentCard key={idx} mcq={mcq} index={profile.mcq_history!.length - idx} />
                                    ))
                                ) : (
                                    <div className="py-20 text-center border border-dashed border-border rounded-xl bg-sidebar/5">
                                        <p className="text-[13px] text-text-muted italic opacity-60">No practice records available.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'insights' && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                {profile.discussions && profile.discussions.length > 0 ? (
                                    profile.discussions.map((disc, idx) => (
                                        <div key={idx} className="bg-header border border-border shadow-sm rounded-xl p-6 relative group hover:border-accent/40 hover:shadow-md transition-all duration-300 overflow-hidden">
                                            <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-accent/5 rounded-full blur-[40px] group-hover:bg-accent/10 transition-colors duration-500 pointer-events-none" />
                                            <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex flex-col gap-2">
                                                    <div className="text-[9px] font-black text-accent bg-accent-muted px-2.5 py-0.5 rounded-md border border-accent/20 w-fit uppercase tracking-widest inconsolata-ui">{disc.context_type}</div>
                                                    <Link href={`/roadmap/${disc.context_id}`} className="text-[15px] font-bold text-text-heading hover:text-accent transition-colors tracking-tight">
                                                        {disc.context_id.replace('-', ' ')}
                                                    </Link>
                                                </div>
                                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest inconsolata-ui opacity-40">{new Date(disc.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div className="text-[13px] text-text-primary leading-relaxed line-clamp-3 mb-6 font-medium">
                                                {disc.content}
                                            </div>
                                            <Link href={`/roadmap/${disc.context_id}`} className="text-[10px] font-bold text-accent hover:opacity-80 flex items-center gap-2 uppercase tracking-[0.2em] inconsolata-ui transition-all">
                                                View Context <ArrowRight className="w-3 h-3" />
                                            </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center border border-dashed border-border rounded-xl bg-sidebar/5">
                                        <p className="text-[13px] text-text-muted italic opacity-60">Awaiting community insights.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Review Details Modal */}
            {selectedReview && (
                <ReviewModal 
                    sub={selectedReview} 
                    onClose={() => setSelectedReview(null)} 
                />
            )}
        </div>
    );
}

/* Review Details Modal component */
function ReviewModal({ sub, onClose }: { sub: any; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl max-h-[85vh] bg-background border border-border shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Fixed Header */}
                <div className="px-8 py-6 border-b border-border flex justify-between items-start bg-background shrink-0">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h3 className="inconsolata-ui text-xl font-bold text-text-heading tracking-tight">Homework Review Record</h3>
                            <div className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest inconsolata-ui border ${
                                sub.evaluation_level === 'Solid' || sub.evaluation_level === 'Expert' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-600' :
                                sub.evaluation_level === 'Developing' ? 'bg-amber-500/5 border-amber-500/10 text-amber-600' :
                                'bg-zinc-500/5 border-zinc-500/10 text-text-muted'
                            }`}>
                                {sub.evaluation_level}
                            </div>
                        </div>
                        <p className="text-[12px] font-bold text-text-muted inconsolata-ui uppercase tracking-wider opacity-60">
                            Logged on {new Date(sub.submitted_at).toLocaleString()}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-text-muted hover:text-text-heading p-1 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-8 overflow-y-auto">
                    <div className="space-y-8 pb-4">
                        <section className="space-y-3">
                            <h4 className="inconsolata-ui text-[11px] font-black uppercase tracking-widest text-text-muted">Submission Overview</h4>
                            <div className="p-5 bg-sidebar/30 border border-border rounded-xl shadow-sm">
                                <p className="text-[15px] text-text-heading leading-relaxed italic">
                                    &ldquo;{sub.description}&rdquo;
                                </p>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h4 className="inconsolata-ui text-[11px] font-black uppercase tracking-[0.2em] text-text-muted">Technical Analysis</h4>
                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { label: 'Technical Depth', reasoning: sub.senate_reasoning?.technical || sub.senate_reasoning?.technician, icon: Code2 },
                                    { label: 'Understanding', reasoning: sub.senate_reasoning?.understanding || sub.senate_reasoning?.educator, icon: Target },
                                    { label: 'Relevance', reasoning: sub.senate_reasoning?.relevance || sub.senate_reasoning?.relevance_judge, icon: ShieldCheck }
                                ].map((item) => (
                                   <div key={item.label} className="p-6 bg-header border border-border rounded-xl shadow-sm space-y-3">
                                       <div className="flex items-center gap-3">
                                           <item.icon className="w-4 h-4 text-accent/50" />
                                           <p className="text-[11px] font-black uppercase tracking-widest text-text-muted inconsolata-ui">{item.label}</p>
                                           {item.reasoning && (
                                               <TTSListenButton text={`${item.label} analysis: ${item.reasoning}`} label={item.label} />
                                           )}
                                       </div>
                                       <p className="text-[14px] text-text-heading leading-relaxed font-medium">
                                           {item.reasoning || 'Not explicitly detailed.'}
                                       </p>
                                   </div>
                                ))}
                                </div>
                                {(sub.senate_summary || sub.evaluation) && (
                                <div className="p-5 bg-accent/5 border border-accent/10 rounded-none flex items-center justify-between gap-4">
                                   <p className="text-[14px] text-accent font-bold leading-relaxed">
                                       Verdict: {sub.senate_summary || sub.evaluation}
                                   </p>
                                   <TTSListenButton 
                                       text={`Final Verdict: ${sub.senate_summary || sub.evaluation}`} 
                                       variant="full" 
                                       label="Listen to Verdict" 
                                   />
                                </div>
                                )}

                        </section>

                        {sub.link && (
                            <section className="space-y-3">
                                <h4 className="inconsolata-ui text-[11px] font-black uppercase tracking-widest text-text-muted">Evidence Chain</h4>
                                <a 
                                    href={sub.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between p-4 bg-background border border-border rounded-none group hover:border-accent/30 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <Github className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" />
                                        <span className="text-[13px] font-bold text-text-heading">View Resource</span>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-text-muted" />
                                </a>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


function SkillCard({ skill }: { skill: any }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="group py-4 flex flex-col transition-all">
            <div className="flex items-center min-h-[40px] gap-4">
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <h4 className="text-[14px] font-bold text-text-heading group-hover:text-accent transition-colors tracking-tight">
                        {skill.name}
                    </h4>
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider opacity-40 bg-sidebar border border-border px-2 py-0.5 rounded-none whitespace-nowrap w-fit inconsolata-ui">
                        {skill.category}
                    </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 text-text-muted/30 hover:text-accent transition-all"
                    >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    
                    <div className="flex items-center h-[28px] bg-sidebar border border-border rounded-none overflow-hidden">
                        <div className="px-2.5 h-full flex items-center bg-accent/[0.05]">
                            <span className="text-[11px] font-black text-accent tracking-tighter inconsolata-ui">
                                {skill.tier || 'F'}
                            </span>
                        </div>
                        <div className="w-px h-full bg-border/50" />
                        <div className="px-2.5 h-full flex items-center">
                            <span className="text-[11px] font-bold text-text-heading tabular-nums inconsolata-ui">
                                {skill.confidence_score.toFixed(1)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="mt-4 mb-2 pl-4 border-l-2 border-accent/20 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2 max-w-[600px]">
                        {[
                            { label: 'Project Evidence', val: Math.min(skill.pow_score * 40, 40).toFixed(1), max: 40 },
                            { label: 'Practice Score', val: Math.min(skill.practice_score * 30, 30).toFixed(1), max: 30 },
                            { label: 'Topic Coverage', val: Math.min(skill.topic_completion * 15, 15).toFixed(1), max: 15 },
                            { label: 'Concept Depth', val: Math.min(skill.depth_score * 15, 15).toFixed(1), max: 15 }
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between py-1 group/metric">
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest inconsolata-ui">{item.label}</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-[11px] font-bold text-text-primary tabular-nums inconsolata-ui">{item.val}</span>
                                    <span className="text-[9px] font-medium text-text-muted opacity-30 inconsolata-ui">/ {item.max}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function AssessmentCard({ mcq, index }: { mcq: any; index: number }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-background border border-border rounded-none p-4 relative group hover:border-accent/40 transition-all duration-200">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <div className="text-[9px] font-black text-accent bg-accent-muted px-2 py-0.5 rounded-none mb-2 w-fit border border-accent/20 inconsolata-ui tracking-widest uppercase">RECORD #{index}</div>
                    <h4 className="text-[14px] font-bold text-text-heading tracking-tight leading-tight">{mcq.topic_name}</h4>
                    <p className="text-[10px] text-text-muted opacity-60 font-bold uppercase tracking-wider mt-0.5">{mcq.subject}</p>
                </div>
                <div className="text-right">
                    <div className="text-[18px] font-black text-accent tabular-nums inconsolata-ui leading-none">{Math.round((mcq.score || 0) * 100)}%</div>
                    <span className="text-[8px] font-bold text-text-muted opacity-40 uppercase tracking-[0.2em] block mt-1">Mastery</span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-3">
                <div className="flex items-center gap-5">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest inconsolata-ui">
                        <Award className="w-3 h-3 text-accent opacity-50" />
                        {mcq.questions.length} Qs
                    </div>
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-[10px] font-bold text-accent hover:underline flex items-center gap-1.5 uppercase tracking-widest inconsolata-ui"
                    >
                        {isExpanded ? (
                            <>Collapse <ChevronUp className="w-2.5 h-2.5" /></>
                        ) : (
                            <>Questions <ChevronDown className="w-2.5 h-2.5" /></>
                        )}
                    </button>
                </div>
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest inconsolata-ui opacity-40">{new Date(mcq.created_at).toLocaleDateString()}</span>
            </div>

            {isExpanded && (
                <div className="mt-5 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300 border-t border-border/30 pt-5">
                    {mcq.questions.map((q: any, qIdx: number) => {
                        const userChoiceIndex = mcq.user_answers?.[qIdx];
                        const isCorrect = userChoiceIndex === q.correct_answer_index;
                        return (
                            <div key={qIdx} className="space-y-3">
                                <div className="flex gap-3">
                                    <span className="text-[10px] font-black text-text-muted/30 inconsolata-ui mt-0.5">Q{qIdx + 1}</span>
                                    <div className="flex-1 space-y-3">
                                        <p className="text-[13px] font-bold text-text-heading leading-relaxed">{q.question}</p>
                                        
                                        <div className="grid grid-cols-1 gap-1.5">
                                            {q.options.map((option: string, optIdx: number) => {
                                                const isUserSelection = optIdx === userChoiceIndex;
                                                const isCorrectOption = optIdx === q.correct_answer_index;
                                                
                                                let bgColor = "bg-sidebar/20";
                                                let borderColor = "border-border/50";
                                                let textColor = "text-text-muted";

                                                if (isUserSelection) {
                                                    if (isCorrect) {
                                                        bgColor = "bg-emerald-500/10";
                                                        borderColor = "border-emerald-500/30";
                                                        textColor = "text-emerald-600";
                                                    } else {
                                                        bgColor = "bg-red-500/10";
                                                        borderColor = "border-red-500/30";
                                                        textColor = "text-red-600";
                                                    }
                                                } else if (isCorrectOption && !isCorrect) {
                                                    bgColor = "bg-emerald-500/5";
                                                    borderColor = "border-emerald-500/20";
                                                    textColor = "text-emerald-600";
                                                }

                                                return (
                                                    <div 
                                                        key={optIdx} 
                                                        className={`px-3 py-1.5 border rounded-none text-[11.5px] font-medium transition-all ${bgColor} ${borderColor} ${textColor} flex items-center justify-between`}
                                                    >
                                                        <span>{option}</span>
                                                        {isUserSelection && (
                                                            <span className="text-[8px] font-black uppercase tracking-widest inconsolata-ui opacity-60">
                                                                {isCorrect ? 'Correct' : 'Your Choice'}
                                                            </span>
                                                        )}
                                                        {isCorrectOption && !isCorrect && (
                                                            <span className="text-[8px] font-black uppercase tracking-widest inconsolata-ui opacity-60">
                                                                Correct
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {q.explanation && (
                                            <div className="p-3 bg-accent/5 border border-accent/10 mt-2">
                                                <p className="text-[11px] text-text-primary leading-relaxed">
                                                    <span className="font-bold text-accent uppercase tracking-widest mr-2">Explanation:</span>
                                                    {q.explanation}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
