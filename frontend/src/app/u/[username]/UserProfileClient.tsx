"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Award, 
  BookOpen, 
  Flame, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  ExternalLink, 
  Share2, 
  FileText, 
  Download, 
  Brain, 
  TrendingUp, 
  Target, 
  Check, 
  Github, 
  Search, 
  ArrowUpRight
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/components/AuthProvider';

export interface UserSkillItem {
  id: string;
  canonical_skill_id: string;
  name?: string;
  category?: string;
  confidence_score: number;
  tier: string;
  pow_score: number;
  practice_score: number;
  topic_completion: number;
  depth_score: number;
  time_invested: number;
  last_updated: string;
}

export interface UserCertificateItem {
  id: string;
  roadmap_id: number;
  credential_id: string;
  grade: string;
  average_score: number;
  time_invested_hours: number;
  pdf_url?: string;
  issued_at: string;
  roadmap_title?: string;
  roadmap_subject?: string;
}

export interface UserRoadmapItem {
  id: number;
  title: string;
  created_at?: string;
  updated_at?: string;
  depth_score?: number;
  roadmap_plan?: any;
  calculated_progress?: {
    percent: number;
    completed_topics: number;
    total_topics: number;
  };
}

export interface UserSubmissionItem {
  id: string;
  roadmap_id?: number;
  subtopic_id?: string;
  evaluation_level: 'Solid' | 'Developing' | 'Beginner' | string;
  feedback?: string;
  submitted_at: string;
  homework_submission?: string;
  roadmaps?: {
    title?: string;
  };
}

export interface UserPracticeStats {
  easy: number;
  medium: number;
  hard: number;
  total: number;
  mcq_correct: number;
  mcq_total: number;
}

export interface ProfileData {
  username: string;
  display_name?: string;
  github_username?: string;
  email?: string;
  avatar_url?: string;
  supabase_uid?: string;
  is_pro?: boolean;
  eulercoins: number;
  review_precision: number;
  current_streak: number;
  learning_momentum: {
    mastered: number;
    explored: number;
  };
  total_skills: number;
  total_roadmaps: number;
  total_hours: number;
  last_active?: string;
  skills: UserSkillItem[];
  certificates?: UserCertificateItem[];
  roadmaps?: UserRoadmapItem[];
  submissions?: UserSubmissionItem[];
  practice_stats?: UserPracticeStats;
  mcq_history?: any[];
  discussions?: any[];
}

interface UserProfileClientProps {
  profile: ProfileData;
}

export default function UserProfileClient({ profile }: UserProfileClientProps) {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'skills' | 'roadmaps' | 'submissions' | 'certificates'>('skills');
  const [skillCategoryFilter, setSkillCategoryFilter] = useState<string>('All');
  const [skillSearch, setSkillSearch] = useState<string>('');
  const [selectedSkill, setSelectedSkill] = useState<UserSkillItem | null>(
    profile.skills && profile.skills.length > 0 ? profile.skills[0] : null
  );
  const [copiedLink, setCopiedLink] = useState(false);

  const isOwner = authUser?.username === profile.username || authUser?.email === profile.email;
  const displayName = profile.display_name || profile.username;
  const avatarFallback = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`;
  const avatarSrc = (profile.avatar_url && !profile.avatar_url.includes('initials')) ? profile.avatar_url : avatarFallback;

  // Extract categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    (profile.skills || []).forEach(s => {
      if (s.category) set.add(s.category);
    });
    return ['All', ...Array.from(set)];
  }, [profile.skills]);

  // Filter skills
  const filteredSkills = useMemo(() => {
    return (profile.skills || []).filter(s => {
      const matchCat = skillCategoryFilter === 'All' || s.category === skillCategoryFilter;
      const matchSearch = !skillSearch.trim() || 
        (s.name && s.name.toLowerCase().includes(skillSearch.toLowerCase())) ||
        (s.category && s.category.toLowerCase().includes(skillSearch.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [profile.skills, skillCategoryFilter, skillSearch]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const getTierColor = (tier: string) => {
    const t = (tier || '').toUpperCase();
    if (t.startsWith('A')) return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
    if (t.startsWith('B')) return 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800';
    if (t.startsWith('C')) return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
    return 'text-text-muted bg-sidebar border-border';
  };

  const getEvaluationBadge = (level: string) => {
    if (level === 'Solid') {
      return (
        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
          Verified Solid
        </span>
      );
    }
    if (level === 'Developing') {
      return (
        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
          Developing
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold text-text-muted bg-sidebar border border-border">
        {level}
      </span>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Profile Card */}
      <div className="bg-sidebar border border-border rounded-md p-5 sm:p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <img
              src={avatarSrc}
              alt={displayName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-border object-cover bg-background shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-text-heading tracking-tight">
                  {displayName}
                </h1>
                {profile.is_pro && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-accent/15 text-accent border border-accent/30">
                    Pro
                  </span>
                )}
              </div>
              <p className="text-[13px] text-text-muted mt-0.5">
                @{profile.username}
              </p>
              {profile.github_username && (
                <a
                  href={`https://github.com/${profile.github_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] text-text-muted hover:text-accent transition-colors mt-1.5"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>github.com/{profile.github_username}</span>
                </a>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-background hover:bg-callout-bg text-text-primary text-[12px] font-medium transition-colors"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-accent" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Profile</span>
                </>
              )}
            </button>

            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/profile/${profile.username}/export`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-background hover:bg-callout-bg text-text-primary text-[12px] font-medium transition-colors"
              title="Download verified skill report"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </a>

            {isOwner && (
              <Link
                href="/settings"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent text-white hover:bg-accent/90 text-[12px] font-medium transition-colors"
              >
                Edit Profile
              </Link>
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-border">
          <div className="bg-background border border-border rounded-md p-3">
            <div className="flex items-center gap-2 text-text-muted text-[12px] mb-1">
              <Brain className="w-3.5 h-3.5 text-accent" />
              <span>Skills Tracked</span>
            </div>
            <div className="text-xl font-bold text-text-heading">
              {profile.total_skills}
            </div>
          </div>

          <div className="bg-background border border-border rounded-md p-3">
            <div className="flex items-center gap-2 text-text-muted text-[12px] mb-1">
              <BookOpen className="w-3.5 h-3.5 text-accent" />
              <span>Roadmaps</span>
            </div>
            <div className="text-xl font-bold text-text-heading">
              {profile.total_roadmaps}
            </div>
          </div>

          <div className="bg-background border border-border rounded-md p-3">
            <div className="flex items-center gap-2 text-text-muted text-[12px] mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Streak</span>
            </div>
            <div className="text-xl font-bold text-text-heading">
              {profile.current_streak} <span className="text-[12px] font-normal text-text-muted">days</span>
            </div>
          </div>

          <div className="bg-background border border-border rounded-md p-3">
            <div className="flex items-center gap-2 text-text-muted text-[12px] mb-1">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span>Invested Time</span>
            </div>
            <div className="text-xl font-bold text-text-heading">
              {profile.total_hours} <span className="text-[12px] font-normal text-text-muted">hrs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-sidebar border border-border rounded-md p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-medium text-text-muted">Review Precision</span>
            <Award className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-bold text-text-heading">
            {profile.review_precision ? profile.review_precision.toFixed(1) : '0.0'}%
          </div>
          <p className="text-[12px] text-text-muted mt-1 leading-relaxed">
            Percentage of technical homework evaluated at solid standard.
          </p>
        </div>

        <div className="bg-sidebar border border-border rounded-md p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-medium text-text-muted">30-Day Momentum</span>
            <TrendingUp className="w-4 h-4 text-accent" />
          </div>
          <div className="flex items-baseline gap-3">
            <div>
              <span className="text-2xl font-bold text-text-heading">{profile.learning_momentum?.mastered || 0}</span>
              <span className="text-[12px] text-text-muted ml-1">mastered</span>
            </div>
            <span className="text-text-muted">/</span>
            <div>
              <span className="text-2xl font-bold text-text-heading">{profile.learning_momentum?.explored || 0}</span>
              <span className="text-[12px] text-text-muted ml-1">explored</span>
            </div>
          </div>
          <p className="text-[12px] text-text-muted mt-1 leading-relaxed">
            Active technical skills progressed over the past 30 days.
          </p>
        </div>

        <div className="bg-sidebar border border-border rounded-md p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-medium text-text-muted">Practice Exercises</span>
            <Target className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-bold text-text-heading">
            {profile.practice_stats?.total || 0}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-text-muted mt-1">
            <span>Easy: {profile.practice_stats?.easy || 0}</span>
            <span>•</span>
            <span>Med: {profile.practice_stats?.medium || 0}</span>
            <span>•</span>
            <span>Hard: {profile.practice_stats?.hard || 0}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border mb-6">
        <div className="flex gap-2 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-4 py-2 text-[13px] font-medium border-b-2 rounded-t-md transition-colors whitespace-nowrap ${
              activeTab === 'skills'
                ? 'border-accent text-accent bg-sidebar/50'
                : 'border-transparent text-text-muted hover:text-text-primary hover:border-border'
            }`}
          >
            Technical Skills ({profile.skills?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('roadmaps')}
            className={`px-4 py-2 text-[13px] font-medium border-b-2 rounded-t-md transition-colors whitespace-nowrap ${
              activeTab === 'roadmaps'
                ? 'border-accent text-accent bg-sidebar/50'
                : 'border-transparent text-text-muted hover:text-text-primary hover:border-border'
            }`}
          >
            Roadmaps ({profile.roadmaps?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 text-[13px] font-medium border-b-2 rounded-t-md transition-colors whitespace-nowrap ${
              activeTab === 'submissions'
                ? 'border-accent text-accent bg-sidebar/50'
                : 'border-transparent text-text-muted hover:text-text-primary hover:border-border'
            }`}
          >
            Verified Proof ({profile.submissions?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-4 py-2 text-[13px] font-medium border-b-2 rounded-t-md transition-colors whitespace-nowrap ${
              activeTab === 'certificates'
                ? 'border-accent text-accent bg-sidebar/50'
                : 'border-transparent text-text-muted hover:text-text-primary hover:border-border'
            }`}
          >
            Certificates ({profile.certificates?.length || 0})
          </button>
        </div>
      </div>

      {/* Tab 1: Skills Section */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          {/* Controls: Search and Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search skills or categories..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                className="w-full bg-sidebar border border-border rounded-md pl-9 pr-3 py-1.5 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSkillCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors shrink-0 ${
                    skillCategoryFilter === cat
                      ? 'bg-accent text-white'
                      : 'bg-sidebar border border-border text-text-muted hover:text-text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filteredSkills.length === 0 ? (
            <div className="text-center py-16 bg-sidebar border border-border rounded-md">
              <Brain className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
              <p className="text-[14px] text-text-heading font-medium">No skills found</p>
              <p className="text-[12px] text-text-muted mt-1">Try adjusting your search query or filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Skill list */}
              <div className="lg:col-span-2 space-y-2">
                {filteredSkills.map((skill) => {
                  const isSelected = selectedSkill?.id === skill.id;
                  return (
                    <div
                      key={skill.id}
                      onClick={() => setSelectedSkill(skill)}
                      className={`cursor-pointer bg-sidebar border rounded-md p-3.5 transition-all hover:border-accent/40 ${
                        isSelected ? 'border-accent bg-callout-bg' : 'border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[14px] text-text-heading truncate">
                              {skill.name || 'Unnamed Skill'}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded-md border text-[10px] font-bold ${getTierColor(skill.tier)}`}>
                              Tier {skill.tier}
                            </span>
                          </div>
                          {skill.category && (
                            <span className="text-[11px] text-text-muted block mt-0.5">
                              {skill.category}
                            </span>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-[14px] font-bold text-accent">
                            {Math.round(skill.confidence_score)}%
                          </div>
                          <span className="text-[11px] text-text-muted">
                            {skill.time_invested.toFixed(1)} hrs
                          </span>
                        </div>
                      </div>

                      {/* Confidence bar */}
                      <div className="w-full bg-background rounded-full h-1.5 mt-2.5 overflow-hidden border border-border/50">
                        <div
                          className="bg-accent h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(Math.max(skill.confidence_score, 4), 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Skill Deep Dive / Evidence Panel */}
              <div className="bg-sidebar border border-border rounded-md p-5 sticky top-20 self-start">
                {selectedSkill ? (
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider block">
                          Skill Diagnostic
                        </span>
                        <h3 className="text-base font-bold text-text-heading mt-0.5">
                          {selectedSkill.name}
                        </h3>
                        {selectedSkill.category && (
                          <span className="text-[12px] text-text-muted">
                            {selectedSkill.category}
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${getTierColor(selectedSkill.tier)}`}>
                        Tier {selectedSkill.tier}
                      </span>
                    </div>

                    <div className="bg-background border border-border rounded-md p-3 my-4">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[12px] text-text-muted">Total Confidence</span>
                        <span className="text-xl font-bold text-accent">
                          {Math.round(selectedSkill.confidence_score)}%
                        </span>
                      </div>
                      <div className="text-[11px] text-text-muted mt-1">
                        Invested: <span className="font-semibold text-text-primary">{selectedSkill.time_invested.toFixed(1)} hrs</span>
                      </div>
                    </div>

                    {/* Standard 40/30/15/15 Evidence breakdown */}
                    <div className="space-y-3 pt-2">
                      <span className="text-[12px] font-medium text-text-heading block">
                        Confidence Breakdown (40/30/15/15)
                      </span>

                      <div>
                        <div className="flex justify-between text-[11px] text-text-muted mb-1">
                          <span>Proof of Work (40%)</span>
                          <span className="font-semibold text-text-primary">{Math.round(selectedSkill.pow_score)}%</span>
                        </div>
                        <div className="w-full bg-background rounded-full h-1.5 border border-border/50">
                          <div 
                            className="bg-accent h-full rounded-full" 
                            style={{ width: `${Math.min(selectedSkill.pow_score, 100)}%` }} 
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-text-muted mb-1">
                          <span>Practice Score (30%)</span>
                          <span className="font-semibold text-text-primary">{Math.round(selectedSkill.practice_score)}%</span>
                        </div>
                        <div className="w-full bg-background rounded-full h-1.5 border border-border/50">
                          <div 
                            className="bg-teal-600 h-full rounded-full" 
                            style={{ width: `${Math.min(selectedSkill.practice_score, 100)}%` }} 
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-text-muted mb-1">
                          <span>Topic Completion (15%)</span>
                          <span className="font-semibold text-text-primary">{Math.round(selectedSkill.topic_completion)}%</span>
                        </div>
                        <div className="w-full bg-background rounded-full h-1.5 border border-border/50">
                          <div 
                            className="bg-emerald-600 h-full rounded-full" 
                            style={{ width: `${Math.min(selectedSkill.topic_completion, 100)}%` }} 
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-text-muted mb-1">
                          <span>Concept Depth (15%)</span>
                          <span className="font-semibold text-text-primary">{Math.round(selectedSkill.depth_score)}%</span>
                        </div>
                        <div className="w-full bg-background rounded-full h-1.5 border border-border/50">
                          <div 
                            className="bg-indigo-600 h-full rounded-full" 
                            style={{ width: `${Math.min(selectedSkill.depth_score, 100)}%` }} 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-text-muted pt-4 mt-4 border-t border-border">
                      Last evaluated: {format(new Date(selectedSkill.last_updated), 'MMM d, yyyy')}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-text-muted text-[13px]">
                    Select a skill to inspect its verification signals.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Roadmaps Section */}
      {activeTab === 'roadmaps' && (
        <div className="space-y-4">
          {!profile.roadmaps || profile.roadmaps.length === 0 ? (
            <div className="text-center py-16 bg-sidebar border border-border rounded-md">
              <BookOpen className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
              <p className="text-[14px] text-text-heading font-medium">No published roadmaps</p>
              <p className="text-[12px] text-text-muted mt-1">This user has not linked any public study roadmaps yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.roadmaps.map((rm) => {
                const progress = rm.calculated_progress?.percent || rm.depth_score || 0;
                return (
                  <div
                    key={rm.id}
                    className="bg-sidebar border border-border rounded-md p-4 flex flex-col justify-between hover:border-accent/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-base font-semibold text-text-heading line-clamp-1">
                          {rm.title}
                        </h4>
                        <Link
                          href={`/roadmap/${rm.id}`}
                          className="text-text-muted hover:text-accent transition-colors p-1"
                          title="Open Roadmap"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </div>

                      {rm.calculated_progress && (
                        <div className="text-[12px] text-text-muted mt-1">
                          {rm.calculated_progress.completed_topics} of {rm.calculated_progress.total_topics} topics completed
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-border">
                      <div className="flex justify-between text-[11px] text-text-muted mb-1">
                        <span>Course Progress</span>
                        <span className="font-semibold text-accent">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-background rounded-full h-1.5 border border-border/50">
                        <div
                          className="bg-accent h-full rounded-full"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Verified Proof / Submissions Section */}
      {activeTab === 'submissions' && (
        <div className="space-y-3">
          {!profile.submissions || profile.submissions.length === 0 ? (
            <div className="text-center py-16 bg-sidebar border border-border rounded-md">
              <CheckCircle2 className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
              <p className="text-[14px] text-text-heading font-medium">No verified submissions</p>
              <p className="text-[12px] text-text-muted mt-1">Completed technical homework submissions will appear here.</p>
            </div>
          ) : (
            profile.submissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-sidebar border border-border rounded-md p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[14px] text-text-heading">
                      {sub.roadmaps?.title || 'Technical Submission'}
                    </span>
                    {getEvaluationBadge(sub.evaluation_level)}
                  </div>
                  <span className="text-[11px] text-text-muted">
                    {format(new Date(sub.submitted_at), 'MMM d, yyyy')}
                  </span>
                </div>

                {sub.feedback && (
                  <p className="text-[13px] text-text-secondary bg-background border border-border rounded-md p-3 mt-2 leading-relaxed">
                    {sub.feedback}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Certificates Section */}
      {activeTab === 'certificates' && (
        <div className="space-y-4">
          {!profile.certificates || profile.certificates.length === 0 ? (
            <div className="text-center py-16 bg-sidebar border border-border rounded-md">
              <Award className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
              <p className="text-[14px] text-text-heading font-medium">No issued certificates</p>
              <p className="text-[12px] text-text-muted mt-1">Certificates awarded upon roadmap completion will be displayed here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-sidebar border border-border rounded-md p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold text-accent bg-accent/10 border border-accent/20">
                        Grade {cert.grade}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        {format(new Date(cert.issued_at), 'MMM yyyy')}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-text-heading">
                      {cert.roadmap_title || cert.roadmap_subject || 'Technical Course Completion'}
                    </h4>

                    <div className="text-[12px] text-text-muted mt-2 space-y-1">
                      <div>Score: <span className="font-semibold text-text-primary">{Math.round(cert.average_score)}%</span></div>
                      <div>Time Invested: <span className="font-semibold text-text-primary">{cert.time_invested_hours.toFixed(1)} hrs</span></div>
                      <div>Credential: <span className="font-mono text-[11px]">{cert.credential_id}</span></div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <Link
                      href={`/certificates/${cert.credential_id}`}
                      className="text-[12px] font-medium text-accent hover:underline flex items-center gap-1"
                    >
                      <span>Verify Credential</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    {cert.pdf_url && (
                      <a
                        href={cert.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12px] text-text-muted hover:text-text-primary flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
