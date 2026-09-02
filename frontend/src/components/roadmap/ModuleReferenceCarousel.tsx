import React from 'react';
import { ExternalLink } from 'lucide-react';

const getDomain = (url: string) => {
    if (!url) return 'Reference Material';
    try {
        return new URL(url).hostname.replace('www.', '');
    } catch {
        return 'Reference Material';
    }
};

export default function ModuleReferenceCarousel({ module, index }: { module: any, index: number }) {
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    if (!module.resources || module.resources.length === 0) return null;

    const uniqueResources = Array.from(new Map(
        module.resources.map((r: any) => [r.link || r.url, r])
    ).values()) as any[];

    if (uniqueResources.length === 0) return null;

    return (
        <div className="mb-10">
            <div className="flex items-center justify-between mb-4 px-2 md:px-0">
                <h3 className="manrope-body text-[13px] font-bold text-text-heading/80">
                    Week {index + 1}: {module.title}
                </h3>
                {uniqueResources.length > 2 && (
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => scroll('left')}
                            className="p-1.5 rounded-full bg-sidebar border border-border/50 text-text-muted hover:text-accent hover:border-accent/30 transition-all shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button 
                            onClick={() => scroll('right')}
                            className="p-1.5 rounded-full bg-sidebar border border-border/50 text-text-muted hover:text-accent hover:border-accent/30 transition-all shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                )}
            </div>
            <div 
                ref={scrollRef}
                className="flex overflow-x-auto gap-4 pb-4 snap-x no-scrollbar -mx-6 px-6 md:mx-0 md:px-0 scroll-smooth"
            >
                {uniqueResources.map((resource: any, idx: number) => (
                    <a 
                        key={idx}
                        href={resource.link || resource.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="snap-start shrink-0 w-[260px] md:w-[280px] h-[160px] p-5 rounded-md border border-border/60 bg-sidebar/50 hover:bg-background/80 hover:border-accent/40 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                    >
                        {/* Feature Image Background (if available) */}
                        {(resource.image_url || resource.image) && (
                            <>
                                <div className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity duration-300" style={{ backgroundImage: `url(${resource.image_url || resource.image})` }} />
                                <div className="absolute inset-0 bg-gradient-to-t from-sidebar via-sidebar/80 to-transparent" />
                            </>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-8 h-8 rounded-md bg-accent/10 text-accent flex items-center justify-center font-bold text-[12px] font-inconsolata border border-accent/20 group-hover:bg-accent group-hover:text-white transition-colors">
                                    {String(idx + 1).padStart(2, '0')}
                                </div>
                                <ExternalLink className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 group-hover:text-accent transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                            </div>
                            <h3 className="manrope-body text-[14px] font-bold text-text-heading group-hover:text-accent transition-colors leading-snug line-clamp-3">
                                {resource.title || resource.name || resource.url}
                            </h3>
                        </div>
                        <div className="relative z-10 mt-2 pt-3 border-t border-border/50 flex items-center gap-2">
                            <img 
                                src={`https://s2.googleusercontent.com/s2/favicons?domain=${getDomain(resource.link || resource.url)}&sz=64`} 
                                alt="" 
                                className="w-3.5 h-3.5 rounded-sm grayscale group-hover:grayscale-0 transition-all duration-300" 
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                            <span className="text-[10px] text-text-muted uppercase tracking-[0.1em] font-bold font-inter truncate">
                                {getDomain(resource.link || resource.url)}
                            </span>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
