"use client";

import React, { useState, useEffect } from 'react';
import PublicHeader from '@/components/PublicHeader';
import { 
  ArrowRight, 
  ChevronRight,
  Plus,
  X,
  RefreshCw,
  Hammer,
  ShieldAlert,
  Activity,
  Package,
  Radio,
  History,
  Award,
  Timer,
  Terminal,
  Cpu,
  Target,
  CreditCard,
  Flame,
  Coins,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { roadmapsAPI, submissionsAPI, sessionsAPI } from '@/lib/api';
import { supabase } from '@/lib/supabase/client';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useRouter } from 'next/navigation';
import CommunityRoadmapBanner from '@/components/landing/CommunityRoadmapBanner';
import GoalGeneratorModal from '@/components/landing/GoalGeneratorModal';

export default function BuildPilotPage() {
  const { user, loading: authLoading, onRefreshProfile } = useAuth();
  const router = useRouter();
  const [activeMissions, setActiveMissions] = useState<any[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<any>(null);
  const [totalProjectsCount, setTotalProjectsCount] = useState(0);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [totalTimeSeconds, setTotalTimeSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // New Project Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectGoal, setProjectGoal] = useState('');
  const [projectSkills, setProjectSkills] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.eulerfold.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "BuildPilot",
        "item": "https://www.eulerfold.com/buildpilot"
      }
    ]
  };

  const userCredits = user?.roadmap_credits || 0;
  const userCoins = user?.eulercoins || 0;
  const userStreak = user?.current_streak || 0;

  useEffect(() => {
    async function loadData() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
           const roadmaps = await roadmapsAPI.getMyRoadmaps();
           
           if (roadmaps.length > 0) {
             const sortedRoadmaps = [...roadmaps].sort((a, b) => 
               new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
             );
             setActiveRoadmap(sortedRoadmaps[0]);
           }

           const projects = roadmaps.filter(r => r.model === 'manual-build');
           setTotalProjectsCount(projects.length);
           setActiveMissions(projects.filter(r => r.status === 'active'));
           
           // Fetch total learning time
           try {
             const timeRes = await sessionsAPI.getTotalTime();
             setTotalTimeSeconds(timeRes.total_seconds);
           } catch (err) {
             console.error("Failed to fetch total time:", err);
           }
           
           // Fetch submissions across all projects
           const allSubs: any[] = [];
           for (const r of projects.slice(0, 10)) { // Increase range for better stats
             try {
               const res = await submissionsAPI.listSubmissions(r.id, session.access_token);
               if (res.submissions) {
                 allSubs.push(...res.submissions.map((s: any) => ({ 
                   ...s, 
                   roadmapTitle: r.title, 
                   roadmapSlug: r.slug 
                 })));
               }
             } catch (err) {
               console.error(`Failed to fetch subs for project ${r.id}:`, err);
             }
           }
           setRecentSubmissions(allSubs.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()));
        }
      } catch (e) {
        console.error("BuildPilot data load failed:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login?next=/buildpilot');
      return;
    }

    if (!projectTitle || !projectGoal) {
      setModalError("Please provide a title and objective.");
      return;
    }

    if (userCredits < 0.5) {
      setModalError("Insufficient credits. Each manual build costs 0.5 credits.");
      return;
    }

    setIsCreating(true);
    setModalError(null);

    try {
      const saved = await roadmapsAPI.createManualBuild({
        title: projectTitle,
        goal: projectGoal,
        skills: projectSkills
      });
      
      // Refresh user profile to show updated credits
      if (onRefreshProfile) await onRefreshProfile();
      
      router.push(`/project/${saved.slug}/build/1`);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || "Failed to create project.";
      setModalError(msg);
      setIsCreating(false);
    }
  };

  const verifiedSubmissions = recentSubmissions.filter(s => s.evaluation_level && s.evaluation_level !== 'Beginner');
  const successRate = recentSubmissions.length > 0 
    ? Math.round((verifiedSubmissions.length / recentSubmissions.length) * 100) 
    : 0;

  const totalHours = Math.floor(totalTimeSeconds / 3600);

  return (
    <div className="min-h-screen bg-background text-text-primary manrope-body selection:bg-teal-500/30 selection:text-teal-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PublicHeader />
      
      <main className="max-w-[1400px] mx-auto px-6 py-12">
        <Breadcrumbs items={[{ label: 'BuildPilot' }]} />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-border/60">
          <div>
            {activeRoadmap ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" />
                    <h1 className="text-xl font-bold text-text-heading tracking-tight">{activeRoadmap.title}</h1>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link href={`/roadmap/${activeRoadmap.slug}`} className="px-3 py-1 bg-sidebar border border-border rounded-md text-[11px] font-bold text-text-muted hover:text-accent hover:border-accent/30 transition-all">
                      Overview
                    </Link>
                    <Link href={`/roadmap/${activeRoadmap.slug}/learn`} className="px-3 py-1 bg-sidebar border border-border rounded-md text-[11px] font-bold text-text-muted hover:text-accent hover:border-accent/30 transition-all">
                      Curriculum
                    </Link>
                    <Link 
                      href={activeRoadmap.model === 'manual-build' ? `/project/${activeRoadmap.slug}/build/1` : `/roadmap/${activeRoadmap.slug}/build/1`} 
                      className="px-3 py-1 bg-accent/5 border border-accent/20 rounded-md text-[11px] font-bold text-accent hover:bg-accent/10 transition-all"
                    >
                      Workspace
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-3xl font-black text-text-heading tracking-tight mb-2">BuildPilot</h1>
                <p className="text-text-muted text-[14px] max-w-xl leading-relaxed">
                  Start your learning journey to track progress and verify skills.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
             <Link href="/explore" className="px-5 py-2.5 bg-sidebar border border-border text-[13px] font-bold text-text-heading hover:bg-background transition-all rounded-lg">
                View roadmaps
             </Link>
             <button 
               onClick={() => setIsModalOpen(true)}
               className="px-5 py-2.5 bg-teal-700 text-white text-[13px] font-bold hover:bg-teal-800 transition-all shadow-lg shadow-teal-700/10 rounded-lg flex items-center gap-2"
             >
                <Plus className="w-4 h-4" /> New project <span className="opacity-60 font-normal">({userCredits})</span>
             </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Sidebar - Goal Architect */}
          <aside className="w-full lg:w-[280px] shrink-0 lg:sticky lg:top-32 self-start order-2 lg:order-1">
             <CommunityRoadmapBanner />
          </aside>

          {/* Main Area: Active Projects */}
          <div className="flex-1 min-w-0 space-y-10 order-1 lg:order-2">
             <section>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="inconsolata-ui text-[11px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-teal-700" />
                    Active projects
                  </h2>
                </div>
                
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                     <RefreshCw className="w-6 h-6 text-teal-700 animate-spin" />
                  </div>
                ) : user ? (
                  <div className="space-y-3">
                    {activeMissions.length > 0 ? (
                      activeMissions.map((mission) => (
                        <div key={mission.id} className="group p-5 bg-sidebar/30 border border-border hover:border-teal-700/30 transition-all flex items-center justify-between rounded-xl">
                          <div className="flex items-center gap-5">
                              <div className="w-12 h-12 bg-background border border-border flex items-center justify-center group-hover:scale-110 transition-transform rounded-lg">
                                <Package className="w-5 h-5 text-text-muted group-hover:text-teal-700 transition-colors" />
                              </div>
                              <div>
                                <h3 className="font-bold text-[15px] text-text-heading mb-0.5 group-hover:text-teal-700 transition-colors">{mission.title}</h3>
                                <p className="text-[12px] text-text-muted truncate max-w-md">{mission.description}</p>
                              </div>
                          </div>
                          <Link href={`/project/${mission.slug}/build/1`} className="p-2 bg-background border border-border rounded-lg hover:text-teal-700 transition-colors">
                              <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      ))
                    ) : (
                      <div className="group p-5 bg-sidebar/30 border border-border hover:border-teal-700/30 transition-all flex items-center justify-between rounded-xl">
                         <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-background border border-border flex items-center justify-center group-hover:scale-110 transition-transform rounded-lg">
                               <Package className="w-5 h-5 text-text-muted" />
                            </div>
                            <div>
                               <h3 className="font-bold text-[15px] text-text-heading mb-0.5">Start your first project</h3>
                               <p className="text-[12px] text-text-muted italic">No active projects found. Click "New project" to start.</p>
                            </div>
                         </div>
                         <button onClick={() => setIsModalOpen(true)} className="p-2 bg-background border border-border rounded-lg hover:text-teal-700 transition-colors">
                            <Plus className="w-4 h-4" />
                         </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-10 border border-dashed border-border flex flex-col items-center text-center rounded-2xl">
                    <Radio className="w-10 h-10 text-text-muted opacity-40 mb-4" />
                    <h3 className="font-bold text-text-heading mb-2">Sign in to track projects</h3>
                    <p className="text-text-muted text-[13px] mb-6 max-w-xs">Connect your account to save your progress and submit work for review.</p>
                    <Link href="/login" className="px-6 py-2 bg-sidebar border border-border text-[12px] font-bold uppercase tracking-widest text-text-heading hover:bg-background transition-all rounded-lg">
                      Sign in
                    </Link>
                  </div>
                )}
             </section>

             <section>
                <h2 className="inconsolata-ui text-[11px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2 mb-5">
                  <History className="w-3.5 h-3.5 text-teal-700" />
                  Review history
                </h2>
                <div className="bg-header border border-border overflow-hidden rounded-xl shadow-sm">
                   <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead className="bg-sidebar/50 border-b border-border">
                           <tr className="inconsolata-ui text-[9px] font-black uppercase tracking-widest text-text-muted">
                              <th className="px-6 py-3.5">Project</th>
                              <th className="px-6 py-3.5">Submission</th>
                              <th className="px-6 py-3.5">Result</th>
                              <th className="px-6 py-3.5 text-right">Score</th>
                           </tr>
                        </thead>
                        <tbody className="manrope-body text-[13px]">
                           {recentSubmissions.length > 0 ? (
                             recentSubmissions.slice(0, 10).map((sub, idx) => (
                               <tr key={idx} className="border-b border-border/50 hover:bg-sidebar/20 transition-colors">
                                  <td className="px-6 py-4 font-bold text-text-heading">
                                     <Link href={`/project/${sub.roadmapSlug}`} className="hover:text-teal-700">
                                       {sub.roadmapTitle}
                                     </Link>
                                  </td>
                                  <td className="px-6 py-4 text-text-muted truncate max-w-xs">{sub.description}</td>
                                  <td className="px-6 py-4">
                                     <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                                       sub.evaluation_level === 'Solid' ? 'bg-teal-500/10 text-teal-700' :
                                       sub.evaluation_level === 'Developing' ? 'bg-blue-500/10 text-blue-700' :
                                       'bg-sidebar text-text-muted'
                                     }`}>
                                       {sub.evaluation_level || 'Pending'}
                                     </span>
                                  </td>
                                  <td className="px-6 py-4 text-right font-mono font-bold">{sub.score || '--'}</td>
                               </tr>
                             ))
                           ) : (
                             <tr className="border-b border-border/50">
                                <td colSpan={4} className="px-6 py-12 text-center text-text-muted italic bg-sidebar/5">
                                   No review history yet. Complete a module to get started.
                                </td>
                             </tr>
                           )}
                        </tbody>
                     </table>
                   </div>
                </div>
             </section>
          </div>

          {/* Sidebar: Stats & Info (Right) */}
          <div className="w-full lg:w-[320px] shrink-0 space-y-8 order-3 lg:sticky lg:top-32 self-start">
             <div className="p-6 bg-sidebar/40 border border-border rounded-xl">
                <h3 className="inconsolata-ui text-[11px] font-black uppercase tracking-widest text-text-muted mb-6">Stats</h3>
                <div className="grid grid-cols-1 gap-5">
                   {/* Row 1: Credits & Coins */}
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-background border border-border rounded-lg">
                         <div className="flex items-center gap-2 mb-1">
                            <CreditCard className="w-3.5 h-3.5 text-teal-700" />
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Credits</span>
                         </div>
                         <span className="text-lg font-black text-text-heading">{userCredits}</span>
                      </div>
                      <div className="p-4 bg-background border border-border rounded-lg">
                         <div className="flex items-center gap-2 mb-1">
                            <Coins className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Coins</span>
                         </div>
                         <span className="text-lg font-black text-text-heading">{userCoins}</span>
                      </div>
                   </div>

                   {/* Row 2: Projects & Streak */}
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-background border border-border rounded-lg">
                         <div className="flex items-center gap-2 mb-1">
                            <Hammer className="w-3.5 h-3.5 text-purple-500" />
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Projects</span>
                         </div>
                         <span className="text-lg font-black text-text-heading">{totalProjectsCount}</span>
                      </div>
                      <div className="p-4 bg-background border border-border rounded-lg">
                         <div className="flex items-center gap-2 mb-1">
                            <Flame className="w-3.5 h-3.5 text-orange-500" />
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Streak</span>
                         </div>
                         <span className="text-lg font-black text-text-heading">{userStreak}d</span>
                      </div>
                   </div>

                   {/* Row 3: Verified & Success Rate */}
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-background border border-border rounded-lg">
                         <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Verified</span>
                         </div>
                         <span className="text-lg font-black text-text-heading">{verifiedSubmissions.length}</span>
                      </div>
                      <div className="p-4 bg-background border border-border rounded-lg">
                         <div className="flex items-center gap-2 mb-1">
                            <Target className="w-3.5 h-3.5 text-rose-500" />
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Success</span>
                         </div>
                         <span className="text-lg font-black text-text-heading">{successRate}%</span>
                      </div>
                   </div>

                   {/* Row 4: Total Time */}
                   <div className="p-4 bg-background border border-border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                         <Timer className="w-3.5 h-3.5 text-blue-500" />
                         <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Learning Time</span>
                      </div>
                      <span className="text-lg font-black text-text-heading">{totalHours}h <span className="text-[12px] text-text-muted font-medium tracking-normal">across all sessions</span></span>
                   </div>

                   <div className="pt-2">
                      <Link href="/dashboard" className="w-full py-2.5 bg-sidebar border border-border text-[11px] font-bold text-text-heading flex items-center justify-center gap-2 hover:bg-background transition-all uppercase tracking-widest rounded-lg">
                         View full profile <ArrowRight className="w-3 h-3" />
                      </Link>
                   </div>
                </div>
             </div>

             <div className="p-6 bg-header border border-border rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="inconsolata-ui text-[11px] font-black uppercase tracking-widest text-text-muted">How it works</h3>
                  <div className="px-2 py-0.5 bg-accent/5 border border-accent/20 rounded-none">
                     <span className="inconsolata-ui text-[8px] font-bold text-accent uppercase tracking-widest">Pro Feature</span>
                  </div>
                </div>
                <p className="text-[12px] text-text-muted leading-relaxed mb-6">
                  The <span className="text-text-heading font-bold">Audit Senate</span> reviews your work across three specialized criteria:
                </p>
                <div className="space-y-5">
                   {[
                     { name: 'Technical quality', desc: 'Checks your code structure, efficiency, and logic.', icon: Terminal },
                     { name: 'Concept depth', desc: 'Checks how well you understand the core principles.', icon: Cpu },
                     { name: 'Topic relevance', desc: 'Checks if your work meets the project goals.', icon: Target }
                   ].map(review => (
                     <div key={review.name} className="flex items-start gap-4">
                        <div className="mt-0.5 shrink-0">
                           <review.icon className="w-4 h-4 text-teal-700" />
                        </div>
                        <div>
                           <span className="text-[13px] font-bold text-text-heading block leading-none mb-1.5">{review.name}</span>
                           <span className="text-[12px] text-text-muted leading-relaxed">{review.desc}</span>
                        </div>
                     </div>
                   ))}
                </div>
                <div className="mt-8 p-4 bg-sidebar/30 border border-border rounded-lg">
                   <p className="text-[11px] text-text-muted italic leading-relaxed mb-2">
                     <span className="font-bold text-text-heading not-italic">Note:</span> Manual builds cost 0.5 credits. There is a 10-minute cooldown if a submission does not pass.
                   </p>
                   <p className="text-[11px] text-text-muted italic leading-relaxed">
                     <span className="font-bold text-text-heading not-italic underline decoration-teal-700/30">Senate Evaluation:</span> Free users get 2 full audits. Pro users get unlimited deep evaluations.
                   </p>
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-background/80" onClick={() => !isCreating && setIsModalOpen(false)} />
           <div className="relative w-full max-w-lg bg-header border border-border shadow-2xl rounded-none animate-in zoom-in-95 duration-200 overflow-hidden">
              <div className="p-8">
                 <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-teal-700/10 flex items-center justify-center text-teal-700">
                          <Hammer className="w-5 h-5" />
                       </div>
                       <div>
                          <h2 className="text-xl font-black text-text-heading tracking-tight">New Project</h2>
                          <p className="text-[12px] text-text-muted">Start a standalone project. Cost: 0.5 Credits.</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => setIsModalOpen(false)}
                      disabled={isCreating}
                      className="p-2 hover:bg-sidebar text-text-muted transition-colors"
                    >
                       <X className="w-5 h-5" />
                    </button>
                 </div>

                 <form onSubmit={handleCreateProject} className="space-y-6">
                    <div className="space-y-2">
                       <label className="inconsolata-ui text-[10px] font-bold uppercase tracking-widest text-text-muted ml-0.5">Project Title</label>
                       <input 
                         type="text"
                         value={projectTitle}
                         onChange={(e) => setProjectTitle(e.target.value)}
                         placeholder="e.g. Real-time Chat Engine"
                         className="w-full px-4 py-3 bg-sidebar/30 border border-border focus:border-teal-700 focus:outline-none transition-all text-[14px] font-bold text-text-heading"
                         required
                         autoFocus
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="inconsolata-ui text-[10px] font-bold uppercase tracking-widest text-text-muted ml-0.5">Objective</label>
                       <textarea 
                         value={projectGoal}
                         onChange={(e) => setProjectGoal(e.target.value)}
                         placeholder="Describe what you want to build and what technical skills you want to prove..."
                         className="w-full px-4 py-3 bg-sidebar/30 border border-border focus:border-teal-700 focus:outline-none transition-all text-[13px] font-medium text-text-heading resize-none h-32"
                         required
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="inconsolata-ui text-[10px] font-bold uppercase tracking-widest text-text-muted ml-0.5">Primary Skills (Optional)</label>
                       <input 
                         type="text"
                         value={projectSkills}
                         onChange={(e) => setProjectSkills(e.target.value)}
                         placeholder="e.g. React, Node.js, PostgreSQL (Comma separated)"
                         className="w-full px-4 py-3 bg-sidebar/30 border border-border focus:border-teal-700 focus:outline-none transition-all text-[14px] font-bold text-text-heading"
                       />
                       <p className="text-[10px] text-text-muted italic ml-1">Help our Audit Senate map your work to specific technical skills.</p>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-sidebar/50 border border-border rounded-lg">
                       <div className="flex items-center gap-2">
                          <CreditCard className="w-3.5 h-3.5 text-text-muted" />
                          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Remaining Credits</span>
                       </div>
                       <span className={`text-[13px] font-black ${userCredits < 0.5 ? 'text-rose-600' : 'text-teal-700'}`}>
                          {userCredits}
                       </span>
                    </div>

                    {modalError && (
                      <div className="p-4 bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
                         <ShieldAlert className="w-4 h-4 text-rose-600" />
                         <p className="text-[12px] font-medium text-rose-600">{modalError}</p>
                      </div>
                    )}

                    <div className="pt-4 flex gap-3">
                       <button 
                         type="button"
                         onClick={() => setIsModalOpen(false)}
                         disabled={isCreating}
                         className="flex-1 py-3 border border-border text-[11px] font-bold uppercase tracking-widest text-text-muted hover:bg-sidebar transition-all"
                       >
                          Cancel
                       </button>
                       <button 
                         type="submit"
                         disabled={isCreating || userCredits < 0.5}
                         className="flex-[2] py-3 bg-teal-700 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-teal-800 transition-all shadow-lg shadow-teal-700/10 flex items-center justify-center gap-3 disabled:opacity-50"
                       >
                          {isCreating ? (
                            <>
                               <RefreshCw className="w-4 h-4 animate-spin" />
                               Creating...
                            </>
                          ) : (
                            <>
                               Start Project
                               <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                       </button>
                    </div>
                    {userCredits < 0.5 && (
                      <p className="text-[10px] text-rose-600 text-center font-bold uppercase tracking-tighter">
                        Insufficient credits to start a new project.
                      </p>
                    )}
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
