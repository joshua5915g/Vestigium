"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export const CyberHero3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 240;

    // 2. WebGL Renderer with Alpha & Antialias
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // 3. Cyber Cluster Group (Rotates dynamically)
    const clusterGroup = new THREE.Group();
    scene.add(clusterGroup);

    // A. Holographic Wireframe Icosahedron Core
    const icoGeo = new THREE.IcosahedronGeometry(68, 2);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.14,
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    clusterGroup.add(icoMesh);

    // B. Inner Glowing Particle Cloud (3,200 points)
    const particleCount = 3200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cCyan = new THREE.Color(0x00f0ff);
    const cBlue = new THREE.Color(0x38bdf8);
    const cPurple = new THREE.Color(0xa855f7);
    const cCrimson = new THREE.Color(0xff3366);

    for (let i = 0; i < particleCount; i++) {
      // Golden Spiral Spherical distribution with random depth dispersion
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;
      const radius = 62 + (Math.random() - 0.5) * 28;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color variation based on depth & index
      let c = cCyan;
      const rand = Math.random();
      if (rand > 0.82) c = cCrimson;
      else if (rand > 0.6) c = cPurple;
      else if (rand > 0.3) c = cBlue;

      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Particle Shader Material
    const particleMat = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    clusterGroup.add(particlePoints);

    // C. Orbital Cyber Rings (Rotating Toruses)
    const ringGeo1 = new THREE.TorusGeometry(84, 0.45, 16, 120);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.4,
      wireframe: true,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    clusterGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(96, 0.35, 16, 120);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.3,
      wireframe: true,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 3;
    clusterGroup.add(ring2);

    // D. Prominent Threat & Entrypoint Beacon Nodes with Laser Links
    const beaconCount = 18;
    const beaconGeo = new THREE.SphereGeometry(2.4, 16, 16);
    const beaconNodes: { mesh: THREE.Mesh; type: "cve" | "asset" | "repo" | "func"; pulse: number }[] = [];

    const linePoints: THREE.Vector3[] = [];
    const lineIndices: number[] = [];

    for (let i = 0; i < beaconCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / beaconCount);
      const theta = Math.sqrt(beaconCount * Math.PI) * phi;
      const radius = 72;

      const pos = new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );

      const isCVE = i % 4 === 0;
      const isAsset = i % 5 === 0;
      const bColor = isCVE ? 0xff3366 : isAsset ? 0xa855f7 : 0x00f0ff;

      const bMat = new THREE.MeshBasicMaterial({
        color: bColor,
        wireframe: false,
      });
      const bMesh = new THREE.Mesh(beaconGeo, bMat);
      bMesh.position.copy(pos);
      clusterGroup.add(bMesh);

      beaconNodes.push({
        mesh: bMesh,
        type: isCVE ? "cve" : isAsset ? "asset" : "repo",
        pulse: Math.random() * Math.PI * 2,
      });

      linePoints.push(pos);
    }

    // Interconnect closest beacon nodes with neon laser lines
    for (let i = 0; i < beaconCount; i++) {
      for (let j = i + 1; j < beaconCount; j++) {
        if (linePoints[i].distanceTo(linePoints[j]) < 85) {
          lineIndices.push(i, j);
        }
      }
    }

    const laserLinesGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
    laserLinesGeo.setIndex(lineIndices);
    const laserLinesMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    const laserLinesMesh = new THREE.LineSegments(laserLinesGeo, laserLinesMat);
    clusterGroup.add(laserLinesMesh);

    // 4. Mouse Interactive Parallax
    let targetRotX = 0;
    let targetRotY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / mount.clientWidth) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / mount.clientHeight) * 2 - 1);
      targetRotY = mouseX * 0.55;
      targetRotX = -mouseY * 0.45;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    // 5. High-FPS Render Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera / cluster rotation with mouse tracking
      clusterGroup.rotation.y += 0.003;
      clusterGroup.rotation.x += (targetRotX - clusterGroup.rotation.x) * 0.04;
      clusterGroup.rotation.y += (targetRotY - (clusterGroup.rotation.y % (Math.PI * 2))) * 0.02;

      // Orbit Ring Counter-Rotations
      ring1.rotation.z += 0.006;
      ring2.rotation.z -= 0.008;

      // Pulse beacon scales & light intensity
      for (let i = 0; i < beaconNodes.length; i++) {
        const b = beaconNodes[i];
        const s = 1 + Math.sin(elapsedTime * 4 + b.pulse) * 0.35;
        b.mesh.scale.set(s, s, s);
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center">
      {/* Cinematic Luminous Glows */}
      <div className="absolute w-[650px] h-[650px] rounded-full bg-cyan-500/15 blur-[140px] -top-24 -right-24 pointer-events-none" />
      <div className="absolute w-[550px] h-[550px] rounded-full bg-purple-600/12 blur-[120px] bottom-0 -left-24 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-red-500/10 blur-[90px] top-1/2 left-1/3 pointer-events-none" />

      {/* Three.js Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-full block opacity-95 pointer-events-auto cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};
