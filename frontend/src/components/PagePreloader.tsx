"use client";

import React, { useState, useEffect } from 'react';

export default function PagePreloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dismiss as soon as the client has hydrated and the document is ready
    if (document.readyState === 'complete') {
      setLoading(false);
    } else {
      window.addEventListener('load', () => setLoading(false));
      return () => window.removeEventListener('load', () => setLoading(false));
    }
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 w-full max-w-xs px-6">
        <div className="flex justify-center mb-4 opacity-80">
          <img src="/apple-touch-icon.png" alt="Loading..." className="w-10 h-10 animate-pulse" />
        </div>
        <div className="w-full h-1 bg-border/50 rounded-full overflow-hidden relative">
          <div className="h-full bg-accent relative rounded-full animate-pulse w-full"></div>
        </div>
      </div>
    </div>
  );
}
