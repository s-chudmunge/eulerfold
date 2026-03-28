'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { authAPI, User, getDeduplicatedSession } from '@/lib/api';
import { TOS_VERSION } from '@/config/constants';
import TOSModal from './TOSModal';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [showTOS, setShowTOS] = useState(false);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await getDeduplicatedSession();
        if (session?.user) {
          const userData = await authAPI.getMe();
          setUser(userData);
          
          // TOS Check
          if (!userData.tos_accepted_at || userData.tos_version !== TOS_VERSION) {
            const protectedPaths = ['/dashboard', '/settings', '/roadmap', '/learn'];
            if (protectedPaths.some(path => window.location.pathname.startsWith(path))) {
              setShowTOS(true);
            }
          }
        }
      } catch (err) {
        console.error("Auth init failed:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setShowTOS(false);
      } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        // Only fetch if we don't have a user or the ID changed
        if (!user || user.supabase_uid !== session.user.id) {
          try {
            const userData = await authAPI.getMe();
            setUser(userData);
          } catch (err) {
            console.error("Auth change fetch failed:", err);
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [user]);

  // Don't block rendering with a full-screen spinner
  // Just render children and let components handle their own auth-dependent states
  return (
    <>
      {children}
      {showTOS && <TOSModal onAccept={() => setShowTOS(false)} />}
    </>
  );
}
