import sys
import os

# Add api folder to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from synthesizer import ContextBuilder, SourceCodeRetriever, synthesizer
from app.models.schema import SynthesisRequest, SynthesisResponse

def test_context_builder():
    print("[TEST 1] Testing ContextBuilder...")
    sample_graph = {
        "nodes": [
            {"id": "node_1", "name": "auth-gateway", "group": "repository"},
            {"id": "node_2", "name": "verifyBearerToken()", "group": "function"},
            {"id": "node_3", "name": "jsonwebtoken@8.5.1", "group": "dependency"},
            {"id": "node_4", "name": "CVE-2022-23529", "group": "cve", "metadata": {"cvss": 9.8, "severity": "CRITICAL"}},
            {"id": "node_5", "name": "AWS IAM Secret Vault", "group": "asset"}
        ],
        "links": [
            {"source": "node_1", "target": "node_2", "label": "CONTAINS"},
            {"source": "node_2", "target": "node_3", "label": "CALLS"},
            {"source": "node_3", "target": "node_4", "label": "VULNERABLE_TO"},
            {"source": "node_4", "target": "node_5", "label": "EXPOSES"}
        ]
    }
    context = ContextBuilder.build_graph_context(sample_graph, "auth-gateway")
    assert "TARGET SYSTEM: auth-gateway" in context
    assert "verifyBearerToken() ==(CALLS)==> [dependency] jsonwebtoken@8.5.1" in context
    assert "CVE-2022-23529" in context
    print("  -> ContextBuilder OK! Sample Output snippet:")
    print("     " + "\n     ".join(context.splitlines()[:5]))

def test_source_code_retriever():
    print("\n[TEST 2] Testing SourceCodeRetriever...")
    # Test fallback extraction
    graph_jwt = {"nodes": [{"name": "jsonwebtoken"}]}
    snippet, lang = SourceCodeRetriever.retrieve_code(None, graph_jwt)
    assert "verifyBearerToken" in snippet
    assert lang == "typescript"
    print("  -> JWT fallback snippet OK (Language: typescript)")

    graph_log4j = {"nodes": [{"name": "log4j-core"}]}
    snippet_l4j, lang_l4j = SourceCodeRetriever.retrieve_code(None, graph_log4j)
    assert "processUserAudit" in snippet_l4j
    assert lang_l4j == "java"
    print("  -> Log4j fallback snippet OK (Language: java)")

def test_synthesizer_scenarios():
    print("\n[TEST 3] Testing ThreatSynthesizer Scenarios...")
    
    # Scenario 1: JWT RCE
    req_jwt = SynthesisRequest(
        target="auth-gateway",
        graph_data={
            "nodes": [
                {"id": "n1", "name": "auth-gateway", "group": "repository"},
                {"id": "n2", "name": "verifyBearerToken", "group": "function"},
                {"id": "n3", "name": "jsonwebtoken@8.5.1", "group": "dependency"},
                {"id": "n4", "name": "CVE-2022-23529", "group": "cve"}
            ],
            "links": [
                {"source": "n1", "target": "n2", "label": "ENTRYPOINT"},
                {"source": "n2", "target": "n3", "label": "IMPORTS"},
                {"source": "n3", "target": "n4", "label": "AFFECTED_BY"}
            ]
        }
    )
    res_jwt = synthesizer.synthesize(req_jwt)
    assert isinstance(res_jwt, SynthesisResponse)
    assert res_jwt.cve_id == "CVE-2022-23529"
    assert "jsonwebtoken" in res_jwt.vulnerable_component
    assert len(res_jwt.remediation_steps) > 0
    assert "diff" in res_jwt.code_patch or "export" in res_jwt.code_patch
    print(f"  -> Scenario 1 (JWT) Validated: {res_jwt.cve_id} - {res_jwt.vulnerable_component}")

    # Scenario 2: Log4Shell
    req_log4j = SynthesisRequest(
        target="log-pipeline",
        graph_data={
            "nodes": [
                {"id": "n1", "name": "log-pipeline", "group": "repository"},
                {"id": "n2", "name": "log4j-core@2.14.1", "group": "dependency"},
                {"id": "n3", "name": "CVE-2021-44228", "group": "cve"}
            ],
            "links": [
                {"source": "n1", "target": "n2", "label": "USES"},
                {"source": "n2", "target": "n3", "label": "VULNERABILITY"}
            ]
        }
    )
    res_log4j = synthesizer.synthesize(req_log4j)
    assert res_log4j.cve_id == "CVE-2021-44228"
    assert "log4j" in res_log4j.vulnerable_component.lower()
    print(f"  -> Scenario 2 (Log4Shell) Validated: {res_log4j.cve_id} - {res_log4j.vulnerable_component}")

    # Scenario 3: Lodash Prototype Pollution
    req_lodash = SynthesisRequest(
        target="config-engine",
        graph_data={
            "nodes": [
                {"id": "n1", "name": "config-engine", "group": "repository"},
                {"id": "n2", "name": "lodash@4.17.15", "group": "dependency"},
                {"id": "n3", "name": "CVE-2019-10744", "group": "cve"}
            ],
            "links": [
                {"source": "n1", "target": "n2", "label": "USES"},
                {"source": "n2", "target": "n3", "label": "VULNERABILITY"}
            ]
        }
    )
    res_lodash = synthesizer.synthesize(req_lodash)
    assert res_lodash.cve_id == "CVE-2019-10744"
    assert "lodash" in res_lodash.vulnerable_component.lower()
    print(f"  -> Scenario 3 (Lodash) Validated: {res_lodash.cve_id} - {res_lodash.vulnerable_component}")

def test_api_endpoint_structure():
    print("\n[TEST 4] Testing FastAPI /api/synthesize endpoint integration...")
    from main import app
    from fastapi.testclient import TestClient
    
    client = TestClient(app)
    payload = {
        "target": "auth-gateway",
        "graph_data": {
            "nodes": [{"id": "n1", "name": "jsonwebtoken", "group": "dependency"}],
            "links": []
        }
    }
    response = client.post("/api/synthesize", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    assert "cve_id" in data
    assert "markdown_report" in data
    assert "code_patch" in data
    print("  -> FastAPI POST /api/synthesize returned 200 OK with valid schema!")

if __name__ == "__main__":
    print("=" * 60)
    print("VESTIGIUM PHASE 4: SYNTHESIS ENGINE TEST SUITE")
    print("=" * 60)
    test_context_builder()
    test_source_code_retriever()
    test_synthesizer_scenarios()
    test_api_endpoint_structure()
    print("\nALL PHASE 4 TESTS PASSED SUCCESSFULLY!")
