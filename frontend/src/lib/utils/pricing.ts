/**
 * Pricing Utility
 * Handles time-sensitive discounts and pricing logic.
 */

export const NORMAL_PRICE = 299;
export const DISCOUNTED_PRICE = 149; // 50% off from 299

export interface DiscountStatus {
    isToday: boolean;
    isWithinTime: boolean;
    hasDiscount: boolean;
    remainingSeconds: number;
    startTime: Date;
    endTime: Date;
}

export function getDiscountStatus(): DiscountStatus {
    // Current time in UTC
    const now = new Date();
    
    // Target dates in IST: May 10th and May 11th, 2026
    // All day (00:00 to 23:59:59 IST)
    // IST is UTC+5:30
    
    const startTimeIST = new Date('2026-05-10T00:00:00+05:30');
    const endTimeIST = new Date('2026-05-12T00:00:00+05:30'); // End at start of May 12th
    
    const isToday = now.getFullYear() === 2026 && now.getMonth() === 4 && (now.getDate() === 10 || now.getDate() === 11);
    const isWithinTime = now >= startTimeIST && now < endTimeIST;
    const hasDiscount = isWithinTime;
    
    let remainingSeconds = 0;
    if (isWithinTime) {
        remainingSeconds = Math.max(0, Math.floor((endTimeIST.getTime() - now.getTime()) / 1000));
    } else if (now < startTimeIST && (now.getFullYear() === 2026 && now.getMonth() === 4 && now.getDate() === 9)) {
        // If it's May 9, show countdown to May 10th
        remainingSeconds = Math.max(0, Math.floor((startTimeIST.getTime() - now.getTime()) / 1000));
    }
    
    return {
        isToday: isToday || (now.getFullYear() === 2026 && now.getMonth() === 4 && now.getDate() === 9),
        isWithinTime,
        hasDiscount,
        remainingSeconds,
        startTime: startTimeIST,
        endTime: endTimeIST
    };
}

export function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
