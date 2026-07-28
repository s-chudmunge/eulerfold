import { useState, useEffect } from 'react';

/**
 * Pricing Utility
 * Handles time-sensitive discounts, multi-currency detection, and pricing logic.
 */

export const NORMAL_PRICE_INR = 149;
export const NORMAL_PRICE_USD = 3;

export const DISCOUNTED_PRICE_INR = 149; // Same as normal price for now
export const DISCOUNTED_PRICE_USD = 3;

// Backwards compatibility constants (INR defaults)
export const NORMAL_PRICE = NORMAL_PRICE_INR;
export const DISCOUNTED_PRICE = DISCOUNTED_PRICE_INR;

export interface CurrencyConfig {
    isIndia: boolean;
    currency: 'INR' | 'USD';
    symbol: string;
    normalPrice: number;
    discountedPrice: number;
}

/**
 * Synchronous check to detect if the user is in India based on browser signals
 * (timezone and navigator locale).
 */
export function isUserInIndia(): boolean {
    if (typeof window === 'undefined') return true;
    try {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timeZone && (timeZone === 'Asia/Kolkata' || timeZone === 'Asia/Calcutta' || timeZone.includes('Kolkata') || timeZone.includes('Calcutta'))) {
            return true;
        }
        const lang = (navigator.language || (navigator.languages && navigator.languages[0]) || '').toLowerCase();
        if (lang.endsWith('-in') || lang === 'hi') {
            return true;
        }
        return false;
    } catch {
        return true;
    }
}

export function getPricingConfig(isIndia: boolean = true): CurrencyConfig {
    const currency = isIndia ? 'INR' : 'USD';
    const symbol = isIndia ? '₹' : '$';
    const normalPrice = isIndia ? NORMAL_PRICE_INR : NORMAL_PRICE_USD;
    const discountedPrice = isIndia ? DISCOUNTED_PRICE_INR : DISCOUNTED_PRICE_USD;

    return {
        isIndia,
        currency,
        symbol,
        normalPrice,
        discountedPrice
    };
}

export function formatPrice(price: number, symbol: string = '₹'): string {
    return `${symbol}${price}`;
}

export function usePricing() {
    const [isIndia, setIsIndia] = useState<boolean>(() => isUserInIndia());

    useEffect(() => {
        setIsIndia(isUserInIndia());

        // Asynchronous IP check fallback to confirm country
        fetch('https://ipapi.co/json/')
            .then((res) => res.json())
            .then((data) => {
                if (data && data.country_code) {
                    setIsIndia(data.country_code === 'IN');
                }
            })
            .catch(() => {
                // If IP lookup is blocked or fails, keep timezone-based detection
            });
    }, []);

    const config = getPricingConfig(isIndia);

    return {
        ...config,
        formatPrice: (price: number) => formatPrice(price, config.symbol)
    };
}

export interface DiscountStatus {
    isToday: boolean;
    isWithinTime: boolean;
    hasDiscount: boolean;
    remainingSeconds: number;
    startTime: Date;
    endTime: Date;
}

export function getDiscountStatus(): DiscountStatus {
    const now = new Date();
    const startTimeIST = new Date('2026-05-18T00:00:00+05:30');
    const endTimeIST = new Date('2026-07-01T00:00:00+05:30');
    
    return {
        isToday: false,
        isWithinTime: false,
        hasDiscount: false,
        remainingSeconds: 0,
        startTime: startTimeIST,
        endTime: endTimeIST
    };
}

export function formatTime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (seconds >= 172800) {
        return `${days} Day${days > 1 ? 's' : ''}, ${h} Hour${h !== 1 ? 's' : ''}`;
    }
    
    const totalHours = Math.floor(seconds / 3600);
    return `${totalHours.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
