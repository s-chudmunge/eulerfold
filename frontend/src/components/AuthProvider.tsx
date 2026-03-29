'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { authAPI, User } from '@/lib/api';
import { TOS_VERSION } from '@/config/constants';
import TOSModal from './TOSModal';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [showTOS, setShowTOS] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get initial session, then fetch full user profile
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Production session check:', session ? 'FOUND' : 'NULL');
      console.log('Session user:', session?.user?.email);

      if (session?.user) {
        try {
          const userData = await authAPI.getMe();
          console.log('getMe success:', userData?.email);
          setUser(userData);
          // TOS check
          if (!userData.tos_accepted_at || userData.tos_version !== TOS_VERSION) {
            const protectedPaths = ['/dashboard', '/settings', '/roadmap', '/learn'];
            if (protectedPaths.some(path => window.location.pathname.startsWith(path))) {
              setShowTOS(true);
            }
          }
        } catch (err: any) {
          console.log('getMe failed:', err?.response?.status, err?.message);
          console.error("Auth init failed:", err);
        }
      }
      setLoading(false);
    });

    // 2. Listen for future auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setShowTOS(false);
        setLoading(false);
      } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        setLoading(true);
        try {
          const userData = await authAPI.getMe();
          setUser(userData);
        } catch (err) {
          console.error("Auth change fetch failed:", err);
        } finally {
          setLoading(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
      {showTOS && <TOSModal onAccept={() => setShowTOS(false)} />}
    </AuthContext.Provider>
  );
}
