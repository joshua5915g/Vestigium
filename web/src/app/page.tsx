"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "../components/Header";
import { CyberHero3D } from "../components/CyberHero3D";
import { LandingHero } from "../components/LandingHero";
import { EcosystemMarquee } from "../components/EcosystemMarquee";
import { AttackPathShowcase } from "../components/AttackPathShowcase";
import { FeatureBentoGrid } from "../components/FeatureBentoGrid";
import { TargetInput } from "../components/TargetInput";
import { GraphView } from "../components/GraphView";
import { GraphView3D } from "../components/GraphView3D";
import { NodeInspector } from "../components/NodeInspector";
import { ThreatReport } from "../components/ThreatReport";
import { GraphControls } from "../components/GraphControls";
import { RemediationModal } from "../components/RemediationModal";
import { AttackPathStepper } from "../components/AttackPathStepper";
import { ComplianceRadar } from "../components/ComplianceRadar";
import { SentinelRadar } from "../components/SentinelRadar";
import { DependencyScanPanel } from "../components/DependencyScanPanel";
import { Footer } from "../components/Footer";
import { fetchAnalysis } from "../lib/api";
import { AnalysisResponse, GraphNode } from "../lib/types";
import { AlertCircle, Zap, Flame, Award, Network } from "lucide-react";

const INITIAL_GROUPS = new Set([
  "repository",
  "function",
  "dependency",
  "cve",
  "exploit",
  "asset",
  "safe",
]);

export default function VestigiumApp() {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(true);
  const [isRemediationOpen, setIsRemediationOpen] = useState<boolean>(false);
  const [isStepperOpen, setIsStepperOpen] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<"graph" | "compliance">("graph");
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(INITIAL_GROUPS));
  const [currentTarget, setCurrentTarget] = useState<string>("https://github.com/garrytan/gstack");
  const [dimensionMode, setDimensionMode] = useState<"2D" | "3D">("3D");


  const sandboxRef = useRef<HTMLDivElement | null>(null);

  const runAnalysis = useCallback(
    async (target: string, targetType: string = "repository", depth: number = 3) => {
      setLoading(true);
      setError(null);
      setSelectedNode(null);
      setCurrentTarget(target);

      try {
        const result = await fetchAnalysis(target, targetType, depth);
        setAnalysis(result);
      } catch (err: unknown) {
        console.error("Analysis execution error:", err);
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to communicate with Vestigium backend. Ensure API is running on :8000.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Trigger default initial scan on mount
  useEffect(() => {
    runAnalysis("https://github.com/garrytan/gstack", "repository", 3);
  }, [runAnalysis]);

  const scrollToSandbox = () => {
    if (sandboxRef.current) {
      sandboxRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectScenario = (target: string, type: string = "repository") => {
    setCurrentTarget(target);
    runAnalysis(target, type, 3);
    scrollToSandbox();
  };

  const handleToggleFilter = (group: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  const handleResetFilters = () => {
    setActiveFilters(new Set(INITIAL_GROUPS));
  };

  return (
    <div className="min-h-screen w-full bg-[#05070d] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Sticky Glassmorphism Header with Navigation & Live Telemetry */}
      <Header
        summary={analysis?.summary}
        loading={loading}
        onOpenRemediation={() => setIsRemediationOpen(true)}
        onScrollToSandbox={scrollToSandbox}
      />

      {/* 1. Cinematic Hero Section with 3D Cyber Matrix Canvas */}
      <section id="overview" className="relative overflow-hidden">
        {/* 3D WebGL / Canvas Cyber Node Sphere */}
        <CyberHero3D />

        {/* Hero Content & CTA Actions */}
        <LandingHero
          onExploreSandbox={scrollToSandbox}
          onSelectScenario={handleSelectScenario}
          onOpenRemediation={() => setIsRemediationOpen(true)}
        />
      </section>

      {/* 2. Supported Ecosystem & Architecture Marquee */}
      <EcosystemMarquee />

      {/* 3. Multi-Hop Attack Path Showcase */}
      <section id="scenarios">
        <AttackPathShowcase onSelectAndAnalyze={handleSelectScenario} />
      </section>

      {/* 4. Live Interactive Cartographer Sandbox */}
      <section id="sandbox" ref={sandboxRef} className="relative z-10 mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/20 px-3.5 py-1 text-xs font-mono text-cyan-300">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>INTERACTIVE CARTOGRAPHY SANDBOX</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Live GraphRAG Knowledge Explorer
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Click any node to inspect blast radius, examine attack paths, or launch self-healing CI/CD remediation patches.
          </p>
        </div>

        {/* Live NVD Zero-Day Sentinel Threat Radar */}
        <div className="mb-4 rounded-xl overflow-hidden border border-cyan-500/30">
          <SentinelRadar
            onSelectTargetNode={(cveId) => {
              const node = analysis?.graph_data.nodes.find(
                (n) => n.id.toLowerCase().includes(cveId.toLowerCase()) || n.name.toLowerCase().includes(cveId.toLowerCase())
              );
              if (node) setSelectedNode(node);
            }}
          />
        </div>

        {/* Target Input & Scenario Switcher Bar */}
        <TargetInput
          onAnalyze={runAnalysis}
          loading={loading}
          initialTarget={currentTarget}
        />
        <DependencyScanPanel />

        {/* View Switcher Bar */}
        <div className="flex items-center justify-between mt-4 mb-2">
          <div className="flex items-center gap-2 p-1 bg-slate-900/80 border border-slate-800 rounded-xl backdrop-blur-md">
            <button
              onClick={() => setActiveView("graph")}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeView === "graph"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-950/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Network className="w-4 h-4 text-cyan-400" />
              <span>3D Spatial Cartography Graph</span>
            </button>

            <button
              onClick={() => setActiveView("compliance")}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeView === "compliance"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-950/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Award className="w-4 h-4 text-purple-400" />
              <span>Executive Compliance Radar (SOC2/NIST)</span>
            </button>
          </div>
        </div>

        {activeView === "compliance" ? (
          <div className="mt-4">
            <ComplianceRadar
              target={currentTarget}
              summary={analysis?.summary || null}
            />
          </div>
        ) : (
          /* Interactive Graph Canvas Window */
          <div className="relative w-full h-[680px] rounded-2xl overflow-hidden glass-panel-elevated border border-white/10 mt-2">
            {/* Red Team Attack Stepper Floating HUD Toggle */}
            <div className="absolute top-4 right-4 z-40">
              <button
                onClick={() => setIsStepperOpen(!isStepperOpen)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 backdrop-blur-md border transition-all duration-300 shadow-xl ${
                  isStepperOpen
                    ? "bg-red-500/20 text-red-300 border-red-500/50 shadow-red-950/50 scale-105"
                    : "bg-slate-900/80 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600"
                }`}
              >
                <Flame className={`w-4 h-4 ${isStepperOpen ? "text-red-400 animate-pulse" : "text-amber-400"}`} />
                <span>{isStepperOpen ? "Hide Red Team Stepper" : "Red Team Simulation HUD"}</span>
              </button>
            </div>


          {/* Error Notification Banner */}
          {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-950/90 border border-red-500 text-red-300 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-mono backdrop-blur-md">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Autonomous Attack Stepper HUD Overlay */}
          <div className="absolute top-16 left-4 z-40 max-w-md w-full">
            <AttackPathStepper
              target={currentTarget}
              graphNodes={analysis?.graph_data.nodes || []}
              onSelectNode={(node) => setSelectedNode(node)}
              isOpen={isStepperOpen}
              onClose={() => setIsStepperOpen(false)}
            />
          </div>

          {/* Force Graph Canvas (2D or 3D WebGL Spatial) */}
          {analysis?.graph_data ? (
            dimensionMode === "3D" ? (
              <GraphView3D
                data={analysis.graph_data}
                onNodeSelect={(node) => setSelectedNode(node)}
                selectedNode={selectedNode}
                activeFilters={activeFilters}
              />
            ) : (
              <GraphView
                data={analysis.graph_data}
                onNodeSelect={(node) => setSelectedNode(node)}
                selectedNode={selectedNode}
                activeFilters={activeFilters}
              />
            )
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-500 font-mono text-xs">
              <div className="w-8 h-8 border-2 border-cyan-500/40 border-t-cyan-400 rounded-full animate-spin"></div>
              <span>TRAVERSING KNOWLEDGE GRAPH TOPOLOGY...</span>
            </div>
          )}

          {/* Selected Node Details Drawer */}
          <NodeInspector
            node={selectedNode}
            links={analysis?.graph_data.links || []}
            allNodes={analysis?.graph_data.nodes || []}
            onClose={() => setSelectedNode(null)}
            onSelectNode={(node) => setSelectedNode(node)}
            onOpenRemediation={() => setIsRemediationOpen(true)}
          />

          {/* Layer Visibility Filter & 2D/3D Mode Selector */}
          <GraphControls
            activeFilters={activeFilters}
            onToggleFilter={handleToggleFilter}
            onResetFilters={handleResetFilters}
            dimensionMode={dimensionMode}
            onToggleDimensionMode={setDimensionMode}
          />

          {/* Collapsible Threat Intelligence Report Panel */}
          {analysis?.report && (
            <ThreatReport
              reportMarkdown={analysis.report}
              target={analysis.target}
              isOpen={isReportOpen}
              onToggle={() => setIsReportOpen(!isReportOpen)}
              onOpenRemediation={() => setIsRemediationOpen(true)}
            />
          )}
        </div>
      )}

      </section>

      {/* 5. Cyber Architecture Bento Feature Grid */}
      <section id="architecture">
        <FeatureBentoGrid
          onOpenRemediation={() => setIsRemediationOpen(true)}
          onExploreSandbox={scrollToSandbox}
        />
      </section>

      {/* 6. AI Threat Synthesizer & Self-Healing CI/CD Studio Modal */}
      {analysis && (
        <RemediationModal
          isOpen={isRemediationOpen}
          onClose={() => setIsRemediationOpen(false)}
          target={analysis.target}
          graphData={analysis.graph_data}
        />
      )}

      {/* 7. Futuristic Footer */}
      <Footer />
    </div>
  );
}
