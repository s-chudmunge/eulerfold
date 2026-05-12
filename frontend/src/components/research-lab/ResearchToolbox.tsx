"use client";

import React, { useState } from 'react';
import { 
    Hash, 
    Check, 
    Network,
    GraduationCap,
    UserCheck
} from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import { SiPaperswithcode } from 'react-icons/si';
import Link from 'next/link';

interface ResearchToolboxProps {
    paperUrl: string;
    title: string;
    authors?: string[];
    year?: string;
    className?: string;
}

export default function ResearchToolbox({ 
    paperUrl, 
    title, 
    authors = [], 
    year = new Date().getFullYear().toString(),
    className = "" 
}: ResearchToolboxProps) {
    const [copiedBibtex, setCopiedBibtex] = useState(false);

    const getArxivId = (url: string) => {
        const match = url.match(/arxiv\.org\/(?:abs|pdf)\/(\d+\.\d+)(?:v\d+)?(?:\.pdf)?/);
        return match ? match[1] : null;
    };

    const arxivId = getArxivId(paperUrl);
    const encodedTitle = encodeURIComponent(title);

    const tools = [
        {
            name: 'Semantic Scholar',
            icon: 'https://cdn.semanticscholar.org/fb87754bc307902f/img/apple-touch-icon-144x144.png',
            href: `https://www.semanticscholar.org/search?q=${encodedTitle}`,
            color: 'hover:text-blue-600',
        },
        {
            name: 'Connected Papers',
            icon: Network,
            href: arxivId 
                ? `https://www.connectedpapers.com/arxiv/${arxivId}` 
                : `https://www.connectedpapers.com/search?q=${encodedTitle}`,
            color: 'hover:text-purple-600',
        },
        {
            name: 'Papers with Code',
            icon: SiPaperswithcode,
            href: `https://paperswithcode.com/search?q=${encodedTitle}`,
            color: 'hover:text-slate-900',
        },
        {
            name: 'OpenReview',
            icon: UserCheck,
            href: `https://openreview.net/search?term=${encodedTitle}&group=all&content=all&type=all`,
            color: 'hover:text-teal-600',
        },
        {
            name: 'X Conversation',
            icon: FaXTwitter,
            href: `https://x.com/search?q=${encodedTitle}`,
            color: 'hover:text-sky-500',
        },
        {
            name: 'arXiv',
            icon: 'https://arxiv.org/static/browse/0.3.4/images/icons/apple-touch-icon.png',
            href: arxivId ? `https://www.arxiv-vanity.com/papers/${arxivId}/` : `https://arxiv.org/search/?query=${encodedTitle}&searchtype=all`,
            color: 'hover:text-orange-600',
        },
        {
            name: 'Google Scholar',
            icon: GraduationCap,
            href: `https://scholar.google.com/scholar?q=${encodedTitle}`,
            color: 'hover:text-blue-500',
        }
    ].filter(t => !t.hidden);

    const generateBibtex = () => {
        const firstAuthor = authors.length > 0 ? authors[0].split(' ').pop()?.toLowerCase() || 'paper' : 'paper';
        const citationKey = `${firstAuthor}${year}`;
        const authorList = authors.length > 0 ? authors.join(' and ') : 'Unknown Authors';
        
        return `@article{${citationKey},
  title={${title}},
  author={${authorList}},
  year={${year}},
  url={${paperUrl}}
}`;
    };

    const copyBibtex = () => {
        navigator.clipboard.writeText(generateBibtex());
        setCopiedBibtex(true);
        setTimeout(() => setCopiedBibtex(false), 2000);
    };

    return (
        <div className={`flex flex-row lg:flex-col items-center lg:items-start gap-2 lg:gap-4 ${className}`}>
            <div className="flex flex-row lg:flex-col items-center lg:items-start gap-2 lg:gap-3 bg-background/80 backdrop-blur-md p-1.5 lg:p-2 rounded-2xl border border-border/40 shadow-xl lg:shadow-2xl transition-all duration-300 group/toolbox">
                {tools.map((tool) => (
                    <a
                        key={tool.name}
                        href={tool.href || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`h-11 lg:h-10 flex items-center rounded-xl bg-sidebar/40 border border-transparent text-text-muted transition-all duration-500 group ${tool.color} hover:bg-background hover:border-accent/20 hover:shadow-lg active:scale-95 shrink-0 overflow-hidden w-11 lg:w-10 lg:group-hover/toolbox:w-44 px-3 lg:px-0 lg:group-hover/toolbox:px-3 justify-center lg:justify-start`}
                        title={tool.name}
                    >
                        <div className="flex items-center justify-center lg:w-10 shrink-0">
                            {typeof tool.icon === 'string' ? (
                                <img 
                                    src={tool.icon} 
                                    alt={tool.name} 
                                    className="w-5 h-5 lg:w-4.5 lg:h-4.5 transition-transform group-hover:scale-110 object-contain rounded-sm" 
                                />
                            ) : (
                                <tool.icon className="w-4.5 h-4.5 lg:w-4 lg:h-4 transition-transform group-hover:scale-110" />
                            )}
                        </div>
                        <span className="max-w-0 overflow-hidden group-hover/toolbox:max-w-[140px] transition-all duration-500 ease-in-out whitespace-nowrap text-[12px] font-semibold opacity-0 group-hover/toolbox:opacity-100 ml-0 group-hover/toolbox:ml-1 text-text-primary">
                            {tool.name}
                        </span>
                    </a>
                ))}
                
                <div className="w-[1px] h-6 lg:w-10 lg:h-[1px] bg-border/20 mx-1 lg:my-1 shrink-0" />

                <button 
                    onClick={copyBibtex}
                    className={`h-11 lg:h-10 flex items-center rounded-xl transition-all duration-500 border active:scale-95 shrink-0 overflow-hidden w-11 lg:w-10 lg:group-hover/toolbox:w-44 px-3 lg:px-0 lg:group-hover/toolbox:px-3 justify-center lg:justify-start ${
                        copiedBibtex 
                            ? 'bg-accent text-white border-accent shadow-accent/20 shadow-lg' 
                            : 'bg-sidebar/40 border-transparent text-text-muted hover:bg-background hover:text-accent hover:border-accent/20 hover:shadow-lg group'
                    }`}
                    title="Copy BibTeX"
                >
                    <div className="flex items-center justify-center lg:w-10 shrink-0">
                        {copiedBibtex ? <Check className="w-4.5 h-4.5 lg:w-4 lg:h-4" /> : <Hash className="w-4.5 h-4.5 lg:w-4 lg:h-4" />}
                    </div>
                    <span className={`max-w-0 overflow-hidden group-hover/toolbox:max-w-[140px] transition-all duration-500 ease-in-out whitespace-nowrap text-[12px] font-semibold opacity-0 group-hover/toolbox:opacity-100 ml-0 group-hover/toolbox:ml-1 ${copiedBibtex ? 'text-white' : 'text-text-primary'}`}>
                        {copiedBibtex ? 'Copied!' : 'BibTeX'}
                    </span>
                </button>
            </div>
        </div>
    );
}
