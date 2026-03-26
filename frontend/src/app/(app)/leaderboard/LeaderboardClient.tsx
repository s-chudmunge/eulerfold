'use client';

import React, { useEffect, useState } from 'react';
import { 
  Loader2,
  Users,
  ChevronRight,
  TrendingUp,
  ArrowLeft,
  Trophy,
  Target,
  Plus,
  ExternalLink,
  LayoutDashboard,
  X,
  Menu
} from 'lucide-react';
import { coinsAPI, LeaderboardEntry } from '@/lib/api';
import Link from 'next/link';
import { Inconsolata, Manrope } from 'next/font/google';
import AppSidebar from '@/components/AppSidebar';
import { supabase } from '@/lib/supabase/client';

const inconsolata = Inconsolata({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

const CATEGORIES = ['All', 'DSA', 'Python', 'System Design', 'Algorithms', 'Other'];

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
  const [profile, setProfile] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

        // Silent session check
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            try {
                const { data: profileData } = await supabase.from('profiles').select('*').eq('supabase_uid', session.user.id).single();
                if (profileData) setProfile(profileData);
            } catch (e) {
                console.log("Silent profile fetch failed", e);
            }
        }
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

  const TableHeader = () => (
    <div className="flex items-center px-6 py-3 border-b border-border bg-callout-bg text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted inconsolata-ui">
      <div className="w-10 shrink-0">Rank</div>
      <div className="flex-1 min-w-0 ml-4">Learner</div>
      <div className="hidden md:block flex-1 min-w-0">Specialization</div>
      <div className="w-20 text-center hidden sm:block">Units</div>
      <div className="w-20 text-right">Points</div>
    </div>
  );

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
          <span className="text-[10px] font-black text-accent bg-accent-muted px-1.5 py-0.5 rounded">{user.top_skill_score}</span>
        </div>
        <div className="w-16 text-right">
          <span className="inconsolata-ui text-[14px] font-black text-text-heading tabular-nums">
            {user.composite_score}
          </span>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Header */}
      <header className="inconsolata-ui border-b border-border bg-header h-[48px] shrink-0 z-50">
                  <div className="w-full px-4 md:px-6 flex h-full items-center justify-between">
                  <div className="flex items-center gap-2 md:gap-4">
                  <button 
                      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                      className="p-2 -ml-2 lg:hidden text-text-muted hover:text-text-heading transition-colors"
                  >
                      {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                  <Link className="flex items-center group shrink-0" href="/" aria-label="EulerFold Home">
                      <img src="/apple-touch-icon.png" alt="EulerFold" className="w-7 h-7 group-hover:opacity-80 transition-opacity" />
                  </Link>                  <div className="h-4 w-px bg-[var(--border)] mx-2 hidden md:block"></div>
                  <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-accent" />
                      <span className="text-[11px] md:text-[13px] font-bold text-text-muted tracking-wide truncate">Rankings</span>
                  </div>
              </div>

              <div className="flex items-center gap-2 md:gap-4">
                  {profile?.username ? (
                      <Link href="/dashboard" className="text-[10px] md:text-[11px] font-bold text-text-muted hover:text-text-heading transition-colors flex items-center gap-1.5 tracking-wide">
                          <LayoutDashboard className="w-3.5 h-3.5 hidden sm:block" /> <span className="hidden sm:inline">Dashboard</span>
                      </Link>
                  ) : (
                      <Link href="/login" className="text-[10px] md:text-[11px] font-bold text-text-muted hover:text-text-heading transition-colors flex items-center gap-1.5 tracking-wide">
                          <span>Sign In</span>
                      </Link>
                  )}
                  <Link href="/generate" className="whitespace-nowrap rounded-full bg-[var(--text-heading)] px-4 md:px-5 py-1.5 text-[var(--bg-main)] text-[10px] md:text-[12px] font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
                      <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">New Goal</span>
                  </Link>
              </div>
          </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        <AppSidebar 
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 h-full overflow-y-auto bg-background">
          <div className="max-w-[1000px] mx-auto px-6 py-8 md:px-12 md:py-12">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-10">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`inconsolata-ui px-4 py-1.5 rounded-xl text-[12px] font-bold transition-all border
                    ${category === cat 
                      ? 'bg-accent text-white border-[var(--accent)] shadow-sm' 
                      : 'bg-background dark:bg-[#1a1a1a] text-text-primary border-border hover:border-[var(--text-muted)]'
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
                  <div className="flex items-center gap-4 mb-4">
                    <h2 className="inconsolata-ui text-[14px] font-black text-text-heading">
                      Top Performers
                    </h2>
                    <div className="h-[1px] flex-1 bg-[var(--border)] opacity-30"></div>
                    <span className="inconsolata-ui text-[10px] font-bold text-text-muted">
                      {topUsers.length} MEMBERS
                    </span>
                  </div>

                  <div className="divide-y divide-[var(--border)] border-t border-b border-border">
                    {topUsers.length > 0 ? (
                      <>
                        {/* Top 3 */}
                        {topUsers.slice(0, 3).map(user => (
                          <UserRow key={user.rank} user={user} />
                        ))}

                        {/* Near You Separator */}
                        {userRank && userRank.rank > 3 && (
                          <div className="flex items-center justify-center bg-callout-bg py-2 gap-4 border-y border-border">
                            <span className="inconsolata-ui text-[10px] font-bold text-text-muted uppercase tracking-widest">Near Your Rank</span>
                          </div>
                        )}

                        {/* Users Near Me */}
                        {userRank && userRank.rank > 3 && (
                          <>
                            {nearMe.map(user => (
                              <UserRow key={user.rank} user={user} />
                            ))}
                          </>
                        )}

                        {/* Rest of Top 20 */}
                        {!userRank && topUsers.length > 3 && (
                          <>
                            {topUsers.slice(3, 20).map(user => (
                              <UserRow key={user.rank} user={user} />
                            ))}
                          </>
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
          </div>
        </main>
      </div>
    </div>
  );
}
