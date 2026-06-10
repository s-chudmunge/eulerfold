"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

function OpenRouterCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setStatus('error');
      setErrorMsg('No authorization code provided by OpenRouter.');
      return;
    }

    const fetchKey = async () => {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/auth/keys', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error?.message || 'Failed to exchange code for API key');
        }

        const data = await response.json();
        const key = data.key;

        if (key) {
          localStorage.setItem('openRouterKey', key);
          setStatus('success');
          // Redirect back after a short delay
          setTimeout(() => {
            router.push('/generate');
          }, 2000);
        } else {
          throw new Error('No key returned from OpenRouter');
        }
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.message || 'An unexpected error occurred');
      }
    };

    fetchKey();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 manrope-body">
      <div className="bg-callout-bg border border-border p-8 rounded-xl max-w-md w-full shadow-2xl flex flex-col items-center text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
            <h2 className="text-xl font-bold text-text-heading mb-2">Connecting to OpenRouter...</h2>
            <p className="text-sm text-text-muted">Please wait while we secure your connection.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
            <h2 className="text-xl font-bold text-text-heading mb-2">Connected Successfully!</h2>
            <p className="text-sm text-text-muted mb-6">Your OpenRouter account is now linked securely.</p>
            <p className="text-xs text-text-muted/70">Redirecting you back...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-text-heading mb-2">Connection Failed</h2>
            <p className="text-sm text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20 mb-6">{errorMsg}</p>
            <button 
              onClick={() => router.push('/generate')}
              className="px-6 py-2 bg-accent text-white rounded-lg font-bold text-sm"
            >
              Return to Generator
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function OpenRouterCallback() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>}>
            <OpenRouterCallbackContent />
        </Suspense>
    )
}
