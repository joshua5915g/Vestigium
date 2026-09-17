from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class AnalysisRequest(BaseModel):
    target: str = Field(..., description="Target repository URL or package identifier (e.g. github.com/owner/repo or package name)")
    target_type: Optional[str] = Field(default="repository", description="Type of target: 'repository' or 'package'")
    depth: Optional[int] = Field(default=3, ge=1, le=5, description="Graph traversal depth")

class Node(BaseModel):
    id: str = Field(..., description="Unique node identifier")
    name: str = Field(..., description="Display label for the node")
    group: str = Field(..., description="Node categorization: repository, function, dependency, cve, exploit, asset, safe")
    val: Optional[float] = Field(default=15.0, description="Relative visual weight / node radius size for force graph")
    color: Optional[str] = Field(default="#60a5fa", description="Hex color value for visualization")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Arbitrary security and code metadata")

class Link(BaseModel):
    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    label: Optional[str] = Field(default="CONNECTS", description="Edge relationship label, e.g. CALLS, IMPORTS, AFFECTED_BY")
    type: Optional[str] = Field(default="general", description="Edge type: control_flow, dependency, vulnerability, threat_path, impact, defense")

class GraphData(BaseModel):
    nodes: List[Node] = Field(default_factory=list, description="List of graph nodes")
    links: List[Link] = Field(default_factory=list, description="List of directed links between nodes")

class AnalysisSummary(BaseModel):
    total_nodes: int
    total_links: int
    critical_cves: int
    high_cves: int
    risk_score: float = Field(..., description="Normalized overall risk index 0.0 - 10.0")

class AnalysisResponse(BaseModel):
    target: str
    status: str = "completed"
    execution_time_seconds: float
    summary: AnalysisSummary
    graph_data: GraphData
    report: str = Field(..., description="Detailed markdown GraphRAG threat assessment")

class SynthesisRequest(BaseModel):
    target: str = Field(..., description="Target repository or local file path")
    graph_data: Dict[str, Any] = Field(..., description="Graph nodes and edges representing the attack path")
    source_file_path: Optional[str] = Field(default=None, description="Path to the vulnerable source file")
    source_code_snippet: Optional[str] = Field(default=None, description="Optional code snippet if file is remote")

class SynthesisResponse(BaseModel):
    cve_id: str = Field(..., description="Primary CVE identifier addressed")
    vulnerable_component: str = Field(..., description="Affected package, module, or function")
    blast_radius_summary: str = Field(..., description="Summary of adversary reachability and blast radius")
    markdown_report: str = Field(..., description="Detailed threat advisory grounded strictly in graph traversal")
    code_patch: str = Field(..., description="Drop-in code snippet or unified diff fixing the flaw")
    patch_language: str = Field(default="typescript", description="Language of the code patch (e.g. typescript, python)")
    remediation_steps: List[str] = Field(default_factory=list, description="Step-by-step actions for security remediation")

class RemediationRequest(BaseModel):
    target: str = Field(..., description="Target repository name or path (e.g. auth-gateway or owner/repo)")
    cve_id: str = Field(..., description="CVE ID being remediated (e.g. CVE-2022-23529)")
    code_patch: str = Field(..., description="Code patch to apply and verify")
    markdown_report: Optional[str] = Field(default="", description="Phase 4 threat advisory to include in PR body")
    source_file_path: Optional[str] = Field(default=None, description="Path to the source file being patched")
    test_command: Optional[str] = Field(default="npm test", description="Testing command to run in sandbox")
    mock_github: Optional[bool] = Field(default=None, description="Force mock GitHub PR mode for safe testing")

class RemediationResponse(BaseModel):
    target: str
    cve_id: str
    status: str = Field(..., description="Remediation status: 'success', 'verification_failed', 'sandbox_failed', or 'error'")
    graph_verified: bool = Field(..., description="Whether the graph traversal proved the attack path was severed")
    initial_attack_paths: int = Field(default=0, description="Number of reachable attack paths before patch")
    remaining_attack_paths: int = Field(default=0, description="Number of reachable attack paths after patch")
    sandbox_passed: bool = Field(..., description="Whether the sandbox automated tests passed without regression")
    sandbox_logs: str = Field(default="", description="Captured stdout and stderr logs from test sandbox")
    pr_url: Optional[str] = Field(default=None, description="URL of the opened GitHub Pull Request (if created)")
    branch_name: Optional[str] = Field(default=None, description="Git branch name created for the patch")
    message: str = Field(..., description="Summary message of the remediation result")


