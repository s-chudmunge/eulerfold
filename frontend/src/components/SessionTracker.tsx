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
        const currentDuration = Math.round((Date.now() - sessionStartRef.current) / 1000);
        const storedTime = parseInt(localStorage.getItem('pendingSessionTime') || '0', 10);
        const totalDuration = currentDuration + storedTime;
        
        if (totalDuration >= 5) {
           sessionsAPI.logSession(totalDuration, currentTokenRef.current);
           localStorage.removeItem('pendingSessionTime');
        } else if (totalDuration > 0) {
           localStorage.setItem('pendingSessionTime', totalDuration.toString());
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
    window.addEventListener('beforeunload', reportSession);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', reportSession);
      subscription.unsubscribe();
      reportSession();
    };
  }, []);

  return null;
}
