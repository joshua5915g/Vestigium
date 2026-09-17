"use client";

import React from "react";
import { 
  X, 
  ShieldAlert, 
  Code2, 
  Package, 
  Skull, 
  Lock, 
  CheckCircle, 
  CornerDownRight,
  Sparkles
} from "lucide-react";
import { GraphNode, GraphLink } from "../lib/types";

interface NodeInspectorProps {
  node: GraphNode | null;
  links: GraphLink[];
  allNodes: GraphNode[];
  onClose: () => void;
  onSelectNode: (node: GraphNode) => void;
  onOpenRemediation?: () => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  node,
  links,
  allNodes,
  onClose,
  onSelectNode,
  onOpenRemediation
}) => {
  if (!node) return null;

  const metadata = node.metadata || {};

  const getLinkId = (ref: string | GraphNode): string =>
    typeof ref === "object" ? ref.id : ref;

  // Find incoming & outgoing edges
  const incomingLinks = links.filter((l) => getLinkId(l.target) === node.id);
  const outgoingLinks = links.filter((l) => getLinkId(l.source) === node.id);

  const getNodeById = (id: string) => allNodes.find((n) => n.id === id);

  const getGroupIcon = (group: string) => {
    switch (group) {
      case "repository":
        return <Code2 className="w-4 h-4 text-cyan-400" />;
      case "function":
        return <CornerDownRight className="w-4 h-4 text-blue-400" />;
      case "dependency":
        return <Package className="w-4 h-4 text-amber-400" />;
      case "cve":
        return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case "exploit":
        return <Skull className="w-4 h-4 text-red-600" />;
      case "asset":
        return <Lock className="w-4 h-4 text-purple-400" />;
      case "safe":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      default:
        return <Code2 className="w-4 h-4 text-slate-400" />;
    }
  };

  const getSeverityBadge = (severity?: string) => {
    if (!severity) return null;
    const s = severity.toUpperCase();
    if (s === "CRITICAL") return <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/40">CRITICAL</span>;
    if (s === "HIGH") return <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">HIGH</span>;
    if (s === "MEDIUM") return <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">MEDIUM</span>;
    return <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40">LOW</span>;
  };

  return (
    <div className="absolute top-4 left-4 z-30 w-84 sm:w-96 max-h-[calc(100%-2rem)] flex flex-col glass-panel-elevated rounded-2xl shadow-2xl overflow-hidden text-xs animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10 bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
            {getGroupIcon(node.group)}
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-200 uppercase font-mono">
              {node.group} Telemetry
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-colors cursor-pointer"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content Body */}
      <div className="p-4 overflow-y-auto space-y-4">
        {/* Node Name & ID */}
        <div>
          <h3 className="text-sm font-bold text-slate-100 break-words flex items-center gap-2">
            {node.name}
          </h3>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {node.id}</div>
        </div>

        {/* CVSS & Severity Card (If CVE) */}
        {metadata.cvss !== undefined && (
          <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/40 flex items-center justify-between shadow-[0_0_15px_rgba(255,51,102,0.15)]">
            <div>
              <div className="text-[10px] text-red-400/80 font-mono uppercase">CVSS v3.1 BASE SCORE</div>
              <div className="text-xl font-extrabold text-red-400 font-mono mt-0.5">
                {metadata.cvss.toFixed(1)} <span className="text-xs font-normal text-slate-400">/ 10.0</span>
              </div>
            </div>
            {getSeverityBadge(metadata.severity)}
          </div>
        )}

        {/* AI Remediation Action CTA Button */}
        {onOpenRemediation && (
          <button
            onClick={onOpenRemediation}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Synthesize AI Threat Patch</span>
          </button>
        )}

        {/* Security Summary & Attributes */}
        <div className="space-y-2">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Attribute Telemetry
          </div>

          <div className="rounded-xl glass-panel divide-y divide-white/5 overflow-hidden text-xs">
            {metadata.cwe && (
              <div className="p-2.5 flex items-start justify-between gap-2">
                <span className="text-slate-400 text-[11px]">CWE:</span>
                <span className="text-slate-200 font-mono text-right text-[11px] font-semibold">{metadata.cwe}</span>
              </div>
            )}

            {metadata.file && (
              <div className="p-2.5 flex items-start justify-between gap-2">
                <span className="text-slate-400 text-[11px]">File:</span>
                <span className="text-cyan-300 font-mono text-right text-[11px] truncate max-w-[200px]">
                  {metadata.file}{metadata.line ? `:${metadata.line}` : ""}
                </span>
              </div>
            )}

            {metadata.version && (
              <div className="p-2.5 flex items-start justify-between gap-2">
                <span className="text-slate-400 text-[11px]">Installed:</span>
                <span className="text-amber-300 font-mono text-[11px]">{metadata.version}</span>
              </div>
            )}

            {metadata.latest_version && (
              <div className="p-2.5 flex items-start justify-between gap-2">
                <span className="text-slate-400 text-[11px]">Patched:</span>
                <span className="text-emerald-300 font-mono text-[11px]">{metadata.latest_version}</span>
              </div>
            )}

            {metadata.summary && (
              <div className="p-2.5 space-y-1">
                <div className="text-slate-400 text-[10px]">Description:</div>
                <div className="text-slate-300 text-[11px] leading-relaxed">{metadata.summary}</div>
              </div>
            )}
          </div>
        </div>

        {/* Inbound & Outbound Relationships */}
        <div className="space-y-2">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Connected Graph Edges ({incomingLinks.length + outgoingLinks.length})
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {incomingLinks.map((link, idx) => {
              const srcNode = getNodeById(getLinkId(link.source));
              if (!srcNode) return null;
              return (
                <button
                  key={`in-${idx}`}
                  onClick={() => onSelectNode(srcNode)}
                  className="w-full p-2 rounded-lg glass-panel hover:bg-white/10 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[10px] text-slate-400 font-mono">IN:</span>
                    <span className="text-slate-200 text-xs truncate group-hover:text-cyan-300 font-medium">
                      {srcNode.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-cyan-400/80 font-mono uppercase shrink-0">
                    {link.label || "CALLS"}
                  </span>
                </button>
              );
            })}

            {outgoingLinks.map((link, idx) => {
              const tgtNode = getNodeById(getLinkId(link.target));
              if (!tgtNode) return null;
              return (
                <button
                  key={`out-${idx}`}
                  onClick={() => onSelectNode(tgtNode)}
                  className="w-full p-2 rounded-lg glass-panel hover:bg-white/10 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[10px] text-slate-400 font-mono">OUT:</span>
                    <span className="text-slate-200 text-xs truncate group-hover:text-cyan-300 font-medium">
                      {tgtNode.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-cyan-400/80 font-mono uppercase shrink-0">
                    {link.label || "CONNECTS"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
