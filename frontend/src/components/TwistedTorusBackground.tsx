"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function TwistedTorusBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    
    // Three.js Logic
    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let controls: OrbitControls;
    let torusMesh: THREE.Mesh;
    let wireframe: THREE.LineSegments;
    let frameId: number;

    const initThree = () => {
      scene = new THREE.Scene();
      
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Theme-aware colors from GEMINI.md
      // Primary Teal: #0F766E (0x0f766e)
      const meshColor = isDark ? 0x0f766e : 0xffffff;
      const wireColor = isDark ? 0x2dd4bf : 0x0f766e;

      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 0, 8);

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
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;

      scene.add(new THREE.AmbientLight(0xffffff, 0.5));

      const light1 = new THREE.PointLight(0xffffff, 2);
      light1.position.set(10, 10, 10);
      scene.add(light1);
      
      const light2 = new THREE.PointLight(0x2dd4bf, 1);
      light2.position.set(-10, -10, 10);
      scene.add(light2);

      // Trefoil Knot parameters: p=2, q=3
      const tubularSegments = 180;
      const radialSegments = 32;
      const radius = 2.4;
      const tube = 0.7;

      const knotGeo = new THREE.TorusKnotGeometry(radius, tube, tubularSegments, radialSegments, 2, 3);
      const torusGeo = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments);
      
      // Pre-calculate wireframe geometries once to avoid per-frame allocations
      const knotWireGeo = new THREE.WireframeGeometry(knotGeo);
      const torusWireGeo = new THREE.WireframeGeometry(torusGeo);
      
      const geometry = knotGeo.clone();
      const wireframeGeometry = knotWireGeo.clone();
      
      const material = new THREE.MeshStandardMaterial({
        color: meshColor,
        metalness: isDark ? 0.85 : 0.1,
        roughness: isDark ? 0.15 : 0.85,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isDark ? 0.8 : 0.25
      });

      torusMesh = new THREE.Mesh(geometry, material);
      scene.add(torusMesh);

      wireframe = new THREE.LineSegments(
        wireframeGeometry,
        new THREE.LineBasicMaterial({ 
          color: wireColor, 
          transparent: true, 
          opacity: isDark ? 0.3 : 0.5
        })
      );
      scene.add(wireframe);

      // Listen for theme changes to update colors
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleThemeChange = (e: MediaQueryListEvent) => {
        const newIsDark = e.matches;
        if (torusMesh && wireframe) {
          const m = torusMesh.material as THREE.MeshStandardMaterial;
          const w = wireframe.material as THREE.LineBasicMaterial;

          m.color.setHex(newIsDark ? 0x0f766e : 0xffffff);
          m.opacity = newIsDark ? 0.8 : 0.25;
          m.metalness = newIsDark ? 0.85 : 0.1;
          m.roughness = newIsDark ? 0.15 : 0.85;

          w.color.setHex(newIsDark ? 0x2dd4bf : 0x0f766e);
          w.opacity = newIsDark ? 0.3 : 0.5;
        }
      };
      mediaQuery.addEventListener('change', handleThemeChange);

      let time = 0;
      let twistFactor = 0; 
      let direction = 1;

      const animate = () => {
        frameId = requestAnimationFrame(animate);
        time += 0.008;

        // Transition logic: spend some time at the knot state and torus state
        twistFactor += 0.0025 * direction;
        
        if (twistFactor >= 1.2) {
          twistFactor = 1.2;
          direction = -1;
        } else if (twistFactor <= -0.2) {
          twistFactor = -0.2;
          direction = 1;
        }

        const clampedT = Math.max(0, Math.min(1, twistFactor));
        const t = clampedT * clampedT * (3 - 2 * clampedT);

        if (torusMesh && wireframe) {
          // Update Mesh positions
          const positions = geometry.attributes.position.array as Float32Array;
          const knotPos = knotGeo.attributes.position.array as Float32Array;
          const torusPos = torusGeo.attributes.position.array as Float32Array;

          for (let i = 0; i < positions.length; i++) {
            positions[i] = THREE.MathUtils.lerp(torusPos[i], knotPos[i], t);
          }
          geometry.attributes.position.needsUpdate = true;

          // Update Wireframe positions (Pre-calculated mapping)
          const wirePositions = wireframeGeometry.attributes.position.array as Float32Array;
          const wireKnotPos = knotWireGeo.attributes.position.array as Float32Array;
          const wireTorusPos = torusWireGeo.attributes.position.array as Float32Array;

          for (let i = 0; i < wirePositions.length; i++) {
            wirePositions[i] = THREE.MathUtils.lerp(wireTorusPos[i], wireKnotPos[i], t);
          }
          wireframeGeometry.attributes.position.needsUpdate = true;

          // Smooth rotation
          torusMesh.rotation.z += 0.0015;
          torusMesh.rotation.y += 0.001;
          
          const pulse = 1 + 0.02 * Math.sin(time);
          torusMesh.scale.set(pulse, pulse, pulse);
          
          wireframe.rotation.copy(torusMesh.rotation);
          wireframe.scale.copy(torusMesh.scale);
        }

        controls.update();
        renderer.render(scene, camera);
      };

      animate();

      window.addEventListener('resize', updateSize);
      
      // Use IntersectionObserver to pause animation when not visible
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            if (!frameId) animate();
          } else {
            if (frameId) {
              cancelAnimationFrame(frameId);
              frameId = 0;
            }
          }
        },
        { threshold: 0 }
      );
      
      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => {
        window.removeEventListener('resize', updateSize);
        mediaQuery.removeEventListener('change', handleThemeChange);
        observer.disconnect();
      };
    };

    const cleanup = initThree();

    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
      if (frameId) cancelAnimationFrame(frameId);
      if (renderer) renderer.dispose();
      if (torusMesh) {
        torusMesh.geometry.dispose();
        (torusMesh.material as THREE.Material).dispose();
      }
      if (wireframe) {
        wireframe.geometry.dispose();
        (wireframe.material as THREE.Material).dispose();
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full block opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background pointer-events-none" />
    </div>
  );
}
