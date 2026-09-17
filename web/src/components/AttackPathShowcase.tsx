"use client";

import React, { useState } from "react";
import { GitBranch, Code2, Package, ShieldAlert, Zap, Database, ArrowRight } from "lucide-react";

interface StepNode {
  step: string;
  type: string;
  title: string;
  detail: string;
  color: string;
  icon: React.ElementType;
  badge: string;
}

const SCENARIOS_DATA: Record<string, { name: string; cvss: number; target: string; steps: StepNode[] }> = {
  jwt: {
    name: "auth-gateway (JWT RCE)",
    cvss: 9.8,
    target: "https://github.com/auth0/auth-gateway",
    steps: [
      {
        step: "01",
        type: "repository",
        title: "auth-gateway",
        detail: "Target API authentication perimeter with exposed OAuth routes.",
        color: "#38bdf8",
        icon: GitBranch,
        badge: "Root Target",
      },
      {
        step: "02",
        type: "function",
        title: "verifyToken()",
        detail: "Entrypoint call-site passing untrusted payloads to verification routine.",
        color: "#60a5fa",
        icon: Code2,
        badge: "Call-Site",
      },
      {
        step: "03",
        type: "dependency",
        title: "jsonwebtoken@8.5.1",
        detail: "Vulnerable transitive library with arbitrary object key flaw.",
        color: "#fbbf24",
        icon: Package,
        badge: "Dependency",
      },
      {
        step: "04",
        type: "cve",
        title: "CVE-2022-23529",
        detail: "Insecure key parsing leading to Remote Code Execution via crafted payload.",
        color: "#ef4444",
        icon: ShieldAlert,
        badge: "CVSS 9.8",
      },
      {
        step: "05",
        type: "exploit",
        title: "Remote Code Execution",
        detail: "Adversary achieves server-side process control within container.",
        color: "#dc2626",
        icon: Zap,
        badge: "Exploit Vector",
      },
      {
        step: "06",
        type: "asset",
        title: "AWS IAM Secret Vault",
        detail: "Crown jewel asset compromised: production credentials & token keys exfiltrated.",
        color: "#a855f7",
        icon: Database,
        badge: "Crown Jewel",
      },
    ],
  },
  log4j: {
    name: "log-pipeline (Log4Shell)",
    cvss: 10.0,
    target: "https://github.com/apache/log-pipeline",
    steps: [
      {
        step: "01",
        type: "repository",
        title: "log-pipeline",
        detail: "High-throughput ingress logging microservice handling header streams.",
        color: "#38bdf8",
        icon: GitBranch,
        badge: "Root Target",
      },
      {
        step: "02",
        type: "function",
        title: "logEvent()",
        detail: "Directly evaluates user-controlled string formatted headers.",
        color: "#60a5fa",
        icon: Code2,
        badge: "Call-Site",
      },
      {
        step: "03",
        type: "dependency",
        title: "log4j-core@2.14.1",
        detail: "Java logging library performing unrestricted JNDI lookup lookups.",
        color: "#fbbf24",
        icon: Package,
        badge: "Dependency",
      },
      {
        step: "04",
        type: "cve",
        title: "CVE-2021-44228",
        detail: "Critical Log4Shell vulnerability allowing unauthenticated remote execution.",
        color: "#ef4444",
        icon: ShieldAlert,
        badge: "CVSS 10.0",
      },
      {
        step: "05",
        type: "exploit",
        title: "Remote JNDI Injection",
        detail: "Adversary fetches malicious LDAP payload executed by JVM runtime.",
        color: "#dc2626",
        icon: Zap,
        badge: "Exploit Vector",
      },
      {
        step: "06",
        type: "asset",
        title: "K8s Sovereign Token",
        detail: "Cluster service account secret extracted: total namespace compromise.",
        color: "#a855f7",
        icon: Database,
        badge: "Crown Jewel",
      },
    ],
  },
  proto: {
    name: "config-engine (Prototype Pollution)",
    cvss: 9.1,
    target: "https://github.com/lodash/config-engine",
    steps: [
      {
        step: "01",
        type: "repository",
        title: "config-engine",
        detail: "Dynamic multi-tenant configuration parser.",
        color: "#38bdf8",
        icon: GitBranch,
        badge: "Root Target",
      },
      {
        step: "02",
        type: "function",
        title: "mergeConfig()",
        detail: "Recursive deep merge on unvalidated JSON request payload.",
        color: "#60a5fa",
        icon: Code2,
        badge: "Call-Site",
      },
      {
        step: "03",
        type: "dependency",
        title: "lodash@4.17.15",
        detail: "Utility library with Object.prototype modification defect.",
        color: "#fbbf24",
        icon: Package,
        badge: "Dependency",
      },
      {
        step: "04",
        type: "cve",
        title: "CVE-2019-10744",
        detail: "Prototype pollution allowing property injection into standard prototypes.",
        color: "#ef4444",
        icon: ShieldAlert,
        badge: "CVSS 9.1",
      },
      {
        step: "05",
        type: "exploit",
        title: "Global Admin Escalation",
        detail: "Adversary injects `isAdmin=true` into default user prototype.",
        color: "#dc2626",
        icon: Zap,
        badge: "Exploit Vector",
      },
      {
        step: "06",
        type: "asset",
        title: "PostgreSQL Production DB",
        detail: "Full administrative read/write access to sensitive customer records.",
        color: "#a855f7",
        icon: Database,
        badge: "Crown Jewel",
      },
    ],
  },
};

interface AttackPathShowcaseProps {
  onSelectAndAnalyze: (target: string, type: string) => void;
}

export const AttackPathShowcase: React.FC<AttackPathShowcaseProps> = ({ onSelectAndAnalyze }) => {
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<string>("jwt");
  const activeScenario = SCENARIOS_DATA[selectedScenarioKey];

  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4 py-16">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#ff5a1f]/40 bg-[#2a0a04]/50 px-3.5 py-1 text-xs font-mono text-[#ff8a50]">
          <Zap className="w-3.5 h-3.5 text-[#ff5a1f]" />
          <span>MULTI-HOP GRAPH TRAVERSAL</span>
        </div>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#f5efe9] sm:text-4xl">
          Visual Attack Path Cartography
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-[#f5efe9]/70">
          Vestigium traces the full chain from entrypoint call-site to crown jewel asset, proving exploitability instead of just listing isolated packages.
        </p>

        {/* Scenario Switcher Tabs */}
        <div className="mt-6 inline-flex rounded-xl border border-[#ff5a1f]/25 bg-[#140604]/90 p-1 backdrop-blur-md">
          {Object.entries(SCENARIOS_DATA).map(([key, data]) => (
            <button
              key={key}
              onClick={() => setSelectedScenarioKey(key)}
              className={`rounded-lg px-4 py-2 text-xs font-mono transition-all cursor-pointer ${
                selectedScenarioKey === key
                  ? "bg-[#ff5a1f]/25 text-[#ff8a50] border border-[#ff5a1f]/50 shadow-[0_0_15px_rgba(255,90,31,0.3)]"
                  : "text-[#f5efe9]/60 hover:text-white"
              }`}
            >
              {data.name}
            </button>
          ))}
        </div>
      </div>

      {/* Step by Step Horizontal Visualizer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 items-stretch perspective-1000">
        {activeScenario.steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className="glass-card rounded-2xl p-4 flex flex-col justify-between relative group border border-white/10 hover:border-[#ff5a1f]/60 hover:shadow-[0_20px_40px_-15px_rgba(255,90,31,0.35)] transition-all duration-300 transform hover:-translate-y-2 hover:rotate-1 cursor-default"
            >
              {/* Dynamic Luminous Rim Glow on Hover */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${step.color}25, transparent 70%)`
                }}
              />

              {/* Step indicator */}
              <div className="flex items-center justify-between mb-3 relative z-10">
                <span className="font-mono text-[10px] text-[#f5efe9]/50 font-bold tracking-wider">
                  NODE // {step.step}
                </span>
                <span
                  className="text-[9.5px] font-mono px-2 py-0.5 rounded-full font-semibold border"
                  style={{
                    color: step.color,
                    borderColor: `${step.color}40`,
                    backgroundColor: `${step.color}15`,
                  }}
                >
                  {step.badge}
                </span>
              </div>

              {/* Icon & Title */}
              <div className="relative z-10">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 shadow-lg transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: `${step.color}20`,
                    color: step.color,
                    border: `1px solid ${step.color}50`,
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-[#f5efe9] tracking-tight mb-1 truncate group-hover:text-[#ff8a50] transition-colors">
                  {step.title}
                </h4>
                <p className="text-[11px] text-[#f5efe9]/60 leading-relaxed line-clamp-3">
                  {step.detail}
                </p>
              </div>

              {/* Arrow Connector on desktop */}
              {idx < activeScenario.steps.length - 1 && (
                <div className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-[#140604] border border-[#ff5a1f]/35 items-center justify-center text-slate-400 shadow-[0_0_10px_rgba(255,90,31,0.25)]">
                  <ArrowRight className="w-3.5 h-3.5 text-[#ff5a1f]" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Instant Traversal Trigger Callout */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between glass-panel p-5 rounded-2xl border border-[#ff5a1f]/25 bg-gradient-to-r from-[#2a0a04]/40 via-[#140604]/80 to-[#2a0a04]/40">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <div className="w-10 h-10 rounded-xl bg-[#ff2a1f]/20 border border-[#ff2a1f]/40 flex items-center justify-center text-[#ff2a1f] font-mono font-bold text-sm">
            {activeScenario.cvss}
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#f5efe9] flex items-center gap-2">
              Ready to verify {activeScenario.name}?
              <span className="text-xs text-[#ff2a1f] font-mono font-normal">CRITICAL SEVERITY</span>
            </h4>
            <p className="text-xs text-[#f5efe9]/60">
              Run autonomous 3-second GraphRAG traversal on this repository topology.
            </p>
          </div>
        </div>

        <button
          onClick={() => onSelectAndAnalyze(activeScenario.target, "repository")}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff5a1f] to-[#ff2a1f] px-5 py-2.5 text-xs font-bold text-white hover:opacity-95 transition-all shadow-[0_0_20px_rgba(255,90,31,0.4)] cursor-pointer shrink-0"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>Simulate Attack in Sandbox</span>
        </button>
      </div>
    </section>
  );
};
