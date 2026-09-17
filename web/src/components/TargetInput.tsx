"use client";

import React, { useState } from "react";
import { 
  Search, 
  Loader2, 
  Crosshair, 
  Layers, 
  Radio, 
  Flame,
  ShieldCheck,
  Bot
} from "lucide-react";

interface TargetInputProps {
  onAnalyze: (target: string, targetType: string, depth: number) => void;
  loading: boolean;
  initialTarget?: string;
}

const PRESET_TARGETS = [
  {
    name: "garrytan/gstack (AI Skills RCE)",
    target: "https://github.com/garrytan/gstack",
    type: "repository",
    tag: "CVE-2024-43485",
    icon: <Bot className="w-3 h-3 text-cyan-400" />,
    badgeColor: "border-cyan-500/40 bg-cyan-950/30 text-cyan-300 hover:border-cyan-400"
  },
  {
    name: "agentic-awesome-skills (Tool Hijack)",
    target: "https://github.com/sickn33/agentic-awesome-skills",
    type: "repository",
    tag: "CVE-2024-43485",
    icon: <Bot className="w-3 h-3 text-amber-400" />,
    badgeColor: "border-amber-500/40 bg-amber-950/30 text-amber-300 hover:border-amber-400"
  },
  {
    name: "auth-gateway (JWT RCE)",
    target: "https://github.com/auth-org/core-auth-service",
    type: "repository",
    tag: "CVE-2022-23529",
    icon: <Flame className="w-3 h-3 text-red-400" />,
    badgeColor: "border-red-500/40 bg-red-950/30 text-red-300 hover:border-red-400"
  },
  {
    name: "log-pipeline (Log4Shell)",
    target: "https://github.com/apache/log-audit-pipeline",
    type: "repository",
    tag: "CVE-2021-44228",
    icon: <Flame className="w-3 h-3 text-purple-400" />,
    badgeColor: "border-purple-500/40 bg-purple-950/30 text-purple-300 hover:border-purple-400"
  },
  {
    name: "config-engine (Proto Pollution)",
    target: "https://github.com/api-core/express-config-engine",
    type: "repository",
    tag: "CVE-2019-10744",
    icon: <Radio className="w-3 h-3 text-blue-400" />,
    badgeColor: "border-blue-500/40 bg-blue-950/30 text-blue-300 hover:border-blue-400"
  },
  {
    name: "tls-gateway (Heartbleed)",
    target: "https://github.com/infra/secure-tls-gateway",
    type: "repository",
    tag: "CVE-2014-0160",
    icon: <ShieldCheck className="w-3 h-3 text-emerald-400" />,
    badgeColor: "border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:border-emerald-400"
  }
];

export const TargetInput: React.FC<TargetInputProps> = ({
  onAnalyze,
  loading,
  initialTarget = "https://github.com/garrytan/gstack"
}) => {
  const [target, setTarget] = useState(initialTarget);
  const [targetType, setTargetType] = useState("repository");
  const [depth, setDepth] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!target.trim() || loading) return;
    onAnalyze(target.trim(), targetType, depth);
  };

  const handleSelectPreset = (presetTarget: string, type: string) => {
    setTarget(presetTarget);
    setTargetType(type);
    onAnalyze(presetTarget, type, depth);
  };

  return (
    <div className="w-full glass-panel border-b border-white/10 px-6 py-3 space-y-2.5 z-30">
      {/* Search & Configuration Bar */}
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
        {/* Target Input */}
        <div className="relative flex-1 min-w-[280px]">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 text-cyan-400" />
          </div>
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Enter Target GitHub URL, Local Project Path, or Package Name..."
            disabled={loading}
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs text-slate-100 placeholder-slate-500 font-mono outline-none"
          />
        </div>

        {/* Scan Type Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl glass-panel border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setTargetType("repository")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              targetType === "repository"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Repo
          </button>
          <button
            type="button"
            onClick={() => setTargetType("ast")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              targetType === "ast"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Local AST
          </button>
          <button
            type="button"
            onClick={() => setTargetType("package")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              targetType === "package"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Package
          </button>
        </div>

        {/* Traversal Depth */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel border border-white/10 text-xs text-slate-300 font-mono">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 text-[10px]">DEPTH:</span>
          <select
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="bg-transparent border-none text-cyan-300 font-bold outline-none cursor-pointer"
          >
            <option value={2} className="bg-slate-900">2-Hop</option>
            <option value={3} className="bg-slate-900">3-Hop</option>
            <option value={4} className="bg-slate-900">4-Hop</option>
            <option value={5} className="bg-slate-900">5-Hop</option>
          </select>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading || !target.trim()}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Traversing Graph...</span>
            </>
          ) : (
            <>
              <Crosshair className="w-4 h-4" />
              <span>Map Attack Graph</span>
            </>
          )}
        </button>
      </form>

      {/* Preset Scenarios Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[10px] text-slate-400 font-mono shrink-0 uppercase">Preset Attack Targets:</span>
        {PRESET_TARGETS.map((preset) => {
          const isSelected = target === preset.target;
          return (
            <button
              key={preset.name}
              onClick={() => handleSelectPreset(preset.target, preset.type)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                preset.badgeColor
              } ${isSelected ? "ring-1 ring-white/30 font-bold" : "opacity-85"}`}
            >
              {preset.icon}
              <span>{preset.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
