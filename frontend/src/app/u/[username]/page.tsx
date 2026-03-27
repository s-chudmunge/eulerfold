import React from 'react';
import { Metadata } from 'next';
import ProfileClient from './ProfileClient';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getProfile(username: string) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
    
    try {
        const res = await fetch(`${API_URL}/profile/${username}`, { 
            next: { revalidate: 300 } // Cache for 5 minutes
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
            title: 'Explorer Not Found',
        };
    }

    const displayName = profile.display_name || profile.username;
    const title = `${displayName} (@${profile.username}) - Explorer`;
    const description = `View ${displayName}'s verified skills and learning progress on EulerFold. Currently tracking ${profile.total_skills} skills across ${profile.total_roadmaps} roadmaps.`;
    
    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            url: `https://eulerfold.com/u/${profile.username}`,
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
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6 transition-colors duration-300">
                <div className="text-center space-y-6 max-w-sm">
                    <div className="text-5xl mb-8">🐢</div>
                    <h1 className="inconsolata-ui text-xl font-bold  tracking-normal text-text-heading">Explorer not found</h1>
                    <p className="manrope-body text-[14px] text-text-muted font-medium leading-relaxed italic">This username hasn't been claimed yet or is currently set to private mode.</p>
                    <div className="pt-8">
                        <Link href="/" className="inconsolata-ui inline-block px-8 py-3 bg-[var(--text-heading)] text-[var(--bg-main)] rounded-full text-[11px] font-bold  tracking-wide hover:opacity-90 transition-all">
                            Return to Surface
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return <ProfileClient profile={profile} />;
}
