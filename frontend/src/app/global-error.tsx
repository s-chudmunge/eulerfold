'use client';

import { useEffect } from 'react';

export default function GlobalError({
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
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
            <span className="text-2xl">🐢</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2 tracking-tight">A critical error occurred</h2>
          <p className="text-sm text-slate-500 mb-8 max-w-xs leading-relaxed">
            Please try refreshing or check your connection.
          </p>
          <button
            onClick={reset}
            className="px-8 py-2.5 bg-teal-700 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-teal-800 transition-all shadow-lg"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
