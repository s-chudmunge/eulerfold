"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function QuantumBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );

    // Initial camera position
    camera.position.set(0, 8, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false, // Disabling antialias for performance, not really needed for a wireframe plane
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Capping pixel ratio at 1.5
    renderer.setSize(container.clientWidth, container.clientHeight);

    // Theme-aware colors
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const wireColor = isDark ? 0x2dd4bf : 0x0f766e;

    // Reduced segments for performance (40x40 = 1681 vertices instead of 60x60 = 3721)
    const geometry = new THREE.PlaneGeometry(80, 80, 40, 40);
    geometry.rotateX(-Math.PI / 2);

    const material = new THREE.MeshBasicMaterial({
      wireframe: true,
      color: wireColor,
      transparent: true,
      opacity: isDark ? 0.3 : 0.15,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Listen for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent) => {
      const newIsDark = e.matches;
      material.color.setHex(newIsDark ? 0x2dd4bf : 0x0f766e);
      material.opacity = newIsDark ? 0.3 : 0.15;
    };
    mediaQuery.addEventListener('change', handleThemeChange);

    let time = 0;
    let frameId: number | null = null;
    let lastTime = 0;

    const pos = geometry.attributes.position;
    const array = pos.array as Float32Array;

    function animate(now = 0) {
      frameId = requestAnimationFrame(animate);
      
      // Throttle to ~45 FPS to save battery and main thread on high-refresh screens
      if (now - lastTime < 22) return; 
      lastTime = now;

      time += 0.015;

      for (let i = 0; i < pos.count; i++) {
        const ix = i * 3;
        const x = array[ix];
        const z = array[ix + 2];

        // Direct access is faster than pos.getX/setY/getZ
        array[ix + 1] =
          Math.sin(x * 0.2 + time) * 1.5 +
          Math.cos(z * 0.2 + time) * 1.5;
      }

      pos.needsUpdate = true;
      renderer.render(scene, camera);
    }

    // IntersectionObserver to pause when not visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (frameId === null) animate();
        } else {
          if (frameId !== null) {
            cancelAnimationFrame(frameId);
            frameId = null;
          }
        }
      },
      { threshold: 0 }
    );
    observer.observe(container);

    function handleResize() {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      mediaQuery.removeEventListener('change', handleThemeChange);
      observer.disconnect();
      if (frameId !== null) cancelAnimationFrame(frameId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Gradient overlays for smooth blending */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-40" />
    </div>
  );
}
