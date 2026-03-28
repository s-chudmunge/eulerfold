'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Loader } from 'lucide-react';

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
          // We do NOT call getSession() here to avoid competing for the auth lock
          // with the global interceptors/layout listeners.
          await supabase.auth.exchangeCodeForSession(code);
        } catch (error) {
          console.error('Auth code exchange failed:', error);
        }
      }

      // 2. Small delay to allow Supabase client to settle the internal lock
      // and synchronize the session to local storage before we navigate.
      setTimeout(() => {
        router.push(next);
      }, 800);
    };

    handleAuth();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-background">
      <div className="relative">
        <Loader className="h-16 w-16 animate-spin text-teal-700 mb-6" />
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-teal-700 rounded-full animate-pulse" />
        </div>
      </div>
      <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight uppercase">Verifying Account</h2>
      <p className="text-gray-600 font-medium">Completing the secure sign-in process...</p>
    </div>
  );
}
