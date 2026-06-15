import React from 'react';
import { Metadata } from 'next';
import ProfileClient from './ProfileClient';
import Link from 'next/link';
import { notFound } from 'next/navigation';
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

    return <ProfileClient profile={profile} />;
}
