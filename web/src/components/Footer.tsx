"use client";

import React from "react";
import { Shield, ArrowUp, GitFork } from "lucide-react";

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative z-10 border-t border-[#ff5a1f]/20 bg-[#050302] py-12 px-4">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff5a1f] to-[#ff2a1f] flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(255,90,31,0.45)]">
            <Shield className="w-4 h-4 fill-white" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-[#f5efe9] flex items-center gap-2">
              <span>VESTIGIUM</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#ff5a1f]/20 text-[#ff8a50] border border-[#ff5a1f]/40">
                MAGMA // v2.4
              </span>
            </div>
            <p className="text-xs text-[#f5efe9]/50">GraphRAG Attack-Surface Cartographer</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-[#f5efe9]/60 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ff5a1f] animate-pulse"></span>
            CYBER INTELLIGENCE ENGINE ONLINE
          </span>
          <span className="hidden sm:inline text-[#571708]">|</span>
          <a
            href="https://github.com/garrytan/gstack"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#ff8a50] transition-colors flex items-center gap-1.5"
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Repository Telemetry</span>
          </a>
        </div>

        <button
          onClick={scrollToTop}
          className="flex items-center gap-2 rounded-full border border-[#ff5a1f]/25 bg-[#140604] px-4 py-2 text-xs font-mono text-[#f5efe9]/80 hover:border-[#ff5a1f] hover:text-[#ff8a50] transition-all cursor-pointer shadow-[0_0_10px_rgba(255,90,31,0.2)]"
        >
          <span>Back to Top</span>
          <ArrowUp className="w-3.5 h-3.5 text-[#ff5a1f]" />
        </button>
      </div>
    </footer>
  );
};


