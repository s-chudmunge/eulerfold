'use client';

import React, { useEffect, useState } from 'react';
import { 
  Trophy,
} from 'lucide-react';
import { coinsAPI, LeaderboardEntry } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import CommunityRoadmapBanner from '@/components/landing/CommunityRoadmapBanner';

const CATEGORIES = [
  'All', 
  'Programming', 
  'Data Structures', 
  'Algorithms', 
  'System Design', 
  'Software Design',
  'Web Development', 
  'AI/ML', 
  'Machine Learning',
  'Data Science',
  'Database',
  'DevOps',
  'Security',
  'Tools',
  'Career'
];

export default function LeaderboardPage({ 
  initialTopUsers = [], 
  initialUserRank = null 
}: { 
  initialTopUsers?: LeaderboardEntry[], 
  initialUserRank?: LeaderboardEntry | null 
}) {
  const [topUsers, setTopUsers] = useState<LeaderboardEntry[]>(initialTopUsers);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(initialUserRank);
  const [loading, setLoading] = useState(initialTopUsers.length === 0);
  const [category, setCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(100);
  const { user: authUser } = useAuth();

  useEffect(() => {
    async function loadData() {
      // If we already have initial data for 'All' category, don't show full-page loader
      // But we still want to fetch to get the user's specific rank (which SSR lacks)
      const shouldShowLoader = category !== 'All' || topUsers.length === 0;
      if (shouldShowLoader) setLoading(true);

      try {
        const lbData = await coinsAPI.getLeaderboard(category === 'All' ? undefined : category);
        setTopUsers(lbData.top_users);
        setUserRank(lbData.user_rank);
        setVisibleCount(100); // Reset on category change
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [category]);

  // Find users "Near Me"
  let nearMe: LeaderboardEntry[] = [];
  if (userRank) {
    const myIndex = topUsers.findIndex(u => u.is_me);
    if (myIndex !== -1) {
      const start = Math.max(3, myIndex - 2);
      const end = Math.min(topUsers.length, myIndex + 3);
      nearMe = topUsers.slice(start, end);
    }
  }

  const UserRow = ({ user }: { user: LeaderboardEntry }) => (
    <Link 
      href={`/u/${user.username}`}
      className={`flex items-center justify-between px-4 py-2 hover:bg-callout-bg transition-colors group h-[48px] ${user.is_me ? 'bg-accent-muted' : ''}`}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <span className="inconsolata-ui text-[13px] font-bold text-accent w-10 shrink-0">
          #{user.rank.toString().padStart(2, '0')}
        </span>
        <div className="flex flex-col min-w-0">
          <span className="manrope-body text-[14px] font-bold text-text-heading truncate group-hover:text-accent transition-colors">
            {user.author}
          </span>
          <span className="inconsolata-ui text-[10px] font-medium text-text-muted">@{user.username}</span>
        </div>
      </div>

      <div className="flex items-center gap-8 shrink-0">
        <div className="hidden md:flex items-center gap-2">
          <span className="inconsolata-ui text-[11px] font-bold text-text-muted uppercase tracking-tighter">{user.top_skill}</span>
          <span className="text-[10px] font-black text-accent bg-accent-muted px-1.5 py-0.5 rounded">
            {typeof user.top_skill_score === 'number'
              ? user.top_skill_score.toFixed(2)
              : parseFloat(user.top_skill_score || '0').toFixed(2)}
          </span>
        </div>
        <div className="w-16 text-right">
          <span className="inconsolata-ui text-[14px] font-black text-text-heading tabular-nums">
            {typeof user.composite_score === 'number' 
              ? user.composite_score.toFixed(2) 
              : parseFloat(user.composite_score || '0').toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="bg-background text-text-primary">
      <div className="max-w-[1200px] mx-auto px-6 py-8 md:px-10 md:py-12 flex flex-col lg:flex-row gap-10">
        <main className="flex-1 min-w-0">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`inconsolata-ui px-4 py-1.5 rounded-xl text-[12px] font-bold transition-all border
                  ${category === cat 
                    ? 'bg-accent text-white border-accent shadow-sm' 
                    : 'bg-sidebar text-text-muted border-border hover:border-accent/30 hover:text-text-heading'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">
              <div className="h-[1px] w-full bg-[var(--border)]"></div>
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-4 bg-callout-bg rounded"></div>
                    <div className="w-32 h-4 bg-callout-bg rounded"></div>
                  </div>
                  <div className="w-16 h-4 bg-callout-bg rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-12">
              <section>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4 flex-1">
                    <h2 className="inconsolata-ui text-[14px] font-black text-text-heading uppercase">
                      Top Performers
                    </h2>
                    <div className="h-[1px] flex-1 bg-[var(--border)] opacity-30"></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="inconsolata-ui text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      {topUsers.length} MEMBERS
                    </span>
                  </div>
                </div>

                {/* Score breakdown explanation */}
                <div className="mb-6 px-4 py-3 bg-sidebar/30 rounded-lg border border-border/50">
                  <p className="inconsolata-ui text-[11px] text-text-muted leading-relaxed">
                    <span className="font-bold text-accent uppercase tracking-tighter">Composite Score:</span> 30% Skill Confidence + 25% Roadmaps + 20% Practice + 15% Streak + 10% Assessments.
                  </p>
                </div>

                <div className="divide-y divide-[var(--border)] border-t border-b border-border">
                  {/* Header Row */}
                  <div className="flex items-center justify-between px-4 py-2 bg-sidebar/10">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <span className="inconsolata-ui text-[10px] font-bold text-text-muted uppercase w-10">Rank</span>
                      <span className="inconsolata-ui text-[10px] font-bold text-text-muted uppercase">Member</span>
                    </div>
                    <div className="flex items-center gap-8 shrink-0">
                      <div className="hidden md:flex items-center gap-2">
                        <span className="inconsolata-ui text-[10px] font-bold text-text-muted uppercase tracking-tighter">Top Skill / Confidence</span>
                      </div>
                      <div className="w-16 text-right">
                        <span className="inconsolata-ui text-[10px] font-bold text-text-muted uppercase tracking-tighter">Composite</span>
                      </div>
                    </div>
                  </div>

                  {topUsers.length > 0 ? (
                    <>
                      {/* Top 3 */}
                      {topUsers.slice(0, 3).map(user => (
                        <UserRow key={user.rank} user={user} />
                      ))}

                      {/* Near You Separator (only if NOT in top 3 and user exists) */}
                      {userRank && userRank.rank > 3 && (
                        <div className="flex items-center justify-center bg-callout-bg py-2 gap-4 border-y border-border">
                          <span className="inconsolata-ui text-[10px] font-bold text-text-muted uppercase tracking-widest">Your Position</span>
                        </div>
                      )}

                      {/* Users Near Me (only if NOT in top 3 and user exists) */}
                      {userRank && userRank.rank > 3 && (
                        <>
                          {nearMe.map(user => (
                            <UserRow key={user.rank} user={user} />
                          ))}
                        </>
                      )}

                      {/* Rest of the leaderboard list */}
                      <div className="flex items-center justify-center bg-sidebar/40 py-2 gap-4 border-y border-border">
                        <span className="inconsolata-ui text-[10px] font-bold text-text-muted uppercase tracking-widest">Global Rankings</span>
                      </div>

                      {topUsers.slice(3, visibleCount).map(user => (
                        <UserRow key={user.rank} user={user} />
                      ))}

                      {topUsers.length > visibleCount && (
                        <div className="p-8 flex justify-center border-t border-border">
                          <button 
                            onClick={() => setVisibleCount(prev => prev + 100)}
                            className="inconsolata-ui px-8 py-2 bg-accent text-white rounded-xl text-[12px] font-bold hover:shadow-lg transition-all active:scale-95"
                          >
                            LOAD MORE
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="py-24 text-center">
                      <p className="manrope-body text-text-muted text-sm font-medium">No members found in this category yet.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </main>

        {/* Sidebar */}
        <aside className="w-full lg:w-[320px] shrink-0">
           <CommunityRoadmapBanner />
        </aside>
      </div>
    </div>
  );
}
