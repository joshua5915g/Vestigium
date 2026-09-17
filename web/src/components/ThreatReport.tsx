"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  ChevronRight, 
  ChevronLeft, 
  Copy, 
  Check, 
  Download, 
  ShieldAlert, 
  Sparkles
} from "lucide-react";

interface ThreatReportProps {
  reportMarkdown: string;
  target: string;
  isOpen: boolean;
  onToggle: () => void;
  onOpenRemediation?: () => void;
}

export const ThreatReport: React.FC<ThreatReportProps> = ({
  reportMarkdown,
  target,
  isOpen,
  onToggle,
  onOpenRemediation
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([reportMarkdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vestigium-threat-report-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`fixed top-14 right-0 bottom-0 z-30 transition-all duration-300 ease-in-out flex ${
        isOpen ? "w-full md:w-[540px] lg:w-[620px]" : "w-10"
      }`}
    >
      {/* Toggle Tab Button */}
      <button
        onClick={onToggle}
        className="h-32 self-center glass-panel-elevated border-y border-l border-cyan-500/40 rounded-l-xl p-2 text-cyan-400 hover:text-cyan-200 hover:bg-white/10 transition-all shadow-[-8px_0_20px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center gap-1.5 cursor-pointer"
        title={isOpen ? "Collapse Report" : "Expand Threat Advisory"}
      >
        {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        <span className="[writing-mode:vertical-rl] text-[10px] font-mono font-bold tracking-widest uppercase rotate-180 text-cyan-300">
          {isOpen ? "CLOSE ADVISORY" : "THREAT REPORT"}
        </span>
      </button>

      {/* Drawer Body */}
      {isOpen && (
        <div className="flex-1 h-full glass-panel-elevated border-l border-white/10 flex flex-col overflow-hidden shadow-2xl">
          {/* Header Action Bar */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-100 font-mono tracking-wider uppercase">
                  GraphRAG Threat Intelligence
                </h2>
                <p className="text-[10px] text-slate-400 font-mono truncate max-w-xs">
                  {target}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenRemediation && (
                <button
                  onClick={onOpenRemediation}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-slate-950 font-bold font-mono text-[11px] flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  title="Open AI Remediation Studio"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Fix &amp; PR</span>
                </button>
              )}

              <button
                onClick={handleCopy}
                className="px-2.5 py-1.5 rounded-xl glass-panel hover:bg-white/10 text-slate-300 font-mono text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copy Markdown Report"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-2.5 py-1.5 rounded-xl glass-panel hover:bg-white/10 text-slate-300 font-mono text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Export .MD File"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Markdown Content */}
          <div className="flex-1 p-6 overflow-y-auto text-slate-300 text-xs leading-relaxed selection:bg-cyan-500/30 selection:text-cyan-200">
            <div className="prose prose-invert prose-xs max-w-none space-y-4 font-sans">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-base font-bold text-slate-100 font-sans border-b border-white/10 pb-2 flex items-center gap-2">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xs font-bold text-cyan-300 font-mono uppercase tracking-wider pt-2 border-b border-white/5 pb-1">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xs font-bold text-slate-200 font-sans pt-1">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-slate-300 text-xs leading-relaxed">{children}</p>
                  ),
                  code: ({ children, className }: { children?: React.ReactNode; className?: string }) => {
                    const isInline = !className || !className.includes("language-");
                    return isInline ? (
                      <code className="px-1.5 py-0.5 rounded-md bg-slate-900 border border-white/10 font-mono text-cyan-300 text-[11px]">
                        {children}
                      </code>
                    ) : (
                      <pre className="p-3.5 rounded-xl bg-[#04060a] border border-white/10 font-mono text-[11px] text-slate-200 overflow-x-auto my-2 leading-relaxed">
                        <code>{children}</code>
                      </pre>
                    );
                  },
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-3 border border-white/10 rounded-xl glass-panel">
                      <table className="min-w-full divide-y divide-white/10 text-left text-[11px]">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="px-3.5 py-2.5 bg-slate-900/80 text-slate-200 font-bold font-mono uppercase text-[10px]">{children}</th>
                  ),
                  td: ({ children }) => (
                    <td className="px-3.5 py-2 border-t border-white/5 text-slate-300">{children}</td>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-4 space-y-1.5 text-slate-300">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-4 space-y-1.5 text-slate-300">{children}</ol>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {reportMarkdown}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
