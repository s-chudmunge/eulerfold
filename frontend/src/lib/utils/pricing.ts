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
    
    // Target date in IST: April 28, 2026
    // 2pm to 9pm IST
    // IST is UTC+5:30
    
    const startTimeIST = new Date('2026-04-28T14:00:00+05:30');
    const endTimeIST = new Date('2026-04-28T21:00:00+05:30');
    
    const isToday = now.getFullYear() === 2026 && now.getMonth() === 3 && now.getDate() === 28;
    const isWithinTime = now >= startTimeIST && now < endTimeIST;
    const hasDiscount = isWithinTime;
    
    let remainingSeconds = 0;
    if (isWithinTime) {
        remainingSeconds = Math.max(0, Math.floor((endTimeIST.getTime() - now.getTime()) / 1000));
    } else if (now < startTimeIST && isToday) {
        remainingSeconds = Math.max(0, Math.floor((startTimeIST.getTime() - now.getTime()) / 1000));
    }
    
    return {
        isToday,
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
