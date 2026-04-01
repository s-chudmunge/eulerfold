import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="inconsolata-ui text-[4rem] font-bold text-text-muted leading-none mb-4">
        404
      </h1>
      <h2 className="inconsolata-ui text-[1.1rem] font-bold text-text-heading mb-2 uppercase tracking-tight">
        Page not found.
      </h2>
      <p className="manrope-body text-text-muted mb-8 max-w-xs">
        This page doesn&apos;t exist or was moved.
      </p>
      <Link 
        href="/" 
        className="manrope-body text-text-primary hover:opacity-70 transition-opacity flex items-center gap-2 font-bold"
      >
        ← Back to home
      </Link>
    </div>
  );
}
