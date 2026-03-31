"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry';

export default function MobiusBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    // Three.js Logic
    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let controls: OrbitControls;
    let mobiusMesh: THREE.Mesh;
    let wireframe: THREE.LineSegments;
    let frameId: number;

    const initThree = () => {
      scene = new THREE.Scene();
      
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Theme-aware colors
      const meshColor = isDark ? 0x134e4a : 0xffffff;
      const wireColor = isDark ? 0x2dd4bf : 0x0f766e;

      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 2, 6);

      renderer = new THREE.WebGLRenderer({ 
        canvas, 
        antialias: true, 
        alpha: true 
      });
      renderer.setClearColor(0x000000, 0);
      
      const updateSize = () => {
        const width = containerRef.current?.clientWidth || window.innerWidth;
        const height = containerRef.current?.clientHeight || window.innerHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      updateSize();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enableZoom = false;

      scene.add(new THREE.AmbientLight(0xffffff, 0.8));

      const light1 = new THREE.PointLight(0xffffff, 1.5);
      light1.position.set(5, 5, 5);
      scene.add(light1);

      function mobius(u: number, v: number, target: THREE.Vector3) {
        u = u * Math.PI * 2;
        v = (v - 0.5) * 2;
        const a = 1.1;
        const x = (a + v * Math.cos(u / 2)) * Math.cos(u);
        const y = (a + v * Math.cos(u / 2)) * Math.sin(u);
        const z = v * Math.sin(u / 2);
        target.set(x, z, y);
      }

      const geometry = new ParametricGeometry(mobius, 80, 20);
      const material = new THREE.MeshStandardMaterial({
        color: meshColor,
        metalness: isDark ? 0.9 : 0.1,
        roughness: isDark ? 0.1 : 0.9,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isDark ? 0.95 : 0.4
      });

      mobiusMesh = new THREE.Mesh(geometry, material);
      scene.add(mobiusMesh);

      wireframe = new THREE.LineSegments(
        new THREE.WireframeGeometry(geometry),
        new THREE.LineBasicMaterial({ 
          color: wireColor, 
          transparent: true, 
          opacity: isDark ? 0.7 : 0.9
        })
      );
      scene.add(wireframe);

      // Listen for theme changes to update colors
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleThemeChange = (e: MediaQueryListEvent) => {
        const newIsDark = e.matches;
        if (mobiusMesh && wireframe) {
          const m = mobiusMesh.material as THREE.MeshStandardMaterial;
          const w = wireframe.material as THREE.LineBasicMaterial;

          m.color.setHex(newIsDark ? 0x134e4a : 0xffffff);
          m.opacity = newIsDark ? 0.95 : 0.4;
          m.metalness = newIsDark ? 0.9 : 0.1;
          m.roughness = newIsDark ? 0.1 : 0.9;

          w.color.setHex(newIsDark ? 0x2dd4bf : 0x0f766e);
          w.opacity = newIsDark ? 0.7 : 0.9;
        }
      };
      mediaQuery.addEventListener('change', handleThemeChange);

      let time = 0;
      let last = 0;

      const animate = (now = 0) => {
        frameId = requestAnimationFrame(animate);
        if (now - last < 30) return;
        last = now;

        time += 0.01;
        if (mobiusMesh) {
          mobiusMesh.rotation.x += 0.003;
          mobiusMesh.rotation.y += 0.005;
          const pulse = 1 + 0.04 * Math.sin(time);
          mobiusMesh.scale.set(pulse, pulse, 1);
          
          if (wireframe) {
            wireframe.rotation.copy(mobiusMesh.rotation);
            wireframe.scale.copy(mobiusMesh.scale);
          }
        }

        controls.update();
        renderer.render(scene, camera);
      };

      animate();

      window.addEventListener('resize', updateSize);
      return () => {
        window.removeEventListener('resize', updateSize);
        mediaQuery.removeEventListener('change', handleThemeChange);
      };
    };

    const cleanupResize = initThree();

    return () => {
      if (typeof cleanupResize === 'function') {
        window.removeEventListener('resize', cleanupResize);
      }
      cancelAnimationFrame(frameId);
      if (renderer) renderer.dispose();
      if (mobiusMesh) {
        mobiusMesh.geometry.dispose();
        (mobiusMesh.material as THREE.Material).dispose();
      }
      if (wireframe) {
        wireframe.geometry.dispose();
        (wireframe.material as THREE.Material).dispose();
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full block opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/5 to-background pointer-events-none" />
    </div>
  );
}
