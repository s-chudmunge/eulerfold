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
    let isInitialized = false;

    // We use a ref to prevent duplicate fetches for the same session ID
    let currentSessionId = '';

    const fetchUserProfile = async (session: any) => {
      if (!session?.user) {
        setUser(null);
        setLoading(false);
        currentSessionId = '';
        return;
      }

      // If we already fetched for this user's current session, skip
      if (currentSessionId === session.user.id) {
        setLoading(false);
        return;
      }

      currentSessionId = session.user.id;

      try {
        const userData = await authAPI.getMe();
        setUser(userData);
        
        // TOS check
        if (!userData.tos_accepted_at || userData.tos_version !== TOS_VERSION) {
          const protectedPaths = ['/dashboard', '/settings', '/roadmap', '/learn'];
          if (protectedPaths.some(path => window.location.pathname.startsWith(path))) {
            setShowTOS(true);
          }
        }
      } catch (err: any) {
        console.error("Auth profile fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isInitialized) return;
      isInitialized = true;
      fetchUserProfile(session);
    });

    // 2. Listen for future auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        if (!isInitialized) {
          isInitialized = true;
          fetchUserProfile(session);
        }
        return;
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setShowTOS(false);
        setLoading(false);
        currentSessionId = '';
        isInitialized = true;
      } else if (event === 'SIGNED_IN' && session) {
        setLoading(true);
        fetchUserProfile(session);
        isInitialized = true;
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Only fetch if we somehow don't have the user yet
        fetchUserProfile(session);
        isInitialized = true;
      } else if (event === 'USER_UPDATED' && session) {
        // Force refetch on user update
        currentSessionId = '';
        fetchUserProfile(session);
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
