"use client";

import React, { useState, useEffect } from "react";
import { Radio, ArrowUpRight } from "lucide-react";

interface SentinelThreat {
  cve_id: string;
  title: string;
  cvss: number;
  severity: string;
  ecosystem: string;
  published: string;
  impacted_component: string;
}

interface SentinelRadarProps {
  onSelectTargetNode?: (nodeName: string) => void;
}

export const SentinelRadar: React.FC<SentinelRadarProps> = ({ onSelectTargetNode }) => {
  const [threats, setThreats] = useState<SentinelThreat[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    // Default Sentinel zero-day threat data
    setThreats([
      {
        cve_id: "CVE-2024-43485",
        title: "Gstack AI Agentic Tool Execution RCE",
        cvss: 9.8,
        severity: "CRITICAL",
        ecosystem: "npm / Node.js",
        published: "2024-09-18",
        impacted_component: "garrytan/gstack"
      },
      {
        cve_id: "CVE-2022-23529",
        title: "jsonwebtoken Insecure Key Algorithm Verification",
        cvss: 9.8,
        severity: "CRITICAL",
        ecosystem: "npm",
        published: "2022-12-21",
        impacted_component: "jsonwebtoken@8.5.1"
      },
      {
        cve_id: "CVE-2021-44228",
        title: "Apache Log4j2 Remote Code Execution (Log4Shell)",
        cvss: 10.0,
        severity: "CRITICAL",
        ecosystem: "Maven / Java",
        published: "2021-12-10",
        impacted_component: "log4j-core@2.14.1"
      },
      {
        cve_id: "CVE-2019-10744",
        title: "Lodash Prototype Pollution via defaultsDeep",
        cvss: 9.1,
        severity: "CRITICAL",
        ecosystem: "npm",
        published: "2019-07-02",
        impacted_component: "lodash@4.17.15"
      }
    ]);
  }, []);

  // Auto-scroll ticker every 4 seconds
  useEffect(() => {
    if (threats.length === 0) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % threats.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [threats.length]);

  const activeThreat = threats[activeIdx];

  return (
    <div className="w-full bg-slate-950/90 backdrop-blur-md border-t border-b border-cyan-500/20 py-2.5 px-6 font-mono text-xs flex flex-wrap items-center justify-between gap-3 text-slate-300">
      {/* Radar Status Badge */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="relative flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping absolute opacity-75"></div>
          <Radio className="w-4 h-4 text-cyan-400 relative z-10" />
        </div>
        <span className="font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
          Vestigium Sentinel
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30">
            NVD Zero-Day Radar
          </span>
        </span>
      </div>

      {/* Live Scrolling Ticker */}
      {activeThreat && (
        <div className="flex-1 flex items-center gap-3 overflow-hidden min-w-[280px]">
          <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-500/40 text-[10px] font-bold shrink-0 animate-pulse">
            {activeThreat.cve_id}
          </span>
          <span className="text-slate-200 truncate font-sans text-xs">
            <strong>{activeThreat.title}</strong> — Impacting <code className="text-amber-300 font-mono">{activeThreat.impacted_component}</code>
          </span>
          <span className="text-rose-400 font-bold text-[11px] shrink-0">
            CVSS {activeThreat.cvss}
          </span>
        </div>
      )}

      {/* Action CTA */}
      {activeThreat && onSelectTargetNode && (
        <button
          onClick={() => onSelectTargetNode(activeThreat.cve_id)}
          className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer shrink-0"
        >
          <span>Highlight Node</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
