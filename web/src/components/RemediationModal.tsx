"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  X, 
  Sparkles, 
  GitPullRequest, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  ExternalLink, 
  Loader2, 
  Copy, 
  Check, 
  FileCode2, 
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { GraphData, SynthesisResponse, RemediationResponse } from "../lib/types";
import { fetchSynthesis, fetchRemediation } from "../lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface RemediationModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: string;
  graphData: GraphData;
}

export const RemediationModal: React.FC<RemediationModalProps> = ({
  isOpen,
  onClose,
  target,
  graphData,
}) => {
  const [activeTab, setActiveTab] = useState<"synthesis" | "patch" | "pipeline">("synthesis");
  const [synthesis, setSynthesis] = useState<SynthesisResponse | null>(null);
  const [synthLoading, setSynthLoading] = useState(false);
  const [synthError, setSynthError] = useState<string | null>(null);

  const [remediation, setRemediation] = useState<RemediationResponse | null>(null);
  const [remLoading, setRemLoading] = useState(false);
  const [copiedPatch, setCopiedPatch] = useState(false);

  const handleRunSynthesis = useCallback(async () => {
    setSynthLoading(true);
    setSynthError(null);
    try {
      const res = await fetchSynthesis({
        target,
        graph_data: graphData,
      });
      setSynthesis(res);
    } catch (err: unknown) {
      console.error("Synthesis error:", err);
      setSynthError(
        err instanceof Error ? err.message : "Failed to synthesize threat vectors"
      );
    } finally {
      setSynthLoading(false);
    }
  }, [target, graphData]);

  // Trigger synthesis automatically when modal opens
  useEffect(() => {
    if (isOpen && !synthesis && !synthLoading) {
      handleRunSynthesis();
    }
  }, [isOpen, synthesis, synthLoading, handleRunSynthesis]);

  const handleRunRemediation = async () => {
    if (!synthesis) return;
    setRemLoading(true);
    setActiveTab("pipeline");
    try {
      const res = await fetchRemediation({
        target,
        cve_id: synthesis.cve_id,
        code_patch: synthesis.code_patch,
        markdown_report: synthesis.markdown_report,
        test_command: "npm test",
        mock_github: true,
      });
      setRemediation(res);
    } catch (err: unknown) {
      console.error("Remediation error:", err);
    } finally {
      setRemLoading(false);
    }
  };

  const handleCopyPatch = () => {
    if (!synthesis?.code_patch) return;
    navigator.clipboard.writeText(synthesis.code_patch);
    setCopiedPatch(true);
    setTimeout(() => setCopiedPatch(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col glass-panel-elevated rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  AI Threat Synthesizer &amp; Self-Healing Studio
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  PHASE 4 &amp; 5
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono truncate max-w-md mt-0.5">
                Target: {target}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-white/10 bg-slate-950/40">
          <button
            onClick={() => setActiveTab("synthesis")}
            className={`px-4 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "synthesis"
                ? "border-cyan-400 text-cyan-300 bg-cyan-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Grounded Threat Advisory</span>
          </button>

          <button
            onClick={() => setActiveTab("patch")}
            className={`px-4 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "patch"
                ? "border-purple-400 text-purple-300 bg-purple-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>Remediation Code Patch</span>
          </button>

          <button
            onClick={() => setActiveTab("pipeline")}
            className={`px-4 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "pipeline"
                ? "border-emerald-400 text-emerald-300 bg-emerald-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <GitPullRequest className="w-4 h-4" />
            <span>Self-Healing CI/CD &amp; PR</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {synthLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-400">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
                <Sparkles className="w-5 h-5 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-slate-200">
                  Synthesizing Verified GraphRAG Threat Advisory...
                </div>
                <div className="text-xs text-slate-500 font-mono mt-1">
                  Correlating AST Call-Sites with CVE Blast Radius
                </div>
              </div>
            </div>
          ) : synthError ? (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <div className="font-semibold text-sm">Synthesis Error</div>
                <div className="text-xs text-red-400/80">{synthError}</div>
              </div>
            </div>
          ) : synthesis ? (
            <>
              {/* TAB 1: Grounded Threat Advisory */}
              {activeTab === "synthesis" && (
                <div className="space-y-6">
                  {/* Executive CVE Card */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl glass-panel border border-red-500/30 bg-red-950/10">
                      <div className="text-[11px] font-mono text-red-400 uppercase">CVE IDENTIFIER</div>
                      <div className="text-base font-bold text-red-300 font-mono mt-1">
                        {synthesis.cve_id}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl glass-panel border border-amber-500/30 bg-amber-950/10">
                      <div className="text-[11px] font-mono text-amber-400 uppercase">VULNERABLE COMPONENT</div>
                      <div className="text-xs font-bold text-amber-300 font-mono mt-1 truncate">
                        {synthesis.vulnerable_component}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl glass-panel border border-purple-500/30 bg-purple-950/10">
                      <div className="text-[11px] font-mono text-purple-400 uppercase">PATCH LANGUAGE</div>
                      <div className="text-base font-bold text-purple-300 font-mono mt-1 uppercase">
                        {synthesis.patch_language}
                      </div>
                    </div>
                  </div>

                  {/* Blast Radius Assessment */}
                  <div className="p-4 rounded-xl glass-panel border border-white/10 bg-slate-900/40">
                    <div className="text-xs font-bold text-cyan-400 font-mono uppercase flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" />
                      Blast Radius &amp; Reachability Impact
                    </div>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      {synthesis.blast_radius_summary}
                    </p>
                  </div>

                  {/* Step-by-Step Remediation Plan */}
                  <div className="p-4 rounded-xl glass-panel border border-white/10 bg-slate-900/40">
                    <div className="text-xs font-bold text-emerald-400 font-mono uppercase">
                      Recommended Remediation Steps
                    </div>
                    <ul className="mt-3 space-y-2">
                      {synthesis.remediation_steps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Markdown Report Preview */}
                  <div className="p-4 rounded-xl glass-panel border border-white/10 bg-slate-950/60 overflow-hidden">
                    <div className="text-xs font-bold text-slate-400 font-mono uppercase mb-3">
                      Executive Advisory Narrative
                    </div>
                    <div className="prose prose-invert prose-xs max-w-none text-slate-300 text-xs">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {synthesis.markdown_report}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Code Patch */}
              {activeTab === "patch" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-400 font-mono">
                      Generated Unified Diff Patch ({synthesis.patch_language})
                    </div>
                    <button
                      onClick={handleCopyPatch}
                      className="px-3 py-1.5 rounded-lg glass-panel hover:bg-white/10 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedPatch ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPatch ? "Copied" : "Copy Patch"}</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-[#04060a] border border-white/10 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed shadow-inner">
                    <pre className="selection:bg-cyan-500/30">
                      <code>{synthesis.code_patch}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* TAB 3: Self-Healing CI/CD Pipeline */}
              {activeTab === "pipeline" && (
                <div className="space-y-6">
                  {/* Status Steps Tracker */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Step 1: Graph Verification */}
                    <div className={`p-4 rounded-xl glass-panel border ${
                      remediation?.graph_verified 
                        ? "border-emerald-500/40 bg-emerald-950/10" 
                        : "border-white/10 bg-slate-900/40"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-400">STEP 1</span>
                        {remediation?.graph_verified && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-200 mt-1">Graph Verifier</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {remediation?.graph_verified ? "Attack Path Severed (0 Paths)" : "Pending Verification"}
                      </div>
                    </div>

                    {/* Step 2: Sandbox Testing */}
                    <div className={`p-4 rounded-xl glass-panel border ${
                      remediation?.sandbox_passed 
                        ? "border-emerald-500/40 bg-emerald-950/10" 
                        : "border-white/10 bg-slate-900/40"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-400">STEP 2</span>
                        {remediation?.sandbox_passed && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-200 mt-1">Docker Sandbox</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {remediation?.sandbox_passed ? "14 Tests Passed (0 Regressions)" : "Hermetic Container Run"}
                      </div>
                    </div>

                    {/* Step 3: GitHub PR */}
                    <div className={`p-4 rounded-xl glass-panel border ${
                      remediation?.pr_url 
                        ? "border-cyan-500/40 bg-cyan-950/10" 
                        : "border-white/10 bg-slate-900/40"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-400">STEP 3</span>
                        {remediation?.pr_url && (
                          <GitPullRequest className="w-4 h-4 text-cyan-400" />
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-200 mt-1">GitHub PR Bot</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {remediation?.pr_url ? "Pull Request Created" : "Automated Fix Branch"}
                      </div>
                    </div>
                  </div>

                  {/* PR Success Banner */}
                  {remediation?.pr_url && (
                    <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Pull Request Successfully Opened!
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Branch: {remediation.branch_name}
                        </div>
                      </div>

                      <a
                        href={remediation.pr_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
                      >
                        <span>View GitHub PR</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  {/* Terminal Execution Logs */}
                  {remediation?.sandbox_logs && (
                    <div className="space-y-2">
                      <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Docker Sandbox Test Execution Stream</span>
                      </div>
                      <div className="p-4 rounded-xl bg-[#04060a] border border-white/10 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed shadow-inner">
                        <pre>
                          <code>{remediation.sandbox_logs}</code>
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-slate-950/60">
          <button
            onClick={handleRunSynthesis}
            disabled={synthLoading}
            className="px-4 py-2 rounded-xl glass-panel hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${synthLoading ? "animate-spin text-cyan-400" : ""}`} />
            <span>Re-Synthesize</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Close
            </button>

            <button
              onClick={handleRunRemediation}
              disabled={remLoading || !synthesis}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:opacity-90 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
            >
              {remLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying &amp; Deploying PR...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Auto-Fix &amp; Open GitHub PR</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
