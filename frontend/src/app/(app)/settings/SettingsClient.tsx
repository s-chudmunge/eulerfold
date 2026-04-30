'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { 
  User as UserIcon, 
  Mail, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Save,
  ExternalLink,
  ShieldCheck,
  Plus,
  LayoutDashboard,
  Settings,
  Github,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import { authAPI, profileAPI } from '@/lib/api';
import { Inconsolata, Manrope } from 'next/font/google';
import Breadcrumbs from '@/components/Breadcrumbs';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';

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

export default function SettingsClient() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [identities, setIdentities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    async function getIdentities() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.identities) {
        setIdentities(user.identities);
      }
    }
    getIdentities();
  }, []);

  const handleLinkGithub = async () => {
    try {
      const { error } = await supabase.auth.linkIdentity({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/settings`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to link GitHub.' });
    }
  };

  useEffect(() => {
    // Check initial theme from document class
    if (document.documentElement.classList.contains('dark')) {
      setTheme('dark');
    }
  }, []);

  const toggleTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('eulerfold-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.replace('/?message=login_required');
    }
  }, [authLoading, authUser, router]);

  useEffect(() => {
    if (authUser) {
      setProfile(authUser);
      setDisplayName(authUser.display_name || '');
      setUsername(authUser.username || '');
      setEmail(authUser.email || '');
      setLoading(false);
    }
  }, [authUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: displayName }
      });
      if (authError) throw authError;

      await authAPI.updateProfile({
        display_name: displayName,
        username: username
      });

      setMessage({ type: 'success', text: 'Settings saved successfully.' });
      setTimeout(() => setMessage(null), 4000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.detail || error.message || 'Failed to sync changes.' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || (loading && !profile)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="h-6 w-6 border-2 border-border border-t-[var(--accent)] rounded-full animate-spin mb-4"></div>
        <p className="inconsolata-ui text-[11px] font-bold text-text-muted tracking-wide">Accessing system settings...</p>
      </div>
    );
  }

  return (
    <div className={`${inconsolata.variable} ${manrope.variable} min-h-screen flex flex-col bg-background text-text-primary selection:bg-teal-500/30 selection:text-text-heading`}>
      <PublicHeader />

      <main className="flex-1">
        <div className="max-w-[650px] mx-auto px-6 py-12 md:px-8">
          <Breadcrumbs items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Settings' }
          ]} />

            {message && (
              <div className={`mb-8 p-3 rounded-lg flex items-center gap-3 text-[12px] font-bold tracking-normal inconsolata-ui animate-in fade-in slide-in-from-top-2 duration-300 ${
                message.type === 'success' 
                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                  : 'bg-red-500/10 text-red-500 border border-red-500/20'
              }`}>
                {message.type === 'success' ? <CheckCircle className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                <span>{message.text}</span>
              </div>
            )}

            <div className="space-y-10">
              {/* Profile Section */}
              <section>
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-border/50">
                  <div className="flex items-center gap-2.5">
                    <UserIcon className="h-3.5 w-3.5 text-text-muted opacity-60" />
                    <h2 className="inconsolata-ui text-[13px] font-bold tracking-tight text-text-heading uppercase">Identity</h2>
                  </div>
                  {username && (
                    <Link 
                      href={`/u/${username}`} 
                      className="inconsolata-ui text-[10px] font-bold text-accent hover:underline tracking-wide flex items-center gap-1.5"
                    >
                      Public profile <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="inconsolata-ui block text-[10px] font-bold tracking-wide text-text-muted opacity-60 uppercase">
                        Display name
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-3 py-2 bg-callout-bg border border-border rounded-lg text-[13px] font-bold text-text-heading outline-none focus:border-[var(--accent)] transition-all"
                        placeholder="Enter full name"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="inconsolata-ui block text-[10px] font-bold tracking-wide text-text-muted opacity-60 uppercase">
                        Handle
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-bold inconsolata-ui opacity-40">@</span>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          className="w-full pl-8 pr-3 py-2 bg-callout-bg border border-border rounded-lg text-[13px] font-bold text-text-heading outline-none focus:border-[var(--accent)] transition-all"
                          placeholder="username"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="inconsolata-ui block text-[10px] font-bold tracking-wide text-text-muted opacity-60 uppercase">
                        System email
                      </label>
                      <div className="flex items-center gap-3 px-3 py-2 bg-callout-bg/50 border border-border/50 rounded-lg text-[13px] text-text-muted font-medium italic">
                        <Mail className="h-3.5 w-3.5 opacity-30" />
                        <span className="inconsolata-ui">{email}</span>
                        <ShieldCheck className="h-3.5 w-3.5 ml-auto text-accent opacity-30" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inconsolata-ui inline-flex items-center gap-2 px-6 py-2 bg-[var(--text-heading)] text-[var(--bg-main)] text-[11px] font-bold tracking-wide rounded-lg hover:opacity-90 transition-all disabled:opacity-50 uppercase"
                    >
                      <Save className="h-3 w-3" />
                      {saving ? 'Syncing...' : 'Apply changes'}
                    </button>
                  </div>
                </form>
              </section>

              {/* Preferences Section */}
              <section>
                <div className="flex items-center gap-2.5 mb-6 pb-2 border-b border-border/50">
                  <Settings className="h-3.5 w-3.5 text-text-muted opacity-60" />
                  <h2 className="inconsolata-ui text-[13px] font-bold tracking-tight text-text-heading uppercase">Appearance</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-6 p-4 bg-callout-bg border border-border rounded-xl">
                    <div className="space-y-0.5">
                      <h3 className="inconsolata-ui text-[12px] font-bold text-text-heading">System Theme</h3>
                      <p className="manrope-body text-[10px] text-text-muted italic opacity-60">Visual environment preference.</p>
                    </div>
                    
                    <div className="flex bg-background p-1 rounded-lg border border-border">
                      <button
                        onClick={() => toggleTheme('light')}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold inconsolata-ui transition-all ${
                          theme === 'light' 
                            ? 'bg-[var(--text-heading)] text-[var(--bg-main)] shadow-sm' 
                            : 'text-text-muted hover:text-text-heading'
                        }`}
                      >
                        Light
                      </button>
                      <button
                        onClick={() => toggleTheme('dark')}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold inconsolata-ui transition-all ${
                          theme === 'dark' 
                            ? 'bg-[var(--text-heading)] text-[var(--bg-main)] shadow-sm' 
                            : 'text-text-muted hover:text-text-heading'
                        }`}
                      >
                        Dark
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Connected Accounts */}
              <section>
                <div className="flex items-center gap-2.5 mb-6 pb-2 border-b border-border/50">
                  <Globe className="h-3.5 w-3.5 text-text-muted opacity-60" />
                  <h2 className="inconsolata-ui text-[13px] font-bold tracking-tight text-text-heading uppercase">Connections</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-6 p-4 bg-callout-bg border border-border rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 bg-background border border-border rounded-lg flex items-center justify-center">
                        <Github className="w-4 h-4 text-text-heading" />
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="inconsolata-ui text-[12px] font-bold text-text-heading">GitHub</h3>
                        <p className="manrope-body text-[10px] text-text-muted italic opacity-60">
                          Connect your GitHub account.
                        </p>
                      </div>
                    </div>
                    
                    {identities.some(id => id.provider === 'github') ? (
                      <div className="flex flex-col items-end gap-1">
                        <div className="px-3 py-1 rounded-md text-[10px] font-bold inconsolata-ui bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 uppercase">
                          Active
                        </div>
                        {profile?.github_username && (
                          <span className="inconsolata-ui text-[10px] font-bold text-text-muted opacity-60">
                            @{profile.github_username}
                          </span>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={handleLinkGithub}
                        className="px-4 py-1.5 bg-[var(--text-heading)] text-[var(--bg-main)] rounded-md text-[10px] font-bold inconsolata-ui hover:opacity-90 transition-all uppercase"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              </section>

              {/* Danger Zone */}
              <section className="pt-6 pb-12">
                <div className="flex items-center gap-2.5 mb-6 pb-2 border-b border-red-500/10">
                  <Trash2 className="h-3.5 w-3.5 text-red-500/60" />
                  <h2 className="inconsolata-ui text-[13px] font-bold tracking-tight text-red-500/80 uppercase">Termination</h2>
                </div>

                <div className="max-w-md p-5 bg-red-500/[0.02] border border-red-500/10 rounded-lg">
                  <h3 className="inconsolata-ui text-[12px] font-bold text-red-600 tracking-tight mb-1">Purge intelligence</h3>
                  <p className="manrope-body text-[11px] text-text-muted mb-4 leading-relaxed italic opacity-80">
                    Permanently erase identity and history. Non-reversible.
                  </p>
                  <button
                    className="inconsolata-ui text-[10px] font-bold text-red-600/80 hover:text-red-600 tracking-wide underline underline-offset-4 transition-colors uppercase"
                    onClick={async () => {
                      if (confirm('CRITICAL: This will permanently delete your account and all learning data. This cannot be undone. Proceed?')) {
                        try {
                          await profileAPI.deleteProfile();
                          await supabase.auth.signOut();
                          window.location.href = '/';
                        } catch (err) {
                          alert('Purge failed. Please contact eulerfold@gmail.com');
                        }
                      }
                    }}
                  >
                    Request data purge
                  </button>
                </div>
              </section>
            </div>
          </div>
        </main>
      <Footer />
    </div>
  );
}
