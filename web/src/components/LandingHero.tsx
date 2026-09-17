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
      {/* Dynamic Luminous Announcement Pill (Obsidian Magma) */}
      <div className="inline-flex items-center gap-2.5 rounded-full border border-[#ff5a1f]/40 bg-[#ff5a1f]/10 px-4 py-1.5 text-xs font-medium text-[#ff8a50] backdrop-blur-md transition-all hover:border-[#ff5a1f] hover:bg-[#ff5a1f]/20 hover:shadow-[0_0_25px_rgba(255,90,31,0.35)]">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff5a1f] opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff5a1f]"></span>
        </span>
        <span className="font-mono uppercase tracking-widest text-[11px] font-semibold text-[#f5efe9]">
          GraphRAG Core v2.4 • Obsidian Magma Edition
        </span>
        <span className="text-[#ff5a1f] font-mono text-[10px]">→</span>
      </div>

      {/* Hero Headline with Magma Radiant Glow */}
      <h1 className="mt-8 font-sans text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-[1.08]">
        <span>Map the </span>
        <span className="bg-gradient-to-r from-[#ff5a1f] via-[#ff8a50] to-[#f5efe9] bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(255,90,31,0.45)]">
          Invisible Attack Surface
        </span>
        <br />
        <span className="text-[#f5efe9]">Before Adversaries Do.</span>
      </h1>

      {/* Subtitle with High-Contrast Warm Typography */}
      <p className="mt-6 max-w-2xl text-balance text-base leading-relaxed text-[#f5efe9]/80 sm:text-lg">
        Vestigium extracts call-sites, transitive dependencies, CVE blast radiuses, and crown-jewel assets into an interactive knowledge graph powered by autonomous GraphRAG intelligence.
      </p>

      {/* Action CTA Buttons */}
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <button
          onClick={onExploreSandbox}
          className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-[#ff5a1f] via-[#ff6b2b] to-[#e63900] px-7 py-3.5 text-sm font-bold text-white shadow-[0_0_35px_rgba(255,90,31,0.45)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_55px_rgba(255,90,31,0.7)] cursor-pointer"
        >
          <span className="relative z-10 flex items-center gap-2 text-white font-bold">
            <Zap className="w-4 h-4 fill-white" />
            Launch Live Sandbox
          </span>
          <ArrowRight className="w-4 h-4 text-white transition-transform group-hover:translate-x-1" />
        </button>

        <button
          onClick={onOpenRemediation}
          className="inline-flex items-center gap-2 rounded-full border border-[#ff5a1f]/30 bg-[#140604]/85 px-6 py-3.5 text-sm font-semibold text-[#f5efe9] backdrop-blur-md transition-all hover:border-[#ff5a1f] hover:bg-[#230e0a] hover:shadow-[0_0_25px_rgba(255,90,31,0.25)] cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#ff5a1f]" />
          <span>AI Self-Healing CI/CD Studio</span>
        </button>
      </div>

      {/* Preset Scenarios Ribbon */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-2 max-w-3xl">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#f5efe9]/60 mr-2 flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-[#ff5a1f]" /> Live Scenarios:
        </span>
        <button
          onClick={() => onSelectScenario("https://github.com/auth0/auth-gateway", "repository")}
          className="rounded-lg border border-[#ff2a1f]/40 bg-[#2a0a04]/60 px-3 py-1.5 text-xs font-mono text-[#ff8a50] hover:border-[#ff5a1f] hover:bg-[#400e05] transition-all cursor-pointer flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff2a1f] animate-pulse"></span>
          JWT RCE (CVSS 9.8)
        </button>
        <button
          onClick={() => onSelectScenario("https://github.com/apache/log-pipeline", "repository")}
          className="rounded-lg border border-[#ff5a1f]/40 bg-[#230e0a]/60 px-3 py-1.5 text-xs font-mono text-[#ff8a50] hover:border-[#ff5a1f] hover:bg-[#400e05] transition-all cursor-pointer flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff5a1f]"></span>
          Log4Shell (CVSS 10.0)
        </button>
        <button
          onClick={() => onSelectScenario("https://github.com/lodash/config-engine", "repository")}
          className="rounded-lg border border-amber-500/40 bg-amber-950/30 px-3 py-1.5 text-xs font-mono text-amber-300 hover:border-amber-400 hover:bg-amber-900/40 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Prototype Pollution (CVSS 9.1)
        </button>
        <button
          onClick={() => onSelectScenario("https://github.com/openssl/tls-gateway", "repository")}
          className="rounded-lg border border-purple-500/40 bg-purple-950/30 px-3 py-1.5 text-xs font-mono text-purple-300 hover:border-purple-400 hover:bg-purple-900/40 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
          Heartbleed Memory Leak
        </button>
      </div>

      {/* Telemetry Stats Bar */}
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-4xl w-full">
        <div className="glass-card p-4 rounded-xl border border-[#ff5a1f]/15 flex flex-col items-center justify-center">
          <div className="flex items-center gap-1.5 text-[#ff2a1f] text-xs font-mono mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>CRITICAL CVEs</span>
          </div>
          <span className="text-2xl font-extrabold text-[#f5efe9] tracking-tight">10.0 CVSS</span>
          <span className="text-[11px] text-[#f5efe9]/60">Zero-Day Call-Site Detection</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-[#ff5a1f]/15 flex flex-col items-center justify-center">
          <div className="flex items-center gap-1.5 text-[#ff5a1f] text-xs font-mono mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>TRAVERSAL SPEED</span>
          </div>
          <span className="text-2xl font-extrabold text-[#f5efe9] tracking-tight">&lt; 120ms</span>
          <span className="text-[11px] text-[#f5efe9]/60">Multi-Hop Blast Radius</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-[#ff5a1f]/15 flex flex-col items-center justify-center">
          <div className="flex items-center gap-1.5 text-[#d946ef] text-xs font-mono mb-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>CYPHER EXPORT</span>
          </div>
          <span className="text-2xl font-extrabold text-[#f5efe9] tracking-tight">100% Neo4j</span>
          <span className="text-[11px] text-[#f5efe9]/60">Structured Batch Queries</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-[#ff5a1f]/15 flex flex-col items-center justify-center">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SELF-HEALING</span>
          </div>
          <span className="text-2xl font-extrabold text-[#f5efe9] tracking-tight">One-Click</span>
          <span className="text-[11px] text-[#f5efe9]/60">Automated PR &amp; Patching</span>
        </div>
      </div>
    </section>
  );
};

