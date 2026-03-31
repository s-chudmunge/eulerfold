"use client";

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface EulerLogoCanvasProps {
  size?: number;
  className?: string;
  rotationSpeed?: number;
}

export default function EulerLogoCanvas({ 
  size = 28, 
  className = "", 
  rotationSpeed = 0.004 
}: EulerLogoCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    
    // Orthographic camera for a perfectly flat, logo-like feel
    const aspect = 1; // Since it's a square container
    const frustum = 1.5;
    const camera = new THREE.OrthographicCamera(
      -frustum * aspect, frustum * aspect,
       frustum, -frustum,
      0.1, 100
    );
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true // Important for background transparency
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
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

    // Alternate faces by color using index for a "checkered" look
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
        color: 0xb0bec5, // Slate gray
        flatShading: true, 
        metalness: 0.2, 
        roughness: 0.4 
      }),
      new THREE.MeshStandardMaterial({ 
        color: 0x26c6c6, // Teal
        flatShading: true, 
        metalness: 0.1, 
        roughness: 0.3 
      }),
    ];

    const mesh = new THREE.Mesh(geometry, materials);
    scene.add(mesh);

    // --- Lights ---
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(-2, 3, 2);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(3, -1, 1);
    scene.add(fillLight);

    scene.add(new THREE.AmbientLight(0xffffff, 0.35));

    // --- Animation Loop ---
    let frameId: number | null = null;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      mesh.rotation.y += rotationSpeed;
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
  }, [size, rotationSpeed]);

  return (
    <div 
      ref={containerRef} 
      className={`inline-block overflow-hidden pointer-events-none ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
