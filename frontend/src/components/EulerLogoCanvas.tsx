"use client";

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface EulerLogoCanvasProps {
  size?: number;
  className?: string;
  rotationSpeed?: number;
  color1?: string | number;
  color2?: string | number;
  wireframe?: boolean;
  emissive1?: string | number;
  emissive2?: string | number;
  emissiveIntensity?: number;
  tiltX?: number;
  tiltZ?: number;
  floatSpeed?: number;
}

export default function EulerLogoCanvas({ 
  size = 28, 
  className = "", 
  rotationSpeed = 0.004,
  color1 = 0xb0bec5,
  color2 = 0x26c6c6,
  wireframe = false,
  emissive1 = 0x000000,
  emissive2 = 0x000000,
  emissiveIntensity = 0.5,
  tiltX = 0,
  tiltZ = 0,
  floatSpeed = 0
}: EulerLogoCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    
    // Orthographic camera for a perfectly flat, logo-like feel
    const aspect = 1; 
    const frustum = 1.6; // Slightly zoomed out to prevent clipping when tilted
    const camera = new THREE.OrthographicCamera(
      -frustum * aspect, frustum * aspect,
       frustum, -frustum,
      0.1, 100
    );
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Bump pixel ratio for sharper edges
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- Geometry Data ---
    const r = 1;
    const verts: [number, number, number][] = [
      [ 0,  r,  0],
      [ 0, -r,  0],
      [ r,  0,  0],
      [-r,  0,  0],
      [ 0,  0,  r],
      [ 0,  0, -r],
    ];

    const faces: [number, number, number][] = [
      [0, 2, 4], [0, 4, 3], [0, 3, 5], [0, 5, 2],
      [1, 4, 2], [1, 3, 4], [1, 5, 3], [1, 2, 5],
    ];

    const grayFaces = faces.filter((_, i) => i % 2 === 0);
    const tealFaces = faces.filter((_, i) => i % 2 !== 0);

    function buildGeometryData(faceList: [number, number, number][]) {
      const positions: number[] = [], normals: number[] = [];
      for (const [a, b, c] of faceList) {
        const va = new THREE.Vector3(...verts[a]);
        const vb = new THREE.Vector3(...verts[b]);
        const vc = new THREE.Vector3(...verts[c]);
        const n = new THREE.Vector3().crossVectors(
          new THREE.Vector3().subVectors(vb, va),
          new THREE.Vector3().subVectors(vc, va)
        ).normalize();
        for (const v of [va, vb, vc]) {
          positions.push(v.x, v.y, v.z);
          normals.push(n.x, n.y, n.z);
        }
      }
      return { positions: new Float32Array(positions), normals: new Float32Array(normals) };
    }

    const grayData = buildGeometryData(grayFaces);
    const tealData = buildGeometryData(tealFaces);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([...grayData.positions, ...tealData.positions]), 3));
    geometry.setAttribute('normal',   new THREE.BufferAttribute(new Float32Array([...grayData.normals,   ...tealData.normals]), 3));
    geometry.addGroup(0, grayData.positions.length / 3, 0);
    geometry.addGroup(grayData.positions.length / 3, tealData.positions.length / 3, 1);

    const materials = [
      new THREE.MeshStandardMaterial({ 
        color: color1,
        emissive: emissive1,
        emissiveIntensity: emissiveIntensity,
        flatShading: true, 
        metalness: wireframe ? 0.8 : 0.3, 
        roughness: wireframe ? 0.2 : 0.4,
        wireframe: wireframe,
        transparent: true,
        opacity: wireframe ? 0.85 : 1
      }),
      new THREE.MeshStandardMaterial({ 
        color: color2,
        emissive: emissive2,
        emissiveIntensity: emissiveIntensity,
        flatShading: true, 
        metalness: wireframe ? 0.8 : 0.2, 
        roughness: wireframe ? 0.2 : 0.3,
        wireframe: wireframe,
        transparent: true,
        opacity: wireframe ? 0.85 : 1
      }),
    ];

    const mesh = new THREE.Mesh(geometry, materials);
    
    // Initial Tilt Configuration
    mesh.rotation.x = tiltX;
    mesh.rotation.z = tiltZ;
    scene.add(mesh);

    // --- Lights (Enhanced for polishing) ---
    const keyLight = new THREE.DirectionalLight(0xffffff, wireframe ? 2.0 : 1.6);
    keyLight.position.set(-2, 4, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, wireframe ? 1.0 : 0.6);
    fillLight.position.set(4, -2, 2);
    scene.add(fillLight);
    
    const rimLight = new THREE.DirectionalLight(0xffffff, wireframe ? 1.5 : 0.8);
    rimLight.position.set(0, 5, -5); // Backlight for nice edge highlights
    scene.add(rimLight);

    scene.add(new THREE.AmbientLight(0xffffff, wireframe ? 0.8 : 0.4));

    // --- Animation Loop ---
    let frameId: number | null = null;
    const startTime = Date.now();
    
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      // Core rotation on local Y axis
      mesh.rotateY(rotationSpeed);
      
      // Smooth floating animation
      if (floatSpeed > 0) {
        const t = (Date.now() - startTime) * 0.001 * floatSpeed;
        mesh.position.y = Math.sin(t) * 0.15;
      }
      
      renderer.render(scene, camera);
    };

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
    observer.observe(containerRef.current);

    // --- Cleanup ---
    return () => {
      observer.disconnect();
      if (frameId !== null) cancelAnimationFrame(frameId);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (containerRef.current && rendererRef.current.domElement) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
      }
      geometry.dispose();
      materials.forEach(m => m.dispose());
    };
  }, [size, rotationSpeed, color1, color2, wireframe, emissive1, emissive2, emissiveIntensity, tiltX, tiltZ, floatSpeed]);

  return (
    <div 
      ref={containerRef} 
      className={`inline-block overflow-hidden pointer-events-none ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
