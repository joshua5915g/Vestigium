"use client";

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { GraphData, GraphNode, GraphLink } from "../lib/types";
import type { ForceGraphMethods } from "react-force-graph-2d";
import { Maximize2, ZoomIn, ZoomOut, ChevronRight, ShieldAlert, Lock, Code2, Package } from "lucide-react";

// Dynamic import for Next.js SSR compatibility
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-[#06080f] text-cyan-400 font-mono text-xs">
      <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
      <span>INITIALIZING CANVAS GRAPH MOTOR...</span>
    </div>
  ),
});

interface GraphViewProps {
  data: GraphData;
  onNodeSelect: (node: GraphNode | null) => void;
  selectedNode: GraphNode | null;
  activeFilters?: Set<string>;
}

export const GraphView: React.FC<GraphViewProps> = ({
  data,
  onNodeSelect,
  selectedNode,
  activeFilters,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);

  const getLinkId = (ref: string | GraphNode): string =>
    typeof ref === "object" ? ref.id : ref;

  // Resize handler
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

  // Center graph when data changes
  useEffect(() => {
    if (fgRef.current && filteredData.nodes.length > 0) {
      const timer = setTimeout(() => {
        fgRef.current?.zoomToFit(400, 70);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [filteredData]);

  // Highlight neighbors set
  const highlightNodes = useMemo(() => {
    const set = new Set<string>();
    const active = hoverNode || selectedNode;
    if (active) {
      set.add(active.id);
      filteredData.links.forEach((link) => {
        const sourceId = getLinkId(link.source);
        const targetId = getLinkId(link.target);
        if (sourceId === active.id) set.add(targetId);
        if (targetId === active.id) set.add(sourceId);
      });
    }
    return set;
  }, [hoverNode, selectedNode, filteredData.links]);

  // Custom node canvas renderer with ambient glowing halos and crisp labels
  const nodeCanvasRenderer = useCallback(
    (nodeObj: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const node = nodeObj as GraphNode;
      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoverNode?.id === node.id;
      const isHighlighted = highlightNodes.has(node.id);
      const hasActive = hoverNode || selectedNode;

      const baseRadius = Math.max((node.val || 16) / 2.8, 5);
      const radius = isSelected || isHovered ? baseRadius * 1.3 : baseRadius;
      const x = node.x || 0;
      const y = node.y || 0;

      ctx.save();

      // Outer luminous halo for critical CVEs and assets
      if (node.group === "cve" || node.group === "exploit" || isSelected || isHovered) {
        const haloRadius = radius * (isSelected ? 2.5 : 1.8);
        const glowColor = node.color || (node.group === "cve" ? "#ff3366" : "#00f0ff");
        const gradient = ctx.createRadialGradient(x, y, radius * 0.5, x, y, haloRadius);
        gradient.addColorStop(0, `${glowColor}66`);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, haloRadius, 0, 2 * Math.PI, false);
        ctx.fill();
      }

      // Selection indicator border ring
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(x, y, radius + 4, 0, 2 * Math.PI, false);
        ctx.strokeStyle = "#00f0ff";
        ctx.lineWidth = 2 / globalScale;
        ctx.setLineDash([4 / globalScale, 2 / globalScale]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Node Body Circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
      
      // Node fill & opacity
      if (hasActive && !isHighlighted) {
        ctx.fillStyle = `${node.color || "#64748b"}33`;
      } else {
        ctx.fillStyle = node.color || "#38bdf8";
      }
      ctx.fill();

      // Node subtle stroke
      ctx.strokeStyle = isSelected 
        ? "#ffffff" 
        : isHovered 
          ? "#38bdf8" 
          : "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = (isSelected ? 2 : 1) / globalScale;
      ctx.stroke();

      // Node Label (Visible when zoomed in, hovered, selected, or high-severity)
      const shouldDrawLabel = 
        globalScale > 1.2 || 
        isSelected || 
        isHovered || 
        node.group === "repository" || 
        node.group === "cve" ||
        node.group === "asset";

      if (shouldDrawLabel) {
        const label = node.name || node.id;
        const fontSize = Math.max(11 / globalScale, 3.5);
        ctx.font = `${isSelected || isHovered ? "bold" : "normal"} ${fontSize}px var(--font-geist-mono), monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const labelY = y + radius + fontSize + (2 / globalScale);

        // Label Background Pill for readability
        const textWidth = ctx.measureText(label).width;
        const padding = 3 / globalScale;
        
        ctx.fillStyle = "rgba(6, 8, 15, 0.85)";
        ctx.fillRect(
          x - textWidth / 2 - padding,
          labelY - fontSize / 2 - padding / 2,
          textWidth + padding * 2,
          fontSize + padding
        );

        ctx.strokeStyle = isSelected 
          ? "rgba(0, 240, 255, 0.5)" 
          : "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 0.5 / globalScale;
        ctx.strokeRect(
          x - textWidth / 2 - padding,
          labelY - fontSize / 2 - padding / 2,
          textWidth + padding * 2,
          fontSize + padding
        );

        // Label Text
        ctx.fillStyle = hasActive && !isHighlighted 
          ? "rgba(148, 163, 184, 0.3)" 
          : isSelected || isHovered 
            ? "#ffffff" 
            : "#cbd5e1";
        ctx.fillText(label, x, labelY);
      }

      ctx.restore();
    },
    [selectedNode, hoverNode, highlightNodes]
  );

  // Link Canvas rendering with directional arrows and glows
  const linkColor = useCallback(
    (linkObj: object) => {
      const link = linkObj as GraphLink;
      const sourceId = getLinkId(link.source);
      const targetId = getLinkId(link.target);
      const active = hoverNode || selectedNode;

      if (active) {
        const isConnected = sourceId === active.id || targetId === active.id;
        return isConnected ? "rgba(0, 240, 255, 0.8)" : "rgba(255, 255, 255, 0.04)";
      }

      switch (link.type) {
        case "threat_path":
          return "rgba(255, 51, 102, 0.7)";
        case "impact":
          return "rgba(168, 85, 247, 0.7)";
        case "vulnerability":
          return "rgba(255, 51, 102, 0.5)";
        case "control_flow":
          return "rgba(96, 165, 250, 0.5)";
        default:
          return "rgba(255, 255, 255, 0.15)";
      }
    },
    [hoverNode, selectedNode]
  );

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#06080f] overflow-hidden">
      {/* Attack Chain Breadcrumb Tracker Header HUD */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl glass-panel-elevated border border-white/10 text-xs font-mono shadow-2xl">
        <div className="flex items-center gap-1.5 text-cyan-400">
          <Code2 className="w-3.5 h-3.5" />
          <span className="font-semibold">Repository</span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <div className="flex items-center gap-1.5 text-blue-400">
          <span className="font-semibold">Entrypoint</span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <div className="flex items-center gap-1.5 text-amber-400">
          <Package className="w-3.5 h-3.5" />
          <span className="font-semibold">Dependency</span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <div className="flex items-center gap-1.5 text-red-400">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span className="font-semibold">CVE Vector</span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <div className="flex items-center gap-1.5 text-purple-400">
          <Lock className="w-3.5 h-3.5" />
          <span className="font-semibold">Crown Jewel Asset</span>
        </div>
      </div>

      {/* Force Graph Canvas */}
      {dimensions.width > 0 && dimensions.height > 0 && (
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={filteredData}
          nodeCanvasObject={nodeCanvasRenderer}
          nodeCanvasObjectMode={() => "replace"}
          linkColor={linkColor}
          linkWidth={(linkObj: object) => {
            const link = linkObj as GraphLink;
            const active = hoverNode || selectedNode;
            if (active) {
              const sourceId = getLinkId(link.source);
              const targetId = getLinkId(link.target);
              const isConn = sourceId === active.id || targetId === active.id;
              return isConn ? 2.2 : 0.8;
            }
            return 1.2;
          }}
          linkDirectionalArrowLength={4.5}
          linkDirectionalArrowRelPos={0.9}
          linkDirectionalParticles={1}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleSpeed={0.006}
          onNodeClick={(node) => onNodeSelect(node as GraphNode)}
          onNodeHover={(node) => setHoverNode((node as GraphNode) || null)}
          onBackgroundClick={() => onNodeSelect(null)}
          cooldownTicks={120}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
        />
      )}

      {/* Canvas HUD Controls */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">
        <button
          onClick={() => fgRef.current?.zoomToFit(400, 60)}
          className="p-2.5 rounded-xl glass-panel hover:bg-white/10 text-slate-300 hover:text-white transition-all shadow-xl cursor-pointer"
          title="Zoom to Fit"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => fgRef.current?.zoom(fgRef.current.zoom() * 1.3, 300)}
          className="p-2.5 rounded-xl glass-panel hover:bg-white/10 text-slate-300 hover:text-white transition-all shadow-xl cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => fgRef.current?.zoom(fgRef.current.zoom() * 0.7, 300)}
          className="p-2.5 rounded-xl glass-panel hover:bg-white/10 text-slate-300 hover:text-white transition-all shadow-xl cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
