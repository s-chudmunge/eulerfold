import React, { Suspense } from 'react';
import ResearchDecodedIndexContent from './ResearchDecodedIndexContent';

export default function ResearchDecodedIndex() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center inconsolata-ui text-text-muted uppercase tracking-widest">Loading Decoded...</div>}>
      <ResearchDecodedIndexContent />
    </Suspense>
  );
}
