/**
 * Pricing Utility
 * Handles time-sensitive discounts and pricing logic.
 */

export const NORMAL_PRICE = 299;
export const DISCOUNTED_PRICE = 224; // 25% off from 299 (approx)

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
    
    // End of Summer Flash Sale: May 18th to June 18th, 2026
    // IST is UTC+5:30
    
    const startTimeIST = new Date('2026-05-18T00:00:00+05:30');
    const endTimeIST = new Date('2026-06-19T00:00:00+05:30'); // End at start of June 19th
    
    const isWithinTime = now >= startTimeIST && now < endTimeIST;
    const hasDiscount = isWithinTime;
    
    // Check if it's "today" (May 17th) to show upcoming notice
    const isToday = now.getFullYear() === 2026 && now.getMonth() === 4 && now.getDate() === 17;
    
    let remainingSeconds = 0;
    if (isWithinTime) {
        remainingSeconds = Math.max(0, Math.floor((endTimeIST.getTime() - now.getTime()) / 1000));
    } else if (now < startTimeIST && isToday) {
        // Show countdown to start if it's May 17
        remainingSeconds = Math.max(0, Math.floor((startTimeIST.getTime() - now.getTime()) / 1000));
    }
    
    return {
        isToday: isToday || isWithinTime,
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
