"use client";

import React from "react";
import { Sparkles, Database, GitPullRequest, Cpu, ShieldCheck, Network, Layers } from "lucide-react";

interface FeatureBentoGridProps {
  onOpenRemediation: () => void;
  onExploreSandbox: () => void;
}

export const FeatureBentoGrid: React.FC<FeatureBentoGridProps> = ({
  onOpenRemediation,
  onExploreSandbox,
}) => {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4 py-16">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/20 px-3.5 py-1 text-xs font-mono text-cyan-300">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>CYBER ARCHITECTURE</span>
        </div>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Engineered for Enterprise Graph Intelligence
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-slate-400">
          Move beyond static CVE scanners. Vestigium constructs complete semantic attack graphs with deterministic Cypher generation and self-healing patches.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
        {/* Large Card 1: GraphRAG Traversal Engine */}
        <div className="glass-card md:col-span-2 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-500"></div>
          
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <Network className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight mb-2">
              Autonomous GraphRAG Traversal
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Connects the dots between entrypoint web routes, AST execution call-sites, and distant transitive libraries to compute reachable blast radiuses.
            </p>
          </div>

          {/* Interactive Code / Graph Preview Mock */}
          <div className="rounded-xl border border-white/10 bg-slate-950/80 p-3 font-mono text-xs text-slate-300">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-[10px] text-slate-500">
              <span>TRAVERSAL_QUERY.py</span>
              <span className="text-cyan-400">STATUS: REASONING</span>
            </div>
            <p className="text-emerald-400">$ vestigium trace --repo &quot;auth-gateway&quot; --depth 3</p>
            <p className="text-slate-400 mt-1">Found 14 Nodes, 18 Links • High Blast Radius (CVSS 9.8)</p>
            <p className="text-red-400 mt-0.5">↳ Route: /auth/v1/token -&gt; jsonwebtoken@8.5.1 -&gt; CVE-2022-23529</p>
          </div>
        </div>

        {/* Medium Card 2: Neo4j Cypher Export */}
        <div className="glass-card md:col-span-1 lg:col-span-2 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-all duration-500"></div>
          
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight mb-2">
              Neo4j Cypher Generator
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Export battle-ready Cypher queries with strict node constraints and relationship indices ready for graph database ingestion.
            </p>
          </div>

          <div className="rounded-xl border border-purple-500/20 bg-slate-950/80 p-3 font-mono text-xs text-purple-300">
            <code>CREATE (:CVE &#123;id: &quot;CVE-2021-44228&quot;, cvss: 10.0&#125;)-[:EXPLOITS]-&gt;(:Asset &#123;name: &quot;K8s Secret&quot;&#125;);</code>
          </div>
        </div>

        {/* Medium Card 3: AI Self-Healing Studio */}
        <div className="glass-card md:col-span-2 lg:col-span-2 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500"></div>

          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight mb-2">
              AI Self-Healing CI/CD Studio
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Synthesize precision patches, calculate confidence scores, and preview unified git diffs ready for immediate deployment.
            </p>
          </div>

          <button
            onClick={onOpenRemediation}
            className="w-fit inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-4 py-2 text-xs font-mono text-emerald-300 hover:bg-emerald-500/30 transition-all cursor-pointer"
          >
            <GitPullRequest className="w-3.5 h-3.5" />
            <span>Open Remediation Studio →</span>
          </button>
        </div>

        {/* Card 4: 100% Deterministic Extraction */}
        <div className="glass-card md:col-span-1 lg:col-span-2 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all duration-500"></div>

          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight mb-2">
              Structured Pydantic Schemas
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Guaranteed schema validation with structured outputs prevents AI hallucinations and produces production-grade vulnerability graphs.
            </p>
          </div>

          <button
            onClick={onExploreSandbox}
            className="w-fit inline-flex items-center gap-2 rounded-lg bg-blue-500/20 border border-blue-500/40 px-4 py-2 text-xs font-mono text-blue-300 hover:bg-blue-500/30 transition-all cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Explore In Sandbox →</span>
          </button>
        </div>
      </div>
    </section>
  );
};
