import sys
import os

# Add api folder to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from healing_agent import GraphVerifier, DockerSandboxExecutor, GitHubPRBot, healing_agent
from app.models.schema import RemediationRequest, RemediationResponse

def test_graph_verifier():
    print("[TEST 1] Testing GraphVerifier...")
    # Test valid patch with sanitization and version bump
    valid_patch = (
        "--- a/src/middleware/auth.ts\n"
        "+++ b/src/middleware/auth.ts\n"
        "+export function verifyBearerToken(token: string, secretKey: string | Buffer) {\n"
        "+    if (typeof secretKey !== 'string' && !Buffer.isBuffer(secretKey)) {\n"
        "+        throw new TypeError('Invalid secret');\n"
        "+    }\n"
        "+    const decoded = jwt.verify(token, secretKey, { algorithms: ['RS256'] });\n"
        "}\n"
        "// package.json:\n"
        "\"jsonwebtoken\": \"^9.0.2\""
    )
    verified, init_p, rem_p, msg = GraphVerifier.verify_patch(
        target="auth-gateway",
        cve_id="CVE-2022-23529",
        code_patch=valid_patch
    )
    assert verified is True
    assert init_p >= 1
    assert rem_p == 0
    print(f"  -> Valid patch verified successfully! (Paths: {init_p} -> {rem_p})")

    # Test invalid patch without defensive changes
    invalid_patch = "// Just a useless comment with no security changes"
    verified_bad, _, _, _ = GraphVerifier.verify_patch(
        target="auth-gateway",
        cve_id="CVE-2022-23529",
        code_patch=invalid_patch
    )
    assert verified_bad is False
    print("  -> Invalid patch correctly rejected by GraphVerifier.")

def test_docker_sandbox_and_failsafe():
    print("\n[TEST 2] Testing DockerSandboxExecutor & Failsafe Mechanism...")
    
    # Passing test run
    good_patch = "export function safeCode() { return true; }"
    passed, logs = DockerSandboxExecutor.run_sandbox_test(
        repo_target="auth-gateway",
        code_patch=good_patch,
        test_command="npm test"
    )
    assert passed is True
    assert "PASS" in logs or "exit code 0" in logs
    print("  -> Passing sandbox tests execution validated.")

    # Failing test run (simulation of regression)
    failing_patch = "FAIL_TEST_SIMULATION"
    passed_fail, logs_fail = DockerSandboxExecutor.run_sandbox_test(
        repo_target="auth-gateway",
        code_patch=failing_patch,
        test_command="npm test"
    )
    assert passed_fail is False
    assert "FAIL" in logs_fail or "exit code 1" in logs_fail
    print("  -> Regression detected: Failsafe correctly triggered test failure in sandbox.")

def test_github_pr_bot():
    print("\n[TEST 3] Testing GitHubPRBot (Mock & Live Routing)...")
    bot = GitHubPRBot()
    success, pr_url, branch, msg = bot.create_pull_request(
        target="auth-gateway",
        cve_id="CVE-2022-23529",
        code_patch="+ // Fix applied",
        markdown_report="# Security Advisory\nFixed JWT RCE",
        force_mock=True
    )
    assert success is True
    assert pr_url is not None and "github.com" in pr_url and "pull" in pr_url
    assert "vestigium-fix" in branch
    print(f"  -> Mock GitHub PR generated: {pr_url} (Branch: {branch})")

def test_full_healing_pipeline_and_fastapi_endpoint():
    print("\n[TEST 4] Testing Full Self-Healing Coordinator & FastAPI /api/remediate...")
    from main import app
    from fastapi.testclient import TestClient

    client = TestClient(app)

    # 1. Successful Remediation Call
    success_payload = {
        "target": "auth-gateway",
        "cve_id": "CVE-2022-23529",
        "code_patch": "```diff\n+ typeof secretKey === 'string'\n+ \"jsonwebtoken\": \"^9.0.2\"\n```",
        "markdown_report": "# Threat Advisory for CVE-2022-23529",
        "test_command": "npm test",
        "mock_github": True
    }
    res = client.post("/api/remediate", json=success_payload)
    assert res.status_code == 200, f"Error: {res.text}"
    data = res.json()
    assert data["status"] == "success"
    assert data["graph_verified"] is True
    assert data["remaining_attack_paths"] == 0
    assert data["sandbox_passed"] is True
    assert data["pr_url"] is not None
    print(f"  -> Full Pipeline Success: {data['status']} | PR URL: {data['pr_url']}")

    # 2. Failsafe Blockage on Regression Test Failure
    fail_payload = {
        "target": "auth-gateway",
        "cve_id": "CVE-2022-23529",
        "code_patch": "FAIL_TEST_SIMULATION + sanitize(input) + ^9.0.2",
        "markdown_report": "Advisory",
        "mock_github": True
    }
    res_fail = client.post("/api/remediate", json=fail_payload)
    assert res_fail.status_code == 200
    data_fail = res_fail.json()
    assert data_fail["status"] == "sandbox_failed"
    assert data_fail["sandbox_passed"] is False
    assert data_fail["pr_url"] is None
    assert "FAILSAFE TRIGGERED" in data_fail["message"]
    print("  -> Failsafe Gate Verified: PR blocked when sandbox tests fail.")

if __name__ == "__main__":
    print("=" * 60)
    print("VESTIGIUM PHASE 5: SELF-HEALING CI/CD LOOP TEST SUITE")
    print("=" * 60)
    test_graph_verifier()
    test_docker_sandbox_and_failsafe()
    test_github_pr_bot()
    test_full_healing_pipeline_and_fastapi_endpoint()
    print("\nALL PHASE 5 TESTS PASSED SUCCESSFULLY!")
