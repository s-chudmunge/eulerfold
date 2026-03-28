'use client';

import { useEffect, useRef } from 'react';
import { sessionsAPI, getDeduplicatedSession } from '@/lib/api';
import { supabase } from '@/lib/supabase/client';

export default function SessionTracker() {
  const sessionStartRef = useRef<number | null>(null);
  const currentTokenRef = useRef<string | null>(null);

  useEffect(() => {
    // Keep token ref up to date
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      currentTokenRef.current = session?.access_token || null;
    });

    // Initial token fetch with deduplication
    getDeduplicatedSession().then(({ data: { session } }) => {
      currentTokenRef.current = session?.access_token || null;
    });

    const reportSession = () => {
      if (sessionStartRef.current && currentTokenRef.current) {
        const duration = Math.round((Date.now() - sessionStartRef.current) / 1000);
        
        if (duration >= 5) {
           sessionsAPI.logSession(duration, currentTokenRef.current);
        }
        
        sessionStartRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sessionStartRef.current = Date.now();
      } else {
        reportSession();
      }
    };

    if (document.visibilityState === 'visible') {
      sessionStartRef.current = Date.now();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && sessionStartRef.current) {
        reportSession();
        sessionStartRef.current = Date.now();
      }
    }, 5 * 60 * 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
      subscription.unsubscribe();
      reportSession();
    };
  }, []);

  return null;
}
