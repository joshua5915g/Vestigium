"use client";

import React from "react";

const ECOSYSTEM_ITEMS = [
  "GraphRAG Traversal",
  "Neo4j Cypher Batch",
  "AST Execution Tracing",
  "CVSS 3.1 Blast Radius",
  "Deterministic Pydantic Schemas",
  "Self-Healing CI/CD",
  "Transitive SBOM Analysis",
  "NVD Real-time CVE Feed",
  "FastAPI Graph Engine",
  "Next.js 15 App Router",
];

export const EcosystemMarquee: React.FC = () => {
  return (
    <div className="relative overflow-hidden border-y border-[#ff5a1f]/20 bg-[#0a0403] py-4">
      <div
        className="flex w-max animate-marquee gap-10 whitespace-nowrap"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        {[...ECOSYSTEM_ITEMS, ...ECOSYSTEM_ITEMS].map((item, idx) => (
          <div key={idx} className="flex items-center gap-10">
            <span className="font-mono text-xs uppercase tracking-widest text-[#f5efe9]/70 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff5a1f] shadow-[0_0_8px_#ff5a1f]"></span>
              {item}
            </span>
            <span className="text-[#571708]">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
};

