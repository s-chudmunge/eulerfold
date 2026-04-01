import React from 'react';
import Footer from '@/components/Footer';
import UnsubscribeForm from './UnsubscribeForm';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Unsubscribe',
  description: 'Manage your email preferences and stop receiving updates from EulerFold.',
  robots: {
    index: true,
    follow: true,
  }
};

export default function UnsubscribePage({ 
  searchParams 
}: { 
  searchParams: { email?: string } 
}) {
  const initialEmail = searchParams.email || '';

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950">
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 py-20 md:py-24">
        {/* The PublicHeader is already provided by the (public) layout */}
        
        <div className="mb-12">
          <h1 className="text-3xl font-black text-black dark:text-white mb-4 tracking-tight">
            Email Preferences
          </h1>
          <p className="text-[17px] text-gray-500 font-medium leading-relaxed">
            We're sorry to see you go. Please help us determine what you found irrelevant or spam so we can improve the experience for everyone else.
          </p>
        </div>

        <UnsubscribeForm initialEmail={initialEmail} />
      </div>
      <Footer />
    </div>
  );
}
