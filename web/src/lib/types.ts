export type NodeGroup = 
  | "repository" 
  | "function" 
  | "dependency" 
  | "cve" 
  | "exploit" 
  | "asset" 
  | "safe";

export interface NodeMetadata {
  cvss?: number;
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  cwe?: string;
  vector?: string;
  summary?: string;
  description?: string;
  file?: string;
  line?: number;
  scope?: string;
  package_manager?: string;
  version?: string;
  latest_version?: string;
  transitive?: boolean;
  license?: string;
  exploit_type?: string;
  in_the_wild?: boolean;
  asset_class?: string;
  contains?: string[];
  exposure_risk?: string;
  defense_type?: string;
  status?: string;
  url?: string;
  [key: string]: unknown;
}

export interface GraphNode {
  id: string;
  name: string;
  group: NodeGroup;
  val?: number;
  color?: string;
  metadata?: NodeMetadata;
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  label?: string;
  type?: "control_flow" | "dependency" | "vulnerability" | "threat_path" | "impact" | "defense" | string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface AnalysisSummary {
  total_nodes: number;
  total_links: number;
  critical_cves: number;
  high_cves: number;
  risk_score: number;
}

export interface AnalysisResponse {
  target: string;
  status: string;
  execution_time_seconds: number;
  summary: AnalysisSummary;
  graph_data: GraphData;
  report: string;
}

export interface SynthesisRequest {
  target: string;
  graph_data: GraphData;
  source_file_path?: string;
  source_code_snippet?: string;
}

export interface SynthesisResponse {
  cve_id: string;
  vulnerable_component: string;
  blast_radius_summary: string;
  markdown_report: string;
  code_patch: string;
  patch_language: string;
  remediation_steps: string[];
}

export interface RemediationRequest {
  target: string;
  cve_id: string;
  code_patch: string;
  markdown_report?: string;
  source_file_path?: string;
  test_command?: string;
  mock_github?: boolean;
}

export interface RemediationResponse {
  target: string;
  cve_id: string;
  status: "success" | "verification_failed" | "sandbox_failed" | "error" | "pr_failed";
  graph_verified: boolean;
  initial_attack_paths: number;
  remaining_attack_paths: number;
  sandbox_passed: boolean;
  sandbox_logs: string;
  pr_url?: string | null;
  branch_name?: string | null;
  message: string;
}
