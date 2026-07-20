import React, { Suspense } from 'react';
import { Metadata } from 'next';
import SkillGapClient from './SkillGapClient';

export const metadata: Metadata = {
  title: 'Skill Gap Analyzer | EulerFold AI',
  description: 'Find and fix your weak spots. Take a targeted diagnostic quiz. Based on what you get wrong, we will build a custom course strictly focused on fixing your weak spots and accelerating your mastery.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.eulerfold.com/skill-gap-analyzer',
    title: 'Skill Gap Analyzer | EulerFold AI',
    description: 'Find and fix your weak spots. Take a targeted diagnostic quiz. Based on what you get wrong, we will build a custom course strictly focused on fixing your weak spots and accelerating your mastery.',
    siteName: 'EulerFold',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'EulerFold - Skill Gap Analyzer',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skill Gap Analyzer | EulerFold AI',
    description: 'Take a diagnostic tech quiz to generate a course targeting your exact blind spots.',
    creator: '@eulerfold',
  },
};

export default function SkillGapPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-background dark:bg-[#0f0f0f]">
        <div className="animate-pulse text-rose-500 font-mono text-sm tracking-widest uppercase">Initializing...</div>
      </div>
    }>
      <SkillGapClient />
    </Suspense>
  );
}
