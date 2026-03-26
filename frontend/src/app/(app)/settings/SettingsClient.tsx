'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
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
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { authAPI, profileAPI } from '@/lib/api';
import { Inconsolata, Manrope } from 'next/font/google';
import AppSidebar from '@/components/AppSidebar';

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
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/?message=login_required');
        return;
      }
      
      try {
        const { data: userData, error } = await supabase.from('profiles').select('*').eq('supabase_uid', session.user.id).single();
        if (error || !userData) throw error || new Error("Profile not found");
        
        setUser(userData);
        setDisplayName(userData.display_name || '');
        setUsername(userData.username || '');
        setEmail(userData.email || '');
      } catch (e) {
        console.error("Failed to fetch user profile", e);
      } finally {
        setLoading(false);
      }
    }
    
    getUser();
  }, [router]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="h-6 w-6 border-2 border-border border-t-[var(--accent)] rounded-full animate-spin mb-4"></div>
        <p className="inconsolata-ui text-[11px] font-bold text-text-muted tracking-wide">Accessing system settings...</p>
      </div>
    );
  }

  return (
    <div className={`${inconsolata.variable} ${manrope.variable} min-h-screen flex flex-col bg-background text-text-primary selection:bg-teal-500/30 selection:text-text-heading`}>
      {/* Header */}
      <header className="inconsolata-ui border-b border-border bg-header h-[48px] shrink-0 z-50">
          <div className="w-full px-6 flex h-full items-center justify-between">
              <div className="flex items-center gap-4">
                  <Link className="flex items-center group shrink-0" href="/">
                      <img src="/apple-touch-icon.png" alt="ΣulerFold" className="w-7 h-7 group-hover:opacity-80 transition-opacity" />
                  </Link>
              </div>

              <div className="flex items-center gap-4">
                  <Link href="/dashboard" className="text-[11px] font-bold text-text-muted hover:text-text-heading transition-colors flex items-center gap-1.5 tracking-wide">
                      <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                  </Link>
                  <Link href="/generate" className="whitespace-nowrap rounded-full bg-[var(--text-heading)] px-5 py-1.5 text-[var(--bg-main)] text-[12px] font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
                      <Plus className="w-3.5 h-3.5" /> New Goal
                  </Link>
              </div>
          </div>
      </header>

      <div className="flex flex-1 relative">
        <AppSidebar />

        <main className="flex-1 min-w-0 h-full overflow-y-auto bg-background">
          <div className="max-w-[700px] mx-auto px-6 py-12 md:px-10">
            <header className="mb-12">
              <div className="inconsolata-ui flex items-center gap-2 text-accent mb-1 text-[13px] font-bold tracking-wide">
                <span className="bg-teal-500/10 px-2 py-0.5 rounded">System</span>
                <span className="opacity-30">/</span>
                <span className="text-text-muted italic font-medium">Settings</span>
              </div>
            </header>

            {message && (
              <div className={`mb-12 p-4 rounded-lg flex items-center gap-3 text-[13px] font-bold tracking-normal inconsolata-ui animate-in fade-in slide-in-from-top-2 duration-300 ${
                message.type === 'success' 
                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                  : 'bg-red-500/10 text-red-500 border border-red-500/20'
              }`}>
                {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <span>{message.text}</span>
              </div>
            )}

            <div className="space-y-16">
              {/* Profile Section */}
              <section>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <UserIcon className="h-4 w-4 text-text-muted opacity-60" />
                    <h2 className="inconsolata-ui text-[14px] font-bold tracking-tight text-text-heading">Identity</h2>
                  </div>
                  {username && (
                    <Link 
                      href={`/u/${username}`} 
                      className="inconsolata-ui text-[11px] font-bold text-accent hover:underline tracking-wide flex items-center gap-1.5"
                    >
                      Public profile <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="inconsolata-ui block text-[11px] font-bold tracking-wide text-gray-400">
                        Display name
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-callout-bg border border-border rounded-lg text-[14px] font-bold text-text-heading outline-none focus:border-[var(--accent)] transition-all"
                        placeholder="Enter full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="inconsolata-ui block text-[11px] font-bold tracking-wide text-gray-400">
                        Handle
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold inconsolata-ui opacity-40">@</span>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          className="w-full pl-10 pr-4 py-2.5 bg-callout-bg border border-border rounded-lg text-[14px] font-bold text-text-heading outline-none focus:border-[var(--accent)] transition-all"
                          placeholder="username"
                        />
                      </div>
                      <p className="manrope-body text-[11px] text-text-muted italic opacity-50">Permanent link: eulerfold.com/u/{username || '...'}</p>
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <label className="inconsolata-ui block text-[11px] font-bold tracking-wide text-gray-400">
                        System email
                      </label>
                      <div className="flex items-center gap-3 px-4 py-2.5 bg-callout-bg border border-border rounded-lg text-[14px] text-text-muted font-medium">
                        <Mail className="h-4 w-4 opacity-30" />
                        <span className="inconsolata-ui">{email}</span>
                        <ShieldCheck className="h-4 w-4 ml-auto text-accent opacity-30" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inconsolata-ui inline-flex items-center gap-2 px-8 py-2.5 bg-[var(--text-heading)] text-[var(--bg-main)] text-[12px] font-bold tracking-wide rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {saving ? 'Syncing...' : 'Apply changes'}
                    </button>
                  </div>
                </form>
              </section>

              {/* Danger Zone */}
              <section className="pt-10 pb-20">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-red-500/10">
                  <Trash2 className="h-4 w-4 text-red-500/60" />
                  <h2 className="inconsolata-ui text-[14px] font-bold tracking-tight text-red-500/80">Termination</h2>
                </div>

                <div className="max-w-md p-6 bg-red-500/[0.02] border border-red-500/10 rounded-lg">
                  <h3 className="inconsolata-ui text-[13px] font-bold text-red-600 tracking-tight mb-2">Purge intelligence</h3>
                  <p className="manrope-body text-[12px] text-text-muted mb-6 leading-relaxed italic opacity-80">
                    Permanently erase your identity, mission history, and all telemetry data. This operation is non-reversible.
                  </p>
                  <button
                    className="inconsolata-ui text-[11px] font-bold text-red-600/80 hover:text-red-600 tracking-wide underline underline-offset-4 transition-colors"
                    onClick={async () => {
                      if (confirm('CRITICAL: This will permanently delete your account and all learning data. This cannot be undone. Proceed?')) {
                        try {
                          await profileAPI.deleteProfile();
                          await supabase.auth.signOut();
                          window.location.href = '/';
                        } catch (err) {
                          alert('Purge failed. Please contact hello@eulerfold.com');
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
      </div>
    </div>
  );
}
