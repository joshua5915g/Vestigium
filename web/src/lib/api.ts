import { 
  AnalysisResponse, 
  SynthesisRequest, 
  SynthesisResponse, 
  RemediationRequest, 
  RemediationResponse 
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

