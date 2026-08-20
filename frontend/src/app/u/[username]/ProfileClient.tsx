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
    ChevronRight,
    ArrowUpRight,
    Link as LinkIcon,
    CheckCircle2,
    X,
    Flame,
    Zap,
    CheckCircle,
    TrendingUp,
    Linkedin,
    Share2
} from 'lucide-react';

import AppSidebar from '@/components/AppSidebar';
import { Menu, Bell, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { PublicProfile, profileAPI } from '@/lib/api';
import ProfileHeader from '@/components/profile/ProfileHeader';
import FeaturedCourses from '@/components/profile/FeaturedCourses';
import ProvenSkills from '@/components/profile/ProvenSkills';
import VerifiedWork from '@/components/profile/VerifiedWork';

import { 
    SiPython, SiJavascript, SiTypescript, SiReact, SiVuedotjs, SiAngular, 
    SiNextdotjs, SiNodedotjs, SiGo, SiRust, 
    SiTailwindcss, SiPostgresql, SiMysql, SiMongodb, 
    SiDocker, SiKubernetes, SiGooglecloud,
    SiFigma, SiSupabase, SiFirebase
} from 'react-icons/si';

import { FaJava, FaCalculator, FaFlask, FaGlobe, FaBrain, FaBookOpen, FaAws, FaHtml5, FaCss3Alt, FaCode } from 'react-icons/fa';
import { BiAtom, BiDna } from 'react-icons/bi';
import { MdOutlineScience, MdBusinessCenter } from 'react-icons/md';

function getSkillIcon(name: string) {
    const s = (name || '').toLowerCase();
    
    // Tech Stack
    if (s.includes('python')) return <SiPython className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('javascript') || s === 'js') return <SiJavascript className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('typescript') || s === 'ts') return <SiTypescript className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('react')) return <SiReact className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('vue')) return <SiVuedotjs className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('angular')) return <SiAngular className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('next.js') || s.includes('nextjs')) return <SiNextdotjs className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('node') || s.includes('express')) return <SiNodedotjs className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('java ') || s === 'java') return <FaJava className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('go ') || s === 'go' || s === 'golang') return <SiGo className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('rust')) return <SiRust className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('c++') || s.includes('c#') || s.includes('csharp')) return <FaCode className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('html')) return <FaHtml5 className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('css')) return <FaCss3Alt className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('tailwind')) return <SiTailwindcss className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('postgres') || s.includes('sql')) return <SiPostgresql className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('mongo')) return <SiMongodb className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('docker')) return <SiDocker className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('kubernetes') || s.includes('k8s')) return <SiKubernetes className="w-4 h-4 text-inherit opacity-80" />;
    if (s.includes('aws') || s.includes('amazon web')) return <FaAws className="w-4 h-4 text-inherit opacity-80" />;
    if (s.includes('gcp') || s.includes('google cloud')) return <SiGooglecloud className="w-4 h-4 text-inherit opacity-80" />;
    if (s.includes('figma') || s.includes('design')) return <SiFigma className="w-4 h-4 text-inherit opacity-80" />;
    if (s.includes('supabase')) return <SiSupabase className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('firebase')) return <SiFirebase className="w-5 h-5 text-accent opacity-70" />;

    // Subjects
    if (s.includes('math') || s.includes('calculus') || s.includes('algebra')) return <FaCalculator className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('physic') || s.includes('quantum') || s.includes('mechanic')) return <BiAtom className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('chemist')) return <FaFlask className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('biolog') || s.includes('geneti')) return <BiDna className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('science')) return <MdOutlineScience className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('histor') || s.includes('geograph') || s.includes('world')) return <FaGlobe className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('psycholog') || s.includes('philosoph')) return <FaBrain className="w-5 h-5 text-accent opacity-70" />;
    if (s.includes('business') || s.includes('econom') || s.includes('financ')) return <MdBusinessCenter className="w-5 h-5 text-accent opacity-70" />;

    // Fallback
    return <BookOpen className="w-5 h-5 text-accent opacity-40" />;
}

import SkillsProfile from '@/components/dashboard/SkillsProfile';
import ActivityHeatmap from '@/components/profile/ActivityHeatmap';
import TTSListenButton from '@/components/TTSListenButton';
import VerifiedBadge from '@/components/VerifiedBadge';
import { useSettings } from '@/components/SettingsProvider';

interface Props {
    profile: PublicProfile;
}

type TabType = 'overview' | 'skills' | 'evidence' | 'assessments' | 'insights' | 'certificates';

export default function ProfileClient({ profile }: Props) {
    const router = useRouter();
    const { openSettings } = useSettings();
    const [searchQuery, setSearchQuery] = useState("");
    const [isOwner, setIsOwner] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authUser, setAuthUser] = useState<any>(null);
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
        (s.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const strongSkills = (profile.skills || []).filter(s => s.confidence_score >= 80);
    const developingSkills = filteredSkills.filter(s => s.confidence_score >= 40 && s.confidence_score < 80);

    const pAny = profile as any;
    const activeRoadmaps = pAny.roadmaps?.filter((r: any) => r.depth_score > 0 && r.depth_score < 100).sort((a: any, b: any) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime()).slice(0, 2) || [];
    const recentVerified = pAny.submissions?.find((s: any) => s.evaluation_level === 'Solid' || s.evaluation_level === 'Expert');

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

    let effectiveAvatarUrl = (isOwner ? (authUser?.user_metadata?.avatar_url || currentAvatarUrl) : currentAvatarUrl) || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(profile.display_name || profile.username)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`;
    if (effectiveAvatarUrl?.includes('dicebear.com') && effectiveAvatarUrl?.includes('initials')) {
        effectiveAvatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(profile.display_name || profile.username)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`;
    }

    const tabs: { id: TabType; label: string; icon: any; count?: number }[] = [
        { id: 'overview', label: 'Overview', icon: Layout },
        { id: 'skills', label: 'Skills', icon: BarChart3, count: profile.skills?.length },
        { id: 'certificates', label: 'Certificates', icon: Award, count: (profile as any).certificates?.length },
        { id: 'evidence', label: 'Evidence', icon: FileText, count: profile.submissions?.length },
        { id: 'assessments', label: 'Assessments', icon: History, count: profile.mcq_history?.length },
        { id: 'insights', label: 'Insights', icon: MessageSquare, count: profile.discussions?.length },
    ];


    const copyShareLink = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            alert("Profile link copied to clipboard!");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col text-text-primary selection:bg-teal-500/30 font-sans overflow-hidden">
            
            {/* Custom Header (Matches Image) */}
            <header className="border-b border-border bg-header h-[64px] shrink-0 z-50 flex items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 -ml-2 text-text-muted hover:text-text-heading transition-colors"
                    >
                        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                    <span className="text-[16px] font-bold text-text-heading flex items-center gap-2">
                        {profile.display_name || profile.username}'s Details
                    </span>
                </div>

                <div className="flex items-center gap-6">
                    {/* Search Bar */}
                    <div className="hidden md:flex items-center bg-background border border-border rounded-lg px-3 py-1.5 w-[300px]">
                        <Search className="w-4 h-4 text-text-muted mr-2" />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            className="bg-transparent border-none outline-none text-[13px] text-text-heading w-full placeholder:text-text-muted"
                        />
                    </div>
                    
                    <div className="flex items-center gap-4 border-l border-border pl-6">
                        <button className="text-text-muted hover:text-text-heading transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-accent rounded-full border border-background"></span>
                        </button>
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-border">
                            <img src={effectiveAvatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${profile.username}`} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 relative overflow-hidden h-full">
                
                {/* App Sidebar */}
                <AppSidebar 
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}

                />

                {/* Main Scrollable Area */}
                <div className="flex-1 overflow-y-auto no-scrollbar relative w-full">
                    <div className="w-full max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
                        
                        {/* Left Profile Card */}
                        <aside className="w-full lg:w-[320px] shrink-0">
                            <div className="bg-transparent border border-border rounded-xl overflow-hidden sticky top-[20px]">
                                {/* Top Banner Area */}
                                <div className="h-32 bg-accent/10 relative">
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <button 
                                            onClick={copyShareLink}
                                            className="p-2 bg-background/50 hover:bg-background rounded-lg border border-border/50 text-text-heading transition-all backdrop-blur-md"
                                            title="Share Profile"
                                        >
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                        {isOwner && (
                                            <button 
                                                onClick={() => openSettings()}
                                                className="p-2 bg-accent hover:bg-teal-700 rounded-lg text-white transition-all "
                                                title="Edit Profile"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Avatar & Info */}
                                <div className="px-6 pb-6 relative -mt-16 text-center">
                                    <div className="w-28 h-28 mx-auto rounded-full border border-border overflow-hidden bg-header flex items-center justify-center relative group mb-4">
                                        {effectiveAvatarUrl ? (
                                            <img src={effectiveAvatarUrl} alt={profile.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-sidebar flex items-center justify-center text-text-heading text-4xl font-bold inconsolata-ui">
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
                                                        <span className="text-[10px] font-bold text-white uppercase tracking-widest inconsolata-ui">Change</span>
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

                                    <h1 className="text-xl font-bold text-text-heading tracking-tight mb-1 flex items-center justify-center gap-2">
                                        {profile.display_name || profile.username}
                                        {(profile as any).is_pro && <VerifiedBadge size={18} className="text-accent" />}
                                    </h1>
                                    <p className="text-[13px] font-medium text-text-muted mb-6 inconsolata-ui">@{profile.username}</p>
                                    
                                    <div className="space-y-4 text-left border-t border-border/40 pt-6">
                                        {profile.email && isOwner && (
                                            <div className="flex items-center gap-3 text-[12px] text-text-muted">
                                                <Globe className="w-3.5 h-3.5 text-text-muted shrink-0" />
                                                <span className="truncate opacity-80">{profile.email}</span>
                                            </div>
                                        )}
                                        {profile.github_username && (
                                            <Link 
                                                href={`https://github.com/${profile.github_username}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 text-[12px] text-text-muted hover:text-accent transition-colors"
                                            >
                                                <Github className="w-3.5 h-3.5 text-text-muted shrink-0" />
                                                <span className="font-medium truncate">github.com/{profile.github_username}</span>
                                            </Link>
                                        )}
                                        <div className="flex items-center gap-3 text-[12px] text-text-muted">
                                            <Calendar className="w-3.5 h-3.5 text-text-muted shrink-0" />
                                            <span className="font-medium opacity-80">Joined {new Date((profile as any).created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Right Content Area */}
                        <main className="flex-1 min-w-0 flex flex-col gap-6">
                            {/* Top Stats Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-transparent border border-border rounded-xl p-5 flex flex-col">
                                    <div className="mb-4">
                                        
                                        <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Skills Mastered</span>
                                    </div>
                                    <span className="text-3xl font-black text-text-heading mt-auto">{profile.total_skills || 0}</span>
                                </div>

                                <div className="bg-transparent border border-border rounded-xl p-5 flex flex-col">
                                    <div className="mb-4">
                                        
                                        <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Roadmaps</span>
                                    </div>
                                    <span className="text-3xl font-black text-text-heading mt-auto">{profile.total_roadmaps || 0}</span>
                                </div>

                                <div className="bg-transparent border border-border rounded-xl p-5 flex flex-col">
                                    <div className="mb-4">
                                        
                                        <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Hours Invested</span>
                                    </div>
                                    <span className="text-3xl font-black text-text-heading mt-auto">{Math.round(profile.total_hours || 0)}</span>
                                </div>
                            </div>

                            {/* Tabbed Section */}
                            <div className="bg-transparent border border-border rounded-xl overflow-hidden flex-1 flex flex-col min-h-[500px]">
                                <div className="flex overflow-x-auto no-scrollbar border-b border-border/60 bg-transparent">
                                    {tabs.map((tab) => {
                                        const isActive = activeTab === tab.id;
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`flex items-center gap-2 px-6 py-4 text-[13px] font-bold border-b-2 transition-all whitespace-nowrap ${
                                                    isActive 
                                                    ? 'border-text-heading text-text-heading' 
                                                    : 'border-transparent text-text-muted hover:text-text-heading'
                                                }`}
                                            >
                                                {tab.label}
                                                {tab.count !== undefined && tab.count > 0 && (
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] ml-1 ${isActive ? 'bg-accent/10 text-accent' : 'bg-border/50 text-text-muted'}`}>
                                                        {tab.count}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="p-6">
                                    {activeTab === 'overview' && (
                                        <div className="space-y-12 animate-in fade-in duration-300">
                                            <FeaturedCourses roadmaps={activeRoadmaps} />
                                            <ProvenSkills skills={strongSkills} />
                                            <VerifiedWork submissions={pAny.submissions} onSelectReview={setSelectedReview} />
                                        </div>
                                    )}
                                    
                                    {activeTab === 'skills' && (
                                        <div className="animate-in fade-in duration-300">
                                            <ProvenSkills skills={filteredSkills} />
                                        </div>
                                    )}

                                    {activeTab === 'evidence' && (
                                        <div className="animate-in fade-in duration-300">
                                            <VerifiedWork submissions={pAny.submissions} onSelectReview={setSelectedReview} />
                                        </div>
                                    )}

                                    {(activeTab === 'certificates' || activeTab === 'assessments' || activeTab === 'insights') && (
                                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                                            <div className="w-16 h-16 bg-sidebar rounded-full flex items-center justify-center mb-4">
                                                <Target className="w-8 h-8 text-text-muted" />
                                            </div>
                                            <h3 className="text-[15px] font-bold text-text-heading mb-1">No data available</h3>
                                            <p className="text-[13px] text-text-muted">This section is currently empty.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>

            {/* Profile Modals */}
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
    const isSuccess = sub.evaluation_level === 'Solid' || sub.evaluation_level === 'Expert';
    const isWarning = sub.evaluation_level === 'Developing';
    const isError = !isSuccess && !isWarning;
    
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-sidebar border border-border shadow-2xl rounded-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-callout-bg rounded-full text-text-muted transition-colors z-10"
                >
                    <X className="w-4 h-4" />
                </button>
                
                <div className="p-6 md:p-8 flex flex-col h-full overflow-y-auto no-scrollbar">
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`w-12 h-12 shrink-0 rounded-lg flex items-center justify-center ${
                            isSuccess ? 'bg-emerald-500/10 text-emerald-500' : 
                            isWarning ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-[18px] font-bold text-text-heading tracking-tight">Homework Evaluated</h3>
                            <p className="text-[11px] font-bold text-accent uppercase tracking-widest mt-0.5">Status: {sub.evaluation_level}</p>
                            <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-widest opacity-60">
                                Logged on {new Date(sub.submitted_at).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 flex-1 min-h-0">
                        {/* Left column: Summary and Link */}
                        <div className="flex flex-col gap-4 overflow-y-auto pr-2 no-scrollbar">
                            <div className="bg-background/50 border border-border p-4 rounded-lg">
                                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 flex justify-between">
                                    <span>Evaluation Summary</span>
                                    {sub.senate_summary && <TTSListenButton text={`Evaluation: ${sub.senate_summary || sub.evaluation}`} label="summary" />}
                                </h4>
                                <p className="manrope-body text-[13px] text-text-primary leading-relaxed italic">
                                    &ldquo;{sub.senate_summary || sub.evaluation}&rdquo;
                                </p>
                            </div>
                            
                            <div className="bg-background/50 border border-border p-4 rounded-lg">
                                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Submission</h4>
                                <p className="manrope-body text-[13px] text-text-primary leading-relaxed mb-3">
                                    {sub.description}
                                </p>
                                {sub.link && (
                                    <a href={sub.link} target="_blank" rel="noreferrer" className="text-[12px] font-medium text-accent hover:underline break-all flex items-start gap-2">
                                        <LinkIcon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                        {sub.link}
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Right column: Feedback Details */}
                        <div className="flex flex-col min-h-0">
                            <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 shrink-0">Technical Analysis</h4>
                            <div className="space-y-2 overflow-y-auto no-scrollbar pr-1 flex-1">
                                {[
                                    { label: 'Technical Depth', reasoning: sub.senate_reasoning?.technical || sub.senate_reasoning?.technician },
                                    { label: 'Understanding', reasoning: sub.senate_reasoning?.understanding || sub.senate_reasoning?.educator },
                                    { label: 'Relevance', reasoning: sub.senate_reasoning?.relevance || sub.senate_reasoning?.relevance_judge }
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-background/40 border border-border/50 rounded-lg p-3 group hover:border-accent/30 transition-colors">
                                        <div className="flex justify-between items-start mb-1.5">
                                            <span className="text-[12px] font-bold text-text-primary inconsolata-ui tracking-wide">{item.label}</span>
                                            {item.reasoning && (
                                                <TTSListenButton text={`${item.label}: ${item.reasoning}`} label={item.label} />
                                            )}
                                        </div>
                                        <p className="text-[11px] text-text-muted leading-relaxed">
                                            {item.reasoning || 'Not explicitly detailed.'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-2 shrink-0">
                        <button 
                            onClick={onClose}
                            className="w-full py-3 bg-text-heading text-background rounded-lg text-[13px] font-bold tracking-wide hover:opacity-90 transition-all active:scale-[0.98]"
                        >
                            Close
                        </button>
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
