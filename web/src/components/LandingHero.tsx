"use client";

import React from "react";
import { ArrowRight, ShieldAlert, Sparkles, Terminal, Activity, Zap, Cpu } from "lucide-react";

interface LandingHeroProps {
  onExploreSandbox: () => void;
  onSelectScenario: (target: string, type: string) => void;
  onOpenRemediation: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onExploreSandbox,
  onSelectScenario,
  onOpenRemediation,
}) => {
  return (
    <section className="relative z-10 mx-auto flex min-h-[82vh] max-w-6xl flex-col items-center justify-center px-4 pt-12 pb-16 text-center sm:min-h-[86vh] sm:pt-20">
      {/* Dynamic Luminous Announcement Pill */}
      <div className="inline-flex items-center gap-2.5 rounded-full border border-cyan-500/30 bg-cyan-950/30 px-4 py-1.5 text-xs font-medium text-cyan-300 backdrop-blur-md transition-all hover:border-cyan-400 hover:bg-cyan-900/40 hover:shadow-[0_0_20px_rgba(0,240,255,0.25)]">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
        </span>
        <span className="font-mono uppercase tracking-widest text-[11px] font-semibold text-cyan-200">
          GraphRAG Core v2.4 • Multi-Hop Attack Cartography
        </span>
        <span className="text-cyan-400 font-mono text-[10px]">→</span>
      </div>

      {/* Hero Headline with Radiant Glow */}
      <h1 className="mt-8 font-sans text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-[1.08]">
        <span>Map the </span>
        <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(0,240,255,0.3)]">
          Invisible Attack Surface
        </span>
        <br />
        <span className="text-slate-100">Before Adversaries Do.</span>
      </h1>

      {/* Subtitle with High-Contrast Typography */}
      <p className="mt-6 max-w-2xl text-balance text-base leading-relaxed text-slate-300 sm:text-lg">
        Vestigium extracts call-sites, transitive dependencies, CVE blast radiuses, and crown-jewel assets into an interactive knowledge graph powered by autonomous GraphRAG intelligence.
      </p>

      {/* Action CTA Buttons */}
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <button
          onClick={onExploreSandbox}
          className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-3.5 text-sm font-bold text-slate-950 shadow-[0_0_30px_rgba(0,240,255,0.35)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_45px_rgba(0,240,255,0.55)] cursor-pointer"
        >
          <span className="relative z-10 flex items-center gap-2 text-slate-950 font-bold">
            <Zap className="w-4 h-4 fill-slate-950" />
            Launch Live Sandbox
          </span>
          <ArrowRight className="w-4 h-4 text-slate-950 transition-transform group-hover:translate-x-1" />
        </button>

        <button
          onClick={onOpenRemediation}
          className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-md transition-all hover:border-cyan-500/50 hover:bg-slate-800 hover:text-white hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>AI Self-Healing CI/CD Studio</span>
        </button>
      </div>

      {/* Preset Scenarios Ribbon */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-2 max-w-3xl">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" /> Live Scenarios:
        </span>
        <button
          onClick={() => onSelectScenario("https://github.com/auth0/auth-gateway", "repository")}
          className="rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-1.5 text-xs font-mono text-red-300 hover:border-red-400 hover:bg-red-900/30 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          JWT RCE (CVSS 9.8)
        </button>
        <button
          onClick={() => onSelectScenario("https://github.com/apache/log-pipeline", "repository")}
          className="rounded-lg border border-orange-500/30 bg-orange-950/20 px-3 py-1.5 text-xs font-mono text-orange-300 hover:border-orange-400 hover:bg-orange-900/30 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
          Log4Shell (CVSS 10.0)
        </button>
        <button
          onClick={() => onSelectScenario("https://github.com/lodash/config-engine", "repository")}
          className="rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-1.5 text-xs font-mono text-amber-300 hover:border-amber-400 hover:bg-amber-900/30 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Prototype Pollution (CVSS 9.1)
        </button>
        <button
          onClick={() => onSelectScenario("https://github.com/openssl/tls-gateway", "repository")}
          className="rounded-lg border border-purple-500/30 bg-purple-950/20 px-3 py-1.5 text-xs font-mono text-purple-300 hover:border-purple-400 hover:bg-purple-900/30 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
          Heartbleed Memory Leak
        </button>
      </div>

      {/* Telemetry Stats Bar */}
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-4xl w-full">
        <div className="glass-card p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center">
          <div className="flex items-center gap-1.5 text-red-400 text-xs font-mono mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>CRITICAL CVEs</span>
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight">10.0 CVSS</span>
          <span className="text-[11px] text-slate-400">Zero-Day Call-Site Detection</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center">
          <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-mono mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>TRAVERSAL SPEED</span>
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight">&lt; 120ms</span>
          <span className="text-[11px] text-slate-400">Multi-Hop Blast Radius</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center">
          <div className="flex items-center gap-1.5 text-purple-400 text-xs font-mono mb-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>CYPHER EXPORT</span>
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight">100% Neo4j</span>
          <span className="text-[11px] text-slate-400">Structured Batch Queries</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SELF-HEALING</span>
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight">One-Click</span>
          <span className="text-[11px] text-slate-400">Automated PR & Patching</span>
        </div>
      </div>
    </section>
  );
};
