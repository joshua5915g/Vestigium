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

    // A. Holographic Wireframe Icosahedron Core (Obsidian Magma Ember)
    const icoGeo = new THREE.IcosahedronGeometry(68, 2);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0xff5a1f,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    clusterGroup.add(icoMesh);

    // B. Inner Glowing Particle Cloud (3,200 points with Magma & Ember gradients)
    const particleCount = 3200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cFlame = new THREE.Color(0xff5a1f);
    const cEmber = new THREE.Color(0xb3441a);
    const cCoral = new THREE.Color(0xff8a50);
    const cCrimson = new THREE.Color(0xff2a1f);
    const cBone = new THREE.Color(0xf5efe9);

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
      let c = cFlame;
      const rand = Math.random();
      if (rand > 0.8) c = cCrimson;
      else if (rand > 0.55) c = cCoral;
      else if (rand > 0.35) c = cEmber;
      else if (rand > 0.2) c = cBone;

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
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    clusterGroup.add(particlePoints);

    // C. Orbital Cyber Rings (Rotating Toruses in Magma Flame & Volcanic Crimson)
    const ringGeo1 = new THREE.TorusGeometry(84, 0.45, 16, 120);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xff5a1f,
      transparent: true,
      opacity: 0.45,
      wireframe: true,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    clusterGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(96, 0.35, 16, 120);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xff8a50,
      transparent: true,
      opacity: 0.32,
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
      const bColor = isCVE ? 0xff2a1f : isAsset ? 0xd946ef : 0xff5a1f;

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
      color: 0xff5a1f,
      transparent: true,
      opacity: 0.35,
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
      {/* Cinematic Obsidian Magma Luminous Glows */}
      <div className="absolute w-[650px] h-[650px] rounded-full bg-orange-600/15 blur-[140px] -top-24 -right-24 pointer-events-none" />
      <div className="absolute w-[550px] h-[550px] rounded-full bg-red-700/15 blur-[130px] bottom-0 -left-24 pointer-events-none" />
      <div className="absolute w-[450px] h-[450px] rounded-full bg-[#ff5a1f]/12 blur-[100px] top-1/2 left-1/3 pointer-events-none" />

      {/* Three.js Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-full block opacity-95 pointer-events-auto cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};
