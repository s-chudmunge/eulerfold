'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="inconsolata-ui text-[4rem] font-bold text-text-muted leading-none mb-4">
        500
      </h1>
      <h2 className="inconsolata-ui text-[1.1rem] font-bold text-text-heading mb-2 uppercase tracking-tight">
        Something went wrong.
      </h2>
      <p className="manrope-body text-text-muted mb-8 max-w-xs">
        Try refreshing the page.
      </p>
      <div className="flex flex-col items-center gap-6">
        <button
            onClick={reset}
            className="px-8 py-2.5 bg-[var(--text-heading)] text-[var(--bg-main)] rounded-full text-[12px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-xl"
        >
            Try Again
        </button>
        <Link 
            href="/" 
            className="manrope-body text-text-primary hover:opacity-70 transition-opacity flex items-center gap-2 font-bold"
        >
            ← Back to home
        </Link>
      </div>
    </div>
  );
}
