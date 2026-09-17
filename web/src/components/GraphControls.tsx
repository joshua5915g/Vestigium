"use client";

import React from "react";
import { Filter, RotateCcw, Box, Compass } from "lucide-react";

interface GraphControlsProps {
  activeFilters: Set<string>;
  onToggleFilter: (group: string) => void;
  onResetFilters: () => void;
  dimensionMode?: "2D" | "3D";
  onToggleDimensionMode?: (mode: "2D" | "3D") => void;
}

const GROUPS = [
  { id: "repository", label: "Repository", color: "#38bdf8" },
  { id: "function", label: "Call Sites", color: "#60a5fa" },
  { id: "dependency", label: "Dependencies", color: "#fbbf24" },
  { id: "cve", label: "CVE Vectors", color: "#ef4444" },
  { id: "exploit", label: "Adversary RCE", color: "#dc2626" },
  { id: "asset", label: "Crown Jewels", color: "#a855f7" },
  { id: "safe", label: "Mitigations", color: "#10b981" },
];

export const GraphControls: React.FC<GraphControlsProps> = ({
  activeFilters,
  onToggleFilter,
  onResetFilters,
  dimensionMode = "3D",
  onToggleDimensionMode,
}) => {
  return (
    <div className="absolute bottom-6 left-6 z-20 glass-panel-elevated rounded-2xl p-3.5 shadow-2xl max-w-xs sm:max-w-md text-xs">
      {/* Top Bar: Dimension Mode & Reset */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-slate-400">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-bold uppercase text-[10px] font-mono tracking-wider text-slate-200">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            Filters
          </span>

          {/* 2D / 3D Mode Switcher */}
          {onToggleDimensionMode && (
            <div className="inline-flex rounded-lg border border-cyan-500/30 bg-slate-950/80 p-0.5 ml-2">
              <button
                onClick={() => onToggleDimensionMode("2D")}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  dimensionMode === "2D"
                    ? "bg-cyan-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Compass className="w-3 h-3" />
                2D
              </button>
              <button
                onClick={() => onToggleDimensionMode("3D")}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  dimensionMode === "3D"
                    ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Box className="w-3 h-3" />
                3D Spatial
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onResetFilters}
          className="text-[10px] font-mono text-cyan-400 hover:text-cyan-200 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 font-sans">
        {GROUPS.map((g) => {
          const isActive = activeFilters.has(g.id);
          return (
            <button
              key={g.id}
              onClick={() => onToggleFilter(g.id)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all text-left text-xs cursor-pointer ${
                isActive
                  ? "glass-panel text-slate-200 border-white/10"
                  : "bg-transparent text-slate-500 opacity-40 hover:opacity-75"
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: g.color }}
              />
              <span className="truncate font-medium text-[11px]">{g.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

