import React from 'react';
import { Metadata } from 'next';
import ProfileClient from './ProfileClient';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import UserNav from '@/components/UserNav';
import PagePreloader from '@/components/PagePreloader';
import { supabase } from '@/lib/supabase/client';

export async function generateStaticParams() {
    try {
        const { data: profiles } = await supabase
            .from('profiles')
            .select('username')
            .not('username', 'is', null)
            .limit(100);

        if (!profiles) return [];
        return profiles.map((p) => ({
            username: p.username,
        }));
    } catch (e) {
        return [];
    }
}

async function getProfile(username: string) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
    
    try {
        const res = await fetch(`${API_URL}/profile/${username}`, { 
            next: { revalidate: 0 } // Always fetch fresh data to sync skill updates
        });
        
        if (!res.ok) return null;
        return res.json();
    } catch (e) {
        console.error("Error fetching profile:", e);
        return null;
    }
}

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
    const profile = await getProfile(params.username);
    
    if (!profile) {
        return {
            title: 'User Not Found',
            description: 'This user profile could not be found.',
            robots: {
                index: false,
                follow: false,
            }
        };
    }

    const displayName = profile.display_name || profile.username;
    const title = `${displayName} (@${profile.username}) - Member`;
    const description = `View ${displayName}'s proven skills and learning progress on EulerFold. Currently tracking ${profile.total_skills} skills across ${profile.total_roadmaps} roadmaps.`;
    
    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            type: 'profile',
        },
        twitter: {
            card: 'summary',
            title: title,
            description: description,
        },
        alternates: {
            canonical: `/u/${profile.username}`,
        }
    };
}

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
    const profile = await getProfile(params.username);

    if (!profile) {
        notFound();
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <PagePreloader />
            <header className="inconsolata-ui border-b border-border bg-header h-[48px] shrink-0 z-50 sticky top-0 inset-x-0">
                <div className="w-full px-4 md:px-6 flex h-full items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-4">
                        <Link className="flex items-center group shrink-0" href="/dashboard" aria-label="Dashboard">
                            <img src="/apple-touch-icon.png" alt="EulerFold" className="w-7 h-7 group-hover:opacity-80 transition-opacity" />
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <UserNav />
                    </div>
                </div>
            </header>
            <main className="flex-grow min-w-0">
                <ProfileClient profile={profile} />
            </main>
        </div>
    );
}
