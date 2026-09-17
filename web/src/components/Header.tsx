"use client";

import React from "react";
import { 
  ShieldAlert, 
  Activity, 
  GitFork, 
  AlertTriangle, 
  Terminal, 
  Cpu, 
  Sparkles,
  Zap
} from "lucide-react";
import { AnalysisSummary } from "../lib/types";

interface HeaderProps {
  summary?: AnalysisSummary | null;
  loading?: boolean;
  onOpenRemediation?: () => void;
  onScrollToSandbox?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  summary, 
  loading,
  onOpenRemediation,
  onScrollToSandbox,
}) => {
  const getRiskBadge = (score: number) => {
    if (score >= 9.0) {
      return {
        label: "CRITICAL",
        bg: "bg-red-500/10 border-red-500/40 text-red-400",
        glow: "shadow-[0_0_15px_rgba(255,51,102,0.25)]"
      };
    }
    if (score >= 7.0) {
      return {
        label: "HIGH",
        bg: "bg-amber-500/10 border-amber-500/40 text-amber-400",
        glow: "shadow-[0_0_15px_rgba(245,158,11,0.25)]"
      };
    }
    if (score >= 4.0) {
      return {
        label: "MEDIUM",
        bg: "bg-yellow-500/10 border-yellow-500/40 text-yellow-400",
        glow: "shadow-[0_0_15px_rgba(234,179,8,0.25)]"
      };
    }
    return {
      label: "SECURE",
      bg: "bg-emerald-500/10 border-emerald-500/40 text-emerald-400",
      glow: "shadow-[0_0_15px_rgba(16,185,129,0.25)]"
    };
  };

  const risk = summary ? getRiskBadge(summary.risk_score) : null;

  return (
    <header className="w-full glass-panel-elevated border-b border-white/10 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 transition-all duration-300">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <a href="#overview" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff5a1f] to-[#ff2a1f] border border-[#ff8a50]/50 shadow-[0_0_20px_rgba(255,90,31,0.35)] transition-transform group-hover:scale-105">
            <Terminal className="w-4 h-4 text-white font-bold" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff5a1f] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff5a1f]"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold tracking-tight text-[#f5efe9] group-hover:text-[#ff8a50] transition-colors">
                VESTIGIUM
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#ff5a1f]/15 border border-[#ff5a1f]/30 text-[#ff8a50] font-mono font-bold tracking-wider">
                MAGMA // v2.4
              </span>
            </div>
            <p className="text-[10.5px] text-[#f5efe9]/60 tracking-normal font-sans">
              GraphRAG Threat Cartographer
            </p>
          </div>
        </a>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 ml-6 border-l border-white/10 pl-6 text-xs text-[#f5efe9]/60 font-medium">
          <a href="#overview" className="px-3 py-1.5 rounded-full hover:text-[#f5efe9] hover:bg-white/5 transition-all">
            Overview
          </a>
          <a href="#sandbox" className="px-3 py-1.5 rounded-full hover:text-[#ff8a50] hover:bg-[#ff5a1f]/10 transition-all">
            Live Sandbox
          </a>
          <a href="#scenarios" className="px-3 py-1.5 rounded-full hover:text-[#f5efe9] hover:bg-white/5 transition-all">
            Attack Vectors
          </a>
          <a href="#architecture" className="px-3 py-1.5 rounded-full hover:text-[#f5efe9] hover:bg-white/5 transition-all">
            Architecture
          </a>
        </nav>
      </div>

      {/* Telemetry & Threat Metrics */}
      <div className="flex items-center gap-2 sm:gap-3">
        {summary ? (
          <>
            {/* Nodes Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-panel border border-white/10">
              <Activity className="w-3 h-3 text-[#ff5a1f]" />
              <div className="text-[11px] font-mono">
                <span className="text-[#f5efe9]/60">Nodes: </span>
                <span className="font-bold text-[#f5efe9]">{summary.total_nodes}</span>
              </div>
            </div>

            {/* Vectors Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-panel border border-white/10">
              <GitFork className="w-3 h-3 text-[#ff8a50]" />
              <div className="text-[11px] font-mono">
                <span className="text-[#f5efe9]/60">Vectors: </span>
                <span className="font-bold text-[#f5efe9]">{summary.total_links}</span>
              </div>
            </div>

            {/* Critical CVEs Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-panel border border-[#ff2a1f]/30 bg-[#2a0a04]/40">
              <ShieldAlert className="w-3 h-3 text-[#ff2a1f]" />
              <div className="text-[11px] font-mono">
                <span className="text-[#ff8a50]">CVEs: </span>
                <span className="font-bold text-[#ff2a1f]">{summary.critical_cves}</span>
              </div>
            </div>

            {/* Risk Index Meter */}
            {risk && (
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border ${risk.bg} ${risk.glow}`}>
                <AlertTriangle className="w-3 h-3" />
                <div className="text-[11px] font-mono font-bold">
                  {summary.risk_score.toFixed(1)} / 10
                </div>
              </div>
            )}

            {/* AI Remediation Studio CTA */}
            {onOpenRemediation && (
              <button
                onClick={onOpenRemediation}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#ff5a1f] via-[#ff6b2b] to-[#e63900] hover:opacity-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_20px_rgba(255,90,31,0.4)] cursor-pointer"
                title="Open AI Threat Synthesis & CI/CD Studio"
              >
                <Sparkles className="w-3.5 h-3.5 fill-white text-white" />
                <span>AI Fix</span>
              </button>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 text-xs text-[#f5efe9]/60 font-mono px-3 py-1 rounded-lg glass-panel border border-white/10">
            <Cpu className={`w-3.5 h-3.5 ${loading ? "text-[#ff5a1f] animate-spin" : "text-emerald-400"}`} />
            <span>{loading ? "TRAVERSING GRAPH..." : "CARTOGRAPHY ONLINE"}</span>
          </div>
        )}

        {/* Quick Jump to Sandbox Button */}
        {onScrollToSandbox && (
          <button
            onClick={onScrollToSandbox}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[#ff5a1f]/40 bg-[#ff5a1f]/15 px-3 py-1.5 text-xs font-mono font-semibold text-[#ff8a50] hover:bg-[#ff5a1f]/25 hover:border-[#ff5a1f] transition-all cursor-pointer shadow-[0_0_15px_rgba(255,90,31,0.2)]"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Sandbox</span>
          </button>
        )}
      </div>
    </header>
  );
};
