"use client";

import { useState } from "react";
import { AlertTriangle, LoaderCircle, SearchCheck, ShieldCheck } from "lucide-react";
import { fetchDependencyScan } from "../lib/api";
import { DependencyFinding, DependencyScanResponse } from "../lib/types";

const severityStyles: Record<DependencyFinding["severity"], string> = {
  CRITICAL: "text-red-300 border-red-500/40 bg-red-500/10",
  HIGH: "text-orange-300 border-orange-500/40 bg-orange-500/10",
  MEDIUM: "text-amber-200 border-amber-500/40 bg-amber-500/10",
  LOW: "text-cyan-200 border-cyan-500/40 bg-cyan-500/10",
  UNKNOWN: "text-slate-300 border-slate-600 bg-slate-800/60",
};

export function DependencyScanPanel() {
  const [target, setTarget] = useState("..");
  const [result, setResult] = useState<DependencyScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const runScan = async () => {
    setLoading(true);
    setError(null);
    try {
      setResult(await fetchDependencyScan(target));
    } catch (scanError: unknown) {
      setError(scanError instanceof Error ? scanError.message : "Dependency scan failed.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mb-6 rounded-2xl border border-cyan-500/20 bg-slate-950/80 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-300">
            <ShieldCheck className="h-5 w-5" />
            <h3 className="font-bold">Verified Dependency Exposure</h3>
          </div>
          <p className="mt-1 max-w-2xl text-xs text-slate-400">
            Match exact versions from npm lockfiles and pinned requirements against OSV.
            Only package names, ecosystems, and versions are sent to OSV; source code is not uploaded.
          </p>
        </div>
        <div className="flex w-full gap-2 md:max-w-xl">
          <label className="sr-only" htmlFor="dependency-scan-target">Local scan directory</label>
          <input
            id="dependency-scan-target"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            placeholder="Directory under SCAN_ALLOWED_ROOT"
            className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
          />
          <button
            type="button"
            onClick={runScan}
            disabled={loading || !target.trim()}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-200 ring-1 ring-cyan-500/40 transition hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <SearchCheck className="h-4 w-4" />}
            {loading ? "Scanning" : "Scan"}
          </button>
        </div>
      </div>

      {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
      {result && (
        <div className="mt-5 border-t border-slate-800 pt-4">
          <p className="text-sm text-slate-300">
            Checked <strong>{result.dependency_count}</strong> pinned dependencies across{" "}
            <strong>{result.dependencies.reduce((count, item) => count + item.manifests.length, 0)}</strong>{" "}
            manifest references; OSV reported <strong>{result.finding_count}</strong> findings.
          </p>
          {result.findings.length === 0 ? (
            <p className="mt-3 flex items-center gap-2 text-sm text-emerald-300">
              <ShieldCheck className="h-4 w-4" /> No known advisories for the exact versions scanned.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {result.findings.map((finding, index) => (
                <li key={`${finding.id}-${finding.dependency}-${finding.version}-${index}`} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded border px-2 py-0.5 text-[10px] font-bold ${severityStyles[finding.severity]}`}>
                      {finding.severity}
                    </span>
                    <strong className="text-sm text-slate-100">{finding.dependency}@{finding.version}</strong>
                    <span className="font-mono text-xs text-cyan-300">{finding.id}</span>
                    {finding.aliases.map((alias) => (
                      <span key={alias} className="font-mono text-[10px] text-slate-500">{alias}</span>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slate-300">{finding.summary || "OSV advisory has no summary."}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {finding.manifests.join(", ")}
                    {finding.fixed_versions.length > 0 && ` · Fixed in ${finding.fixed_versions.join(", ")}`}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
