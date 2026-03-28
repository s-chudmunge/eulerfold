'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Loader } from 'lucide-react';

export default function AuthCallbackPage() {
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const handleAuth = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const code = queryParams.get('code');
      const next = queryParams.get('next') || '/dashboard';

      if (code) {
        try {
          await supabase.auth.exchangeCodeForSession(code);
        } catch (error) {
          console.error('Auth code exchange error:', error);
        }
      }

      // Use a hard redirect to ensure the session is picked up across domain variations
      setTimeout(() => {
        window.location.href = next;
      }, 500);
    };

    handleAuth();
  }, []);

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
