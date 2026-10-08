import { 
  AnalysisResponse, 
  SynthesisRequest, 
  SynthesisResponse, 
  RemediationRequest, 
  RemediationResponse,
  DependencyScanResponse,
  UpgradePullRequestResponse,
  UpgradeCheckResponse
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchAnalysis(
  target: string,
  targetType: string = "repository",
  depth: number = 3
): Promise<AnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      target,
      target_type: targetType,
      depth,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorBody.detail || `Analysis request failed: ${response.status}`);
  }

  return response.json();
}

export async function fetchSynthesis(
  request: SynthesisRequest
): Promise<SynthesisResponse> {
  const response = await fetch(`${API_BASE_URL}/api/synthesize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorBody.detail || `Synthesis request failed: ${response.status}`);
  }

  return response.json();
}

export async function fetchRemediation(
  request: RemediationRequest
): Promise<RemediationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/remediate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorBody.detail || `Remediation request failed: ${response.status}`);
  }

  return response.json();
}

export async function fetchAttackSteps(target: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/traversal/steps`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ target }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorBody.detail || `Attack stepper request failed: ${response.status}`);
  }

  return response.json();
}

export async function fetchDependencyScan(target: string): Promise<DependencyScanResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/dependencies/scan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ target }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorBody.detail || `Dependency scan failed: ${response.status}`);
  }

  return response.json();
}

export async function fetchUpgradePullRequest(request: {
  target: string;
  manifest_path: string;
  advisory_id: string;
  package_name: string;
  current_version: string;
  fixed_version: string;
}, remediationKey: string): Promise<UpgradePullRequestResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/dependencies/upgrade-pr`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Remediation-Key": remediationKey,
    },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorBody.detail || `Upgrade PR request failed: ${response.status}`);
  }
  return response.json();
}

export async function fetchUpgradeChecks(
  target: string,
  pullRequestNumber: number,
  remediationKey: string
): Promise<UpgradeCheckResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/dependencies/${encodeURIComponent(target.split("/")[0])}/${encodeURIComponent(target.split("/")[1])}/pull-requests/${pullRequestNumber}/checks`,
    {
      headers: { "X-Remediation-Key": remediationKey },
    }
  );
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorBody.detail || `GitHub checks request failed: ${response.status}`);
  }
  return response.json();
}
