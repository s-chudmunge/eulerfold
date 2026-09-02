'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Sparkles, ShieldCheck } from 'lucide-react';

/**
 * AuthCallbackPage
 * Handles the redirect from Supabase Auth (Email confirmation, OAuth, etc.)
 * 
 * Optimized to prevent "Lock broken" errors by remaining passive and allowing
 * the global auth listener (in layout.tsx) to handle session state.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const processed = useRef(false);

  useEffect(() => {
    // Prevent double-execution in React Strict Mode which often causes race conditions
    if (processed.current) return;
    processed.current = true;

    const handleAuth = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const code = queryParams.get('code');
      const next = queryParams.get('next') || '/dashboard';

      if (code) {
        try {
          // 1. Exchange the PKCE code for a session.
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;

          // If this was a Google Calendar permissions connection flow, persist the flag
          if (window.location.search.includes('calendar') || window.location.search.includes('scope')) {
            try {
              const currentMeta = data.session?.user?.user_metadata || {};
              const conns = currentMeta.connections || {};
              await supabase.auth.updateUser({
                data: {
                  connections: {
                    ...conns,
                    google_calendar_connected: true
                  }
                }
              });
            } catch (metaErr) {
              console.warn('Failed updating user calendar metadata:', metaErr);
            }
            localStorage.setItem('conn_google_calendar', 'true');
          }
        } catch (error) {
          console.error('Auth code exchange failed:', error);
        }
      }

      // If opened in a popup/child window from Settings, notify opener and close cleanly
      const isPopup = window.opener && !window.opener.closed;
      if (isPopup || window.location.search.includes('popup=true')) {
        try {
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({ type: 'EULERFOLD_AUTH_SUCCESS', provider: 'google_calendar' }, '*');
          }
        } catch (e) {}
        setTimeout(() => {
          window.close();
        }, 600);
        return;
      }

      // 2. Delay to allow session to settle before navigating
      setTimeout(() => {
        router.push(next);
      }, 1200);
    };

    handleAuth();
  }, [router]);

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center animate-in fade-in duration-500 manrope-body">
      <div className="flex flex-col items-center gap-8">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-teal-700/10 rounded-full" />
          <div className="absolute inset-0 w-20 h-20 border-t-2 border-teal-700 rounded-full animate-spin" />
          <ShieldCheck className="absolute inset-0 m-auto w-8 h-8 text-teal-700 animate-pulse" />
        </div>
        
        <div className="flex flex-col items-center gap-3">
          <h2 className="inconsolata-ui text-[16px] font-black text-text-heading tracking-[0.2em] uppercase">
            Verifying Account
          </h2>
          <div className="flex flex-col items-center gap-4">
            <p className="manrope-body text-[13px] text-text-muted font-medium italic opacity-80">
              Completing the secure sign-in process...
            </p>
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div 
                  key={i} 
                  className="w-1.5 h-1.5 bg-teal-700/40 rounded-full animate-bounce" 
                  style={{ animationDelay: `${i * 0.15}s` }} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle branding footer */}
      <div className="absolute bottom-12 opacity-20">
        <div className="flex items-center gap-2">
           <img src="/apple-touch-icon.png" alt="" className="w-5 h-5 grayscale" />
           <span className="inconsolata-ui text-[11px] font-bold text-text-heading tracking-widest uppercase">EulerFold Auth</span>
        </div>
      </div>
    </div>
  );
}
