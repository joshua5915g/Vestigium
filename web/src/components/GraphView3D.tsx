"use client";

import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { GraphData, GraphNode, GraphLink } from "../lib/types";
import * as THREE from "three";

// Dynamic import for Next.js SSR compatibility
const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-[#05070d] text-cyan-400 font-mono text-xs">
      <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
      <span>INITIALIZING 3D WEBGL GRAPH MOTOR...</span>
    </div>
  ),
});

interface GraphView3DProps {
  data: GraphData;
  onNodeSelect: (node: GraphNode | null) => void;
  selectedNode: GraphNode | null;
  activeFilters?: Set<string>;
}

export const GraphView3D: React.FC<GraphView3DProps> = ({
  data,
  onNodeSelect,
  selectedNode,
  activeFilters,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);

  const getLinkId = (ref: string | GraphNode): string =>
    typeof ref === "object" ? ref.id : ref;

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || 800,
          height: containerRef.current.clientHeight || 600,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Filter nodes & links based on active group filters
  const filteredData = useMemo(() => {
    if (!activeFilters || activeFilters.size === 0) return data;

    const visibleNodes = data.nodes.filter((node) => activeFilters.has(node.group));
    const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));

    const visibleLinks = data.links.filter((link) => {
      const sourceId = getLinkId(link.source);
      const targetId = getLinkId(link.target);
      return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
    });

    return {
      nodes: visibleNodes,
      links: visibleLinks,
    };
  }, [data, activeFilters]);

  // Center & adjust camera when data changes
  useEffect(() => {
    if (fgRef.current && filteredData.nodes.length > 0) {
      const timer = setTimeout(() => {
        fgRef.current?.zoomToFit(600, 80);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filteredData]);

  // Camera fly-to animation when a node is selected
  useEffect(() => {
    if (selectedNode && fgRef.current && selectedNode.x !== undefined) {
      const distance = 120;
      const distRatio = 1 + distance / Math.hypot(selectedNode.x || 1, selectedNode.y || 1, selectedNode.z || 1);
      fgRef.current.cameraPosition(
        {
          x: (selectedNode.x || 0) * distRatio,
          y: (selectedNode.y || 0) * distRatio,
          z: (selectedNode.z || 0) * distRatio,
        },
        { x: selectedNode.x || 0, y: selectedNode.y || 0, z: selectedNode.z || 0 },
        1200
      );
    }
  }, [selectedNode]);

  // Custom 3D Node Mesh with emissive material and pulsing halo
  const nodeThreeObject = useCallback(
    (nodeObj: object) => {
      const node = nodeObj as GraphNode;
      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoverNode?.id === node.id;

      const group = new THREE.Group();

      const colorHex = node.color ? parseInt(node.color.replace("#", "0x"), 16) : 0x38bdf8;
      const baseRadius = Math.max((node.val || 16) / 4.5, 3.2);
      const radius = isSelected || isHovered ? baseRadius * 1.4 : baseRadius;

      // Solid Sphere Core
      const sphereGeo = new THREE.SphereGeometry(radius, 24, 24);
      const sphereMat = new THREE.MeshPhongMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: isSelected ? 0.9 : isHovered ? 0.7 : 0.45,
        shininess: 90,
      });
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      group.add(sphereMesh);

      // Outer Wireframe Glow for CVE & Crown Jewel Asset
      if (node.group === "cve" || node.group === "exploit" || node.group === "asset" || isSelected) {
        const wireGeo = new THREE.SphereGeometry(radius * 1.6, 12, 12);
        const wireMat = new THREE.MeshBasicMaterial({
          color: node.group === "cve" ? 0xff3366 : node.group === "asset" ? 0xa855f7 : 0x00f0ff,
          wireframe: true,
          transparent: true,
          opacity: isSelected ? 0.8 : 0.35,
        });
        const wireMesh = new THREE.Mesh(wireGeo, wireMat);
        group.add(wireMesh);
      }

      return group;
    },
    [selectedNode, hoverNode]
  );

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#05070d] overflow-hidden">
      {/* 3D Navigation Guide HUD */}
      <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl glass-panel border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
        <span>3D WEBGL • Left-Click: Orbit | Right-Click: Pan | Scroll: Zoom</span>
      </div>

      {dimensions.width > 0 && dimensions.height > 0 && (
        <ForceGraph3D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={filteredData}
          nodeThreeObject={nodeThreeObject}
          nodeThreeObjectExtend={false}
          linkColor={(linkObj: object) => {
            const link = linkObj as GraphLink;
            if (link.type === "threat_path" || link.type === "vulnerability") return "#ff3366";
            if (link.type === "impact") return "#a855f7";
            if (link.type === "control_flow") return "#60a5fa";
            return "#38bdf8";
          }}
          linkWidth={1.5}
          linkOpacity={0.65}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={1.8}
          linkDirectionalParticleSpeed={0.007}
          linkDirectionalParticleColor={(linkObj: object) => {
            const link = linkObj as GraphLink;
            return link.type === "threat_path" ? "#ff3366" : "#00f0ff";
          }}
          backgroundColor="#05070d"
          showNavInfo={false}
          onNodeClick={(node: object) => onNodeSelect(node as GraphNode)}
          onNodeHover={(node: object | null) => setHoverNode((node as GraphNode) || null)}
          onBackgroundClick={() => onNodeSelect(null)}
          enableNodeDrag={true}
          cooldownTicks={120}
        />
      )}
    </div>
  );
};
