// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';

// Optimized lucide imports
import LogOut from 'lucide-react/dist/esm/icons/log-out';
import UserIcon from 'lucide-react/dist/esm/icons/user';
import Menu from 'lucide-react/dist/esm/icons/menu';
import X from 'lucide-react/dist/esm/icons/x';
import LayoutDashboard from 'lucide-react/dist/esm/icons/layout-dashboard';
import Home from 'lucide-react/dist/esm/icons/home';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Settings from 'lucide-react/dist/esm/icons/settings';
import Globe from 'lucide-react/dist/esm/icons/globe';
import Trophy from 'lucide-react/dist/esm/icons/trophy';
import Plus from 'lucide-react/dist/esm/icons/plus';
import LogIn from 'lucide-react/dist/esm/icons/log-in';
import HelpCircle from 'lucide-react/dist/esm/icons/help-circle';
import Search from 'lucide-react/dist/esm/icons/search';
import GraduationCap from 'lucide-react/dist/esm/icons/graduation-cap';
import CreditCard from 'lucide-react/dist/esm/icons/credit-card';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { coinsAPI, authAPI } from '@/lib/api';
import { Inconsolata } from 'next/font/google';

const inconsolata = Inconsolata({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const ProfileDropdown = ({ user, profile, handleSignOut }: { user: any; profile: any; handleSignOut: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const firstName = user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0];
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Profile menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center space-x-2 px-2 py-1 bg-sidebar/50 dark:bg-[#2c2c2e]/50 backdrop-blur-sm border border-border dark:border-white/5 rounded-full hover:border-teal-700/30 transition-all duration-200 group"
      >
        <div className="w-6 h-6 rounded-full overflow-hidden border border-border dark:border-white/10 flex items-center justify-center bg-background dark:bg-[#1c1c1e] shrink-0 relative">
          {avatarUrl ? (
            <Image 
              src={avatarUrl} 
              alt="" 
              fill
              sizes="24px"
              className="object-cover" 
            />
          ) : (
            <span className="text-[8px] font-black text-teal-700 dark:text-teal-400 uppercase">
              {firstName.substring(0, 2)}
            </span>
          )}
        </div>
        <ChevronDown aria-hidden="true" focusable="false" className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          role="menu"
          className="absolute right-0 mt-3 w-56 bg-background dark:bg-[#1c1c1e] rounded-2xl shadow-2xl border border-border dark:border-white/5 py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="px-4 py-3 border-b border-border dark:border-white/5 mb-1">
            <p className="text-[8px] font-black text-text-muted dark:text-[#636366] uppercase tracking-widest mb-0.5">Account</p>
            <p className="text-xs font-bold text-gray-900 dark:text-[#f2f2f7] truncate">{user.email}</p>
          </div>
          
          <Link role="menuitem" href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2 text-[10px] font-black text-text-primary dark:text-[#aeaeb2] hover:text-teal-700 dark:hover:text-teal-400 uppercase tracking-widest transition-colors">
            <LayoutDashboard aria-hidden="true" focusable="false" className="h-3.5 w-3.5" /> Dashboard
          </Link>

          {profile?.username && (
            <Link role="menuitem" href={`/u/${profile.username}`} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2 text-[10px] font-black text-text-primary dark:text-[#aeaeb2] hover:text-teal-700 dark:hover:text-teal-400 uppercase tracking-widest transition-colors">
              <UserIcon aria-hidden="true" focusable="false" className="h-3.5 w-3.5" /> Public Profile
            </Link>
          )}

          <Link role="menuitem" href="/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2 text-[10px] font-black text-text-primary dark:text-[#aeaeb2] hover:text-teal-700 dark:hover:text-teal-400 uppercase tracking-widest transition-colors">
            <Settings aria-hidden="true" focusable="false" className="h-3.5 w-3.5" /> Settings
          </Link>

          <div className="h-px bg-sidebar dark:border-white/5 my-1" />
          
          <button role="menuitem" onClick={handleSignOut} className="flex items-center gap-3 w-full px-4 py-2 text-[10px] font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 uppercase tracking-widest transition-colors">
            <LogOut aria-hidden="true" focusable="false" className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isHome = pathname === '/';
  const isExplorePage = pathname === '/explore';
  const isLearnHub = pathname === '/learn';
  const isLeaderboardPage = pathname === '/leaderboard';
  const isHelpPage = pathname === '/help';

  const isLearnPage = pathname?.includes('/learn') && pathname?.includes('/roadmap/');
  const isExamplePage = pathname?.startsWith('/examples/');
  const isResearchPage = pathname?.startsWith('/research-decoded');
  const isDashboardPage = pathname === '/dashboard';
  const isProfilePage = pathname?.startsWith('/u/');
  const isSettingsPage = pathname === '/settings';
  const isTermsPage = pathname === '/terms';
  const isPrivacyPage = pathname === '/privacy';
  const isGeneratePage = pathname === '/generate';
  const isRoadmapIndexPage = pathname === '/roadmap';
  const isPricingPage = pathname === '/pricing';
  const isLoginPage = pathname === '/login';

  // These pages handle their own headers
  const hasLocalHeader = isHome || isLearnHub || isDashboardPage || isProfilePage || isSettingsPage || isTermsPage || isPrivacyPage || isExplorePage || isLeaderboardPage || isHelpPage || isGeneratePage || isRoadmapIndexPage || isPricingPage || isLoginPage;

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        try {
          const data = await authAPI.getMe();
          setProfile(data);
        } catch (e) {
          console.error("Failed to fetch profile in header", e);
        }
      } else {
        setProfile(null);
      }
    }
    fetchProfile();
  }, [user]);

  const handleSignIn = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback`, queryParams: { prompt: 'select_account' } },
      });
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsMenuOpen(false);
      router.push('/');
      router.refresh();
    }
  };

  if (isLearnPage || isExamplePage || isResearchPage || hasLocalHeader) return null;

  return (
    <header className={`${inconsolata.className} fixed top-0 inset-x-0 z-50 bg-background/80 dark:bg-[#0f0f0f]/80 backdrop-blur-xl border-b border-border dark:border-white/5 h-[48px] flex items-center`}>
      <div className="w-full px-6 flex h-full items-center justify-between">
        <div className="flex items-center gap-4">
          <Link className="flex items-center group shrink-0" href="/" aria-label="ΣulerFold Home">
            <div className="relative w-7 h-7 mr-2">
              <Image 
                src="/apple-touch-icon.png" 
                alt="" 
                fill
                sizes="28px"
                className="group-hover:opacity-80 transition-opacity object-contain"
                priority 
              />
            </div>
            <span className="hidden whitespace-nowrap text-[16px] font-bold md:block text-slate-950 dark:text-[#f2f2f7] tracking-tighter uppercase">ΣulerFold</span>
          </Link>
          <div className="h-4 w-px bg-sidebar dark:bg-white/10 mx-2 hidden md:block"></div>
          <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation">
            <Link href="/" aria-current={isHome ? 'page' : undefined} className="flex items-center gap-2 group/nav">
              <Home aria-hidden="true" focusable="false" className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
              <span className="text-[14px] font-[var(--font-weight-medium)] text-text-primary dark:text-[#636366] group-hover/nav:text-teal-700 dark:group-hover/nav:text-teal-400 uppercase tracking-widest transition-colors">Home</span>
            </Link>
            <Link href="/explore" aria-current={isExplorePage ? 'page' : undefined} className="flex items-center gap-2 group/nav">
              <Search aria-hidden="true" focusable="false" className="w-3.5 h-3.5 text-text-primary dark:text-[#636366]" />
              <span className="text-[14px] font-[var(--font-weight-medium)] text-text-primary dark:text-[#636366] group-hover/nav:text-teal-700 dark:group-hover/nav:text-teal-400 uppercase tracking-widest transition-colors">Explore</span>
            </Link>
            <Link href="/learn" aria-current={isLearnHub ? 'page' : undefined} className="flex items-center gap-2 group/nav">
              <GraduationCap aria-hidden="true" focusable="false" className="w-3.5 h-3.5 text-text-primary dark:text-[#636366]" />
              <span className="text-[14px] font-[var(--font-weight-medium)] text-text-primary dark:text-[#636366] group-hover/nav:text-teal-700 dark:group-hover/nav:text-teal-400 uppercase tracking-widest transition-colors">Learn</span>
            </Link>
            <Link href="/leaderboard" aria-current={isLeaderboardPage ? 'page' : undefined} className="flex items-center gap-2 group/nav">
              <Trophy aria-hidden="true" focusable="false" className="w-3.5 h-3.5 text-text-primary dark:text-[#636366]" />
              <span className="text-[14px] font-[var(--font-weight-medium)] text-text-primary dark:text-[#636366] group-hover/nav:text-teal-700 dark:group-hover/nav:text-teal-400 uppercase tracking-widest transition-colors">Rankings</span>
            </Link>
            <Link href="/help" aria-current={isHelpPage ? 'page' : undefined} className="flex items-center gap-2 group/nav">
              <HelpCircle aria-hidden="true" focusable="false" className="w-3.5 h-3.5 text-text-primary dark:text-[#636366]" />
              <span className="text-[14px] font-[var(--font-weight-medium)] text-text-primary dark:text-[#636366] group-hover/nav:text-teal-700 dark:group-hover/nav:text-teal-400 uppercase tracking-widest transition-colors">Help</span>
            </Link>
            <Link href="/pricing" aria-current={pathname === '/pricing' ? 'page' : undefined} className="flex items-center gap-2 group/nav">
              <CreditCard aria-hidden="true" focusable="false" className="w-3.5 h-3.5 text-text-primary dark:text-[#636366]" />
              <span className="text-[14px] font-[var(--font-weight-medium)] text-text-primary dark:text-[#636366] group-hover/nav:text-teal-700 dark:group-hover/nav:text-teal-400 uppercase tracking-widest transition-colors">Pricing</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {!loading && (
            user ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="text-[11px] font-bold text-text-primary dark:text-[#636366] hover:text-slate-900 dark:hover:text-[#f2f2f7] transition-colors flex items-center gap-1.5 uppercase tracking-widest">
                  <LayoutDashboard aria-hidden="true" focusable="false" className="w-3.5 h-3.5" /> Dashboard
                </Link>
                <ProfileDropdown user={user} profile={profile} handleSignOut={handleSignOut} />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSignIn}
                  className="text-[11px] font-bold text-text-primary dark:text-[#636366] hover:text-slate-900 dark:hover:text-[#f2f2f7] transition-colors flex items-center gap-1.5 uppercase tracking-widest"
                >
                  <LogIn aria-hidden="true" focusable="false" className="w-3.5 h-3.5" /> Sign In
                </button>
                <Link href="/generate" className="whitespace-nowrap rounded-full bg-slate-900 dark:bg-white px-5 py-1.5 text-white dark:text-black text-[12px] font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-xl">
                  <Plus aria-hidden="true" focusable="false" className="w-3.5 h-3.5" /> New Goal
                </Link>
              </div>
            )
          )}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 lg:hidden transition-colors"
          >
            {isMenuOpen ? <X aria-hidden="true" focusable="false" className="h-5 w-5" /> : <Menu aria-hidden="true" focusable="false" className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-[56px] inset-x-0 bg-background dark:bg-[#0f0f0f] border-b border-border dark:border-white/5 py-6 px-6 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-4" aria-label="Mobile navigation">
            <Link href="/" onClick={() => setIsMenuOpen(false)} aria-current={isHome ? 'page' : undefined} className="flex items-center gap-3 text-[13px] font-bold text-gray-900 dark:text-white uppercase tracking-widest">
              <Home aria-hidden="true" focusable="false" className="w-4 h-4 text-teal-700" /> Home
            </Link>
            <Link href="/explore" onClick={() => setIsMenuOpen(false)} aria-current={isExplorePage ? 'page' : undefined} className="flex items-center gap-3 text-[13px] font-bold text-gray-900 dark:text-white uppercase tracking-widest">
              <Search aria-hidden="true" focusable="false" className="w-4 h-4 text-teal-700" /> Explore
            </Link>
            <Link href="/learn" onClick={() => setIsMenuOpen(false)} aria-current={isLearnHub ? 'page' : undefined} className="flex items-center gap-3 text-[13px] font-bold text-gray-900 dark:text-white uppercase tracking-widest">
              <GraduationCap aria-hidden="true" focusable="false" className="w-4 h-4 text-teal-700" /> Learn
            </Link>
            <Link href="/leaderboard" onClick={() => setIsMenuOpen(false)} aria-current={isLeaderboardPage ? 'page' : undefined} className="flex items-center gap-3 text-[13px] font-bold text-gray-900 dark:text-white uppercase tracking-widest">
              <Trophy aria-hidden="true" focusable="false" className="w-4 h-4 text-teal-700" /> Rankings
            </Link>
            <Link href="/help" onClick={() => setIsMenuOpen(false)} aria-current={isHelpPage ? 'page' : undefined} className="flex items-center gap-3 text-[13px] font-bold text-gray-900 dark:text-white uppercase tracking-widest">
              <HelpCircle aria-hidden="true" focusable="false" className="w-4 h-4" /> Help
            </Link>
            <Link href="/pricing" onClick={() => setIsMenuOpen(false)} aria-current={pathname === '/pricing' ? 'page' : undefined} className="flex items-center gap-3 text-[13px] font-bold text-gray-900 dark:text-white uppercase tracking-widest">
              <CreditCard aria-hidden="true" focusable="false" className="w-4 h-4 text-teal-700" /> Pricing
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
