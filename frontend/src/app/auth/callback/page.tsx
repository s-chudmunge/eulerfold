'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { AlertCircle, Loader } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let redirected = false;

    const navigateToDashboard = () => {
      if (isMounted && !redirected) {
        redirected = true;
        const queryParams = new URLSearchParams(window.location.search);
        const next = queryParams.get('next');
        router.push(next || '/dashboard');
      }
    };

    const handleAuth = async () => {
      try {
        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get('code');
        const errorDescription = queryParams.get('error_description');

        if (errorDescription) {
          throw new Error(errorDescription);
        }

        if (code) {
          // Exchange the code for a session
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }

        // Verify session existence
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session) {
          navigateToDashboard();
        } else if (!code) {
          // If no code and no session, return to home
          if (isMounted) router.push('/');
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        if (isMounted) {
          // If a session already exists, ignore the error and redirect
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            navigateToDashboard();
            return;
          }
          setErrorMessage(error.message || 'Authentication failed. Please try again.');
        }
      }
    };

    handleAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-background dark:bg-[#1c1c1e] transition-colors duration-300">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-[#f2f2f7] mb-2 tracking-tight uppercase">Authentication Error</h2>
        <p className="text-gray-600 dark:text-[#aeaeb2] font-medium mb-8 max-w-sm mx-auto">{errorMessage}</p>
        <button
          onClick={() => router.push('/')}
          className="px-8 py-3 bg-teal-700 text-white rounded-full font-bold hover:bg-teal-800 transition-all shadow-lg shadow-teal-100 dark:shadow-none active:scale-95"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-background dark:bg-[#1c1c1e] transition-colors duration-300">
      <Loader className="h-16 w-16 animate-spin text-teal-700 dark:text-teal-500 mb-6" />
      <h2 className="text-2xl font-black text-gray-900 dark:text-[#f2f2f7] mb-2 tracking-tight uppercase">Verifying Account</h2>
      <p className="text-gray-600 dark:text-[#aeaeb2] font-medium">Completing the secure sign-in process...</p>
    </div>
  );
}
