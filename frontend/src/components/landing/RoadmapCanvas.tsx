"use client"

import React, { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    baseOpacity: number;
    pulse: number;
    pulseSpeed: number;
}

interface ShootingStar {
    x: number;
    y: number;
    vx: number;
    vy: number;
    len: number;
    opacity: number;
    life: number;
}

interface Comet {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    opacity: number;
    life: number;
}

export default function RoadmapCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const shootingStarsRef = useRef<ShootingStar[]>([]);
    const cometsRef = useRef<Comet[]>([]);
    const canvasSizeRef = useRef({ width: 0, height: 0 });
    const requestRef = useRef<number>();

    useEffect(() => {
        const createParticles = (width: number, height: number) => {
            const isMobile = width < 768;
            const count = isMobile ? 45 : 80; // Reduced density by ~35%
            const particles: Particle[] = [];
            
            // Center exclusion zone for large stars (approx 40% width, 30% height)
            const exX = width * 0.3;
            const exY = height * 0.35;
            const exW = width * 0.4;
            const exH = height * 0.3;

            const isInsideExclusion = (x: number, y: number) => {
                return x > exX && x < exX + exW && y > exY && y < exY + exH;
            };

            for (let i = 0; i < count; i++) {
                let x = Math.random() * width;
                let y = Math.random() * height;

                const rand = Math.random();
                let size, baseOpacity;
                
                // Truly large (8% ratio)
                if (rand > 0.92) {
                    size = 1.9 + Math.random() * 2.1; 
                    baseOpacity = 0.4 + Math.random() * 0.2; // Middle ground
                    
                    // Exclusion check: Move large stars away from center UI
                    let attempts = 0;
                    while (isInsideExclusion(x, y) && attempts < 15) {
                        x = Math.random() * width;
                        y = Math.random() * height;
                        attempts++;
                    }
                } else if (rand > 0.65) {
                    // Medium stars
                    size = 1.1 + Math.random() * 0.6;
                    baseOpacity = 0.25 + Math.random() * 0.25; // Middle ground
                } else {
                    // Pinpoints
                    size = 0.5 + Math.random() * 0.5;
                    baseOpacity = 0.15 + Math.random() * 0.15; // Middle ground
                }

                particles.push({
                    x, y,
                    vx: (Math.random() - 0.5) * 0.04,
                    vy: (Math.random() - 0.5) * 0.04,
                    size,
                    baseOpacity,
                    pulse: Math.random() * Math.PI * 2,
                    pulseSpeed: 0.01 + Math.random() * 0.02
                });
            }
            particlesRef.current = particles;
            canvasSizeRef.current = { width, height };
        };

        const createShootingStar = () => {
            const { width, height } = canvasSizeRef.current;
            const side = Math.floor(Math.random() * 4);
            let x, y;
            
            // Start from edges
            if (side === 0) { x = Math.random() * width; y = 0; } // Top
            else if (side === 1) { x = width; y = Math.random() * height; } // Right
            else if (side === 2) { x = Math.random() * width; y = height; } // Bottom
            else { x = 0; y = Math.random() * height; } // Left

            const angle = Math.atan2(height/2 - y, width/2 - x) + (Math.random() - 0.5) * 0.5;
            const speed = 7 + Math.random() * 8;

            return {
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                len: 30 + Math.random() * 50,
                opacity: 0.8,
                life: 1.0
            };
        };

        const createComet = () => {
            const { width, height } = canvasSizeRef.current;
            const side = Math.floor(Math.random() * 4);
            let x, y;
            
            if (side === 0) { x = Math.random() * width; y = -50; }
            else if (side === 1) { x = width + 50; y = Math.random() * height; }
            else if (side === 2) { x = Math.random() * width; y = height + 50; }
            else { x = -50; y = Math.random() * height; }

            const angle = Math.atan2(height/2 - y, width/2 - x) + (Math.random() - 0.5) * 0.2;
            const speed = 0.8 + Math.random() * 1.2;

            // Space palette
            const colors = [
                '34, 211, 238',  // Cyan
                '168, 85, 247',  // Purple
                '20, 184, 166',  // Teal
                '236, 72, 153',  // Pink
                '99, 102, 241'   // Indigo
            ];
            const color = colors[Math.floor(Math.random() * colors.length)];

            return {
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 1.5 + Math.random() * 2.5,
                color,
                opacity: 1.0,
                life: 1.0
            };
        };

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const animate = () => {
            // Throttle: skip work if tab is hidden
            if (document.visibilityState === 'hidden') {
                requestRef.current = requestAnimationFrame(animate);
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const isDark = document.documentElement.classList.contains('dark') || 
                          (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
            
            const particles = particlesRef.current;
            const coreColor = isDark ? '245, 250, 255' : '51, 65, 85'; 
            const glowColor = isDark ? '180, 220, 255' : '100, 116, 139';

            // Occasional shooting star (infrequent)
            if (Math.random() < 0.0015 && shootingStarsRef.current.length < 2) {
                shootingStarsRef.current.push(createShootingStar());
            }

            // Extremely rare comet
            if (Math.random() < 0.000025 && cometsRef.current.length < 1) {
                cometsRef.current.push(createComet());
            }

            // Update and draw shooting stars
            shootingStarsRef.current = shootingStarsRef.current.filter(s => {
                s.x += s.vx;
                s.y += s.vy;
                s.life -= 0.012;
                
                if (s.life <= 0) return false;

                const opacity = s.opacity * s.life;
                const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 1.5, s.y - s.vy * 1.5);
                grad.addColorStop(0, `rgba(${coreColor}, ${opacity})`);
                grad.addColorStop(1, `rgba(${glowColor}, 0)`);
                
                ctx.beginPath();
                ctx.lineCap = 'round';
                ctx.strokeStyle = grad;
                ctx.lineWidth = 1.5;
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(s.x - s.vx * 1.2, s.y - s.vy * 1.2);
                ctx.stroke();

                return s.x > -100 && s.x < canvas.width + 100 && s.y > -100 && s.y < canvas.height + 100;
            });

            // Update and draw comets
            cometsRef.current = cometsRef.current.filter(c => {
                c.x += c.vx;
                c.y += c.vy;
                c.life -= 0.0015;
                
                if (c.life <= 0) return false;

                const opacity = c.opacity * c.life;
                const tailLen = 100 + Math.random() * 70;
                
                // 1. Main Outer Tail (Diffuse)
                const tailGrad = ctx.createLinearGradient(c.x, c.y, c.x - c.vx * tailLen, c.y - c.vy * tailLen);
                tailGrad.addColorStop(0, `rgba(${c.color}, ${opacity * 0.8})`);
                tailGrad.addColorStop(0.5, `rgba(${c.color}, ${opacity * 0.3})`);
                tailGrad.addColorStop(1, `rgba(${c.color}, 0)`);
                
                ctx.beginPath();
                ctx.lineCap = 'round';
                ctx.strokeStyle = tailGrad;
                ctx.lineWidth = c.size * 6; 
                ctx.moveTo(c.x, c.y);
                ctx.lineTo(c.x - c.vx * tailLen, c.y - c.vy * tailLen);
                ctx.stroke();

                // 2. Inner Bright Core Tail
                const innerTailGrad = ctx.createLinearGradient(c.x, c.y, c.x - c.vx * (tailLen * 0.6), c.y - c.vy * (tailLen * 0.6));
                innerTailGrad.addColorStop(0, `rgba(${coreColor}, ${opacity * 0.9})`);
                innerTailGrad.addColorStop(1, `rgba(${coreColor}, 0)`);
                
                ctx.beginPath();
                ctx.lineCap = 'round';
                ctx.strokeStyle = innerTailGrad;
                ctx.lineWidth = c.size * 2;
                ctx.moveTo(c.x, c.y);
                ctx.lineTo(c.x - c.vx * (tailLen * 0.6), c.y - c.vy * (tailLen * 0.6));
                ctx.stroke();

                // 3. Comet Head
                const headGrad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.size * 9);
                headGrad.addColorStop(0, `rgba(${coreColor}, ${opacity})`);
                headGrad.addColorStop(0.3, `rgba(${c.color}, ${opacity * 0.8})`);
                headGrad.addColorStop(1, `rgba(${c.color}, 0)`);
                
                ctx.beginPath();
                ctx.fillStyle = headGrad;
                ctx.arc(c.x, c.y, c.size * 9, 0, Math.PI * 2);
                ctx.fill();

                return c.x > -400 && c.x < canvas.width + 400 && c.y > -400 && c.y < canvas.height + 400;
            });

            particles.forEach((p) => {
                // Natural Brownian drift
                p.vx += (Math.random() - 0.5) * 0.003;
                p.vy += (Math.random() - 0.5) * 0.003;
                
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (speed > 0.2) {
                    p.vx *= 0.97;
                    p.vy *= 0.97;
                }
                
                p.x += p.vx;
                p.y += p.vy;
                
                // Wrap around logic with buffer for larger star rays
                const buffer = 50;
                if (p.x < -buffer) p.x = canvas.width + buffer;
                if (p.x > canvas.width + buffer) p.x = -buffer;
                if (p.y < -buffer) p.y = canvas.height + buffer;
                if (p.y > canvas.height + buffer) p.y = -buffer;
                
                p.pulse += p.pulseSpeed;
                const twinkle = Math.sin(p.pulse);
                const currentOpacity = Math.max(0.05, p.baseOpacity + twinkle * 0.15);
                const glowScale = 0.85 + twinkle * 0.15;

                const coreColor = isDark ? '245, 250, 255' : '51, 65, 85'; 
                const glowColor = isDark ? '180, 220, 255' : '100, 116, 139';

                // 1. Radial Glow
                const glowRadius = p.size * 6 * glowScale;
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
                gradient.addColorStop(0, `rgba(${glowColor}, ${currentOpacity * 0.4})`);
                gradient.addColorStop(0.5, `rgba(${glowColor}, ${currentOpacity * 0.1})`);
                gradient.addColorStop(1, `rgba(${glowColor}, 0)`);
                
                ctx.beginPath();
                ctx.fillStyle = gradient;
                ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
                ctx.fill();

                // 2. Tapered Organic Rays
                // Only for the truly large stars (>1.7)
                if (p.size > 1.7) {
                    const rayOpacity = currentOpacity * 0.45;
                    // Stable organic variation using pulse
                    const vMod = 1.0 + Math.cos(p.pulse * 0.7) * 0.1;
                    const hMod = 0.8 + Math.sin(p.pulse * 0.7) * 0.1;
                    
                    const verticalLen = p.size * 5.5 * glowScale * vMod;
                    const horizontalLen = p.size * 5.5 * glowScale * hMod;
                    
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(${coreColor}, ${rayOpacity})`;
                    ctx.lineWidth = 0.3; // Much thinner
                    
                    // Vertical
                    ctx.moveTo(p.x, p.y - verticalLen);
                    ctx.lineTo(p.x, p.y + verticalLen);
                    // Horizontal
                    ctx.moveTo(p.x - horizontalLen, p.y);
                    ctx.lineTo(p.x + horizontalLen, p.y);
                    
                    ctx.stroke();
                }

                // 3. Core
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 0.35, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${coreColor}, ${currentOpacity * 1.1})`;
                ctx.fill();
            });
            
            requestRef.current = requestAnimationFrame(animate);
        };

        const handleResize = () => {
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight;
            
            const oldWidth = canvasSizeRef.current.width;
            const oldHeight = canvasSizeRef.current.height;
            
            canvas.width = newWidth;
            canvas.height = newHeight;
            
            if (oldWidth === 0 || oldHeight === 0) {
                createParticles(newWidth, newHeight);
            } else {
                // Rescale existing particles to prevent flicker/re-gen
                const widthRatio = newWidth / oldWidth;
                const heightRatio = newHeight / oldHeight;
                particlesRef.current.forEach(p => {
                    p.x *= widthRatio;
                    p.y *= heightRatio;
                });
                canvasSizeRef.current = { width: newWidth, height: newHeight };
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        
        requestRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return (
        <canvas 
            ref={canvasRef} 
            className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
            style={{ opacity: 0.55, willChange: 'transform' }}
        />
    );
}
