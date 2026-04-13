"use client";

import React, { useState } from 'react';
import { 
    FaWhatsapp, 
    FaLinkedinIn, 
    FaXTwitter, 
    FaLink,
    FaCheck
} from 'react-icons/fa6';

interface SocialShareProps {
    url?: string;
    title: string;
    text?: string;
    className?: string;
}

export default function SocialShare({ 
    url, 
    title, 
    text = "Check this out on EulerFold:", 
    className = "" 
}: SocialShareProps) {
    const [copied, setCopied] = useState(false);
    
    // Fallback to window.location if url is not provided
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(`${text} ${title}`);

    const platforms = [
        {
            name: 'WhatsApp',
            icon: FaWhatsapp,
            href: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
            color: 'bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20',
        },
        {
            name: 'LinkedIn',
            icon: FaLinkedinIn,
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            color: 'bg-[#0077B5]/10 text-[#0077B5] hover:bg-[#0077B5]/20',
        },
        {
            name: 'Twitter',
            icon: FaXTwitter,
            href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
            color: 'bg-text-heading/5 text-text-heading hover:bg-text-heading/10',
        }
    ];

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {platforms.map((platform) => (
                <a
                    key={platform.name}
                    href={platform.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`p-2 rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center ${platform.color}`}
                    title={`Share on ${platform.name}`}
                >
                    <platform.icon className="w-4 h-4" />
                </a>
            ))}
            
            <button
                onClick={copyToClipboard}
                className={`p-2 rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center ${
                    copied 
                    ? 'bg-accent text-white' 
                    : 'bg-sidebar/80 text-text-muted hover:bg-sidebar hover:text-text-heading'
                }`}
                title="Copy Link"
            >
                {copied ? <FaCheck className="w-4 h-4" /> : <FaLink className="w-4 h-4" />}
            </button>
        </div>
    );
}
