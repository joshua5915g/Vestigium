"use client";

import React from "react";
import { Shield, ArrowUp, GitFork } from "lucide-react";

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#04060a] py-12 px-4">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]">
            <Shield className="w-4 h-4 fill-slate-950" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              <span>VESTIGIUM</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                v2.4 Core
              </span>
            </div>
            <p className="text-xs text-slate-500">GraphRAG Attack-Surface Cartographer</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            CYBER INTELLIGENCE ENGINE ONLINE
          </span>
          <span className="hidden sm:inline text-slate-700">|</span>
          <a
            href="https://github.com/garrytan/gstack"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-300 transition-colors flex items-center gap-1.5"
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Repository Telemetry</span>
          </a>
        </div>

        <button
          onClick={scrollToTop}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-xs font-mono text-slate-300 hover:border-cyan-500/40 hover:text-white transition-all cursor-pointer"
        >
          <span>Back to Top</span>
          <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
        </button>
      </div>
    </footer>
  );
};

