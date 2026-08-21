"use client";

import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            if (document.documentElement.classList.contains('dark')) {
                setTheme('dark');
            } else {
                setTheme('light');
            }
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('eulerfold-theme', newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    if (!mounted) {
        return (
            <button
                className="p-1.5 text-text-muted opacity-70 transition-opacity"
                aria-label="Toggle Theme placeholder"
                disabled
            >
                <div className="w-3.5 h-3.5" />
            </button>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className="p-1.5 text-text-muted opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Toggle Theme"
        >
            {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
        </button>
    );
}
