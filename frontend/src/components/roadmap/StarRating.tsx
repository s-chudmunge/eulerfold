"use client"

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    rating: number;
    count?: number;
    size?: number;
    interactive?: boolean;
    onRate?: (rating: number) => void;
    showValue?: boolean;
    minimal?: boolean;
    className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ 
    rating, 
    count, 
    size = 14, 
    interactive = false, 
    onRate, 
    showValue = true,
    minimal = false,
    className = ""
}) => {
    const [hoverRating, setHoverRating] = useState<number | null>(null);

    const handleRate = (value: number) => {
        if (interactive && onRate) {
            onRate(value);
        }
    };

    if (minimal) {
        return (
            <div className={`flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity ${className}`}>
                <span className="inconsolata-ui text-[12px] font-bold text-text-heading">
                    {rating > 0 ? rating.toFixed(1) : "0.0"}
                </span>
                <Star size={10} className="fill-blue-600 text-blue-600 mb-0.5" />
            </div>
        );
    }

    return (
        <div className={`flex flex-col items-start gap-0.5 group/rating ${className}`}>
            <div className="flex items-center gap-1.5">
                <span className="inconsolata-ui text-lg font-bold text-text-heading leading-none">
                    {rating > 0 ? rating.toFixed(1) : "0.0"}
                </span>
                
                {interactive ? (
                    <div className="flex items-center gap-0.5 relative">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => handleRate(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(null)}
                                className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
                            >
                                <Star 
                                    size={14} 
                                    className={`${
                                        star <= (hoverRating !== null ? hoverRating : Math.round(rating))
                                            ? 'fill-blue-600 text-blue-600' 
                                            : 'text-[var(--border)]'
                                    } transition-colors`} 
                                />
                            </button>
                        ))}
                        <div className="absolute -top-6 left-0 whitespace-nowrap bg-[var(--text-heading)] text-[var(--bg-main)] text-[9px] font-bold px-2 py-0.5 rounded opacity-0 group-hover/rating:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest">
                            Rate this course
                        </div>
                    </div>
                ) : (
                    <Star 
                        size={14} 
                        className="fill-blue-600 text-blue-600" 
                    />
                )}
            </div>
            
            {count !== undefined && (
                <span className="manrope-body text-[11px] text-text-muted font-medium opacity-80">
                    {count.toLocaleString()} {count === 1 ? 'review' : 'reviews'}
                </span>
            )}
        </div>
    );
};

export default StarRating;
