'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { authAPI, User } from '@/lib/api';
import { TOS_VERSION } from '@/config/constants';
import TOSModal from './TOSModal';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showTOS, setShowTOS] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          // Clean up silently if session is invalid - no API call needed
          await supabase.auth.signOut({ scope: 'local' });
          setLoading(false);
          return;
        }
        
        // Fetch full profile to check TOS
        try {
          const userData = await authAPI.getMe();
          setUser(userData);
          
          // Check if TOS needs to be accepted
          if (!userData.tos_accepted_at || userData.tos_version !== TOS_VERSION) {
            // Only show TOS for protected app paths, not for landing, privacy, terms, etc.
            const protectedPaths = ['/dashboard', '/settings', '/checkins', '/assessments', '/admin', '/roadmap', '/learn', '/generate'];
            const isProtectedPath = protectedPaths.some(path => window.location.pathname.startsWith(path));
            
            if (isProtectedPath) {
              setShowTOS(true);
            }
          }
        } catch (profileError) {
          console.error("Failed to fetch profile in AuthProvider:", profileError);
        }

        // Proactive refresh: if token expires within 5 minutes (300s)
        if (session.expires_at) {
          const expiresAt = session.expires_at * 1000;
          const now = Date.now();
          if (expiresAt - now < 300000) { 
            console.log('Proactively refreshing session...');
            await supabase.auth.refreshSession();
          }
        }
      } catch (e) {
        console.error("Session validation failed:", e);
      } finally {
        setLoading(false);
      }
    };

    validateSession();

    // Listen for auth changes to handle token refreshes and sign-outs globally
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth event: ${event}`);
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setShowTOS(false);
      }
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          try {
            const userData = await authAPI.getMe();
            setUser(userData);
            if (!userData.tos_accepted_at || userData.tos_version !== TOS_VERSION) {
              const protectedPaths = ['/dashboard', '/settings', '/checkins', '/assessments', '/admin', '/roadmap', '/learn', '/generate'];
              const isProtectedPath = protectedPaths.some(path => window.location.pathname.startsWith(path));
              if (isProtectedPath) setShowTOS(true);
            }
          } catch (err) {
            console.error("Auth change profile fetch failed:", err);
          }
        }
      }

      // Only redirect to login if accessing protected content
      const protectedPaths = ['/dashboard', '/settings', '/checkins', '/assessments', '/admin'];
      const isProtectedPath = protectedPaths.some(path => window.location.pathname.startsWith(path));

      if (!session && isProtectedPath) {
          router.push('/login?message=auth_required');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <>
      {children}
      {showTOS && <TOSModal onAccept={() => setShowTOS(false)} />}
    </>
  );
}
