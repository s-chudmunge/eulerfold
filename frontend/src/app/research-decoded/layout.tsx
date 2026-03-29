import React from 'react';
import ResearchDecodedClientShell from './ResearchDecodedClientShell';
import { navigation } from './generatedData';

export default function ResearchDecodedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ResearchDecodedClientShell navigation={navigation}>
      {children}
    </ResearchDecodedClientShell>
  );
}
