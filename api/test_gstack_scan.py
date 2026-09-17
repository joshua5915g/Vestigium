import sys
import os
import asyncio

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.cartographer import CartographerService
from app.models.schema import AnalysisRequest, SynthesisRequest, RemediationRequest
from synthesizer import synthesizer
from healing_agent import healing_agent

async def _async_test_gstack_cartography():
    print("[TEST 1] Cartography Scan on garrytan/gstack...")
    req = AnalysisRequest(
        target="https://github.com/garrytan/gstack",
        target_type="repository",
        depth=3
    )
    res = await CartographerService.analyze_target(req)
    assert res.status == "completed"
    assert res.summary.risk_score == 9.8
    assert res.summary.critical_cves >= 1
    
    node_names = [n.name for n in res.graph_data.nodes]
    assert any("gstack" in name.lower() for name in node_names)
    assert any("runner" in name.lower() for name in node_names)
    assert any("cve-2024-43485" in name.lower() for name in node_names)
    print(f"  -> Cartography Success: {res.summary.total_nodes} nodes, {res.summary.total_links} links mapped.")

    print("\n[TEST 2] Threat Synthesis on garrytan/gstack...")
    synth_req = SynthesisRequest(
        target="https://github.com/garrytan/gstack",
        graph_data=res.graph_data.model_dump()
    )
    synth_res = synthesizer.synthesize(synth_req)
    assert synth_res.cve_id == "CVE-2024-43485"
    assert "agent-tool-executor" in synth_res.vulnerable_component
    assert len(synth_res.remediation_steps) > 0
    print(f"  -> Synthesis Output: {synth_res.cve_id} | Component: {synth_res.vulnerable_component}")

    print("\n[TEST 3] Self-Healing CI/CD on garrytan/gstack...")
    rem_req = RemediationRequest(
        target="garrytan/gstack",
        cve_id=synth_res.cve_id,
        code_patch=synth_res.code_patch,
        markdown_report=synth_res.markdown_report,
        mock_github=True
    )
    rem_res = healing_agent.remediate(rem_req)
    assert rem_res.status == "success"
    assert rem_res.graph_verified is True
    assert rem_res.sandbox_passed is True
    assert rem_res.pr_url is not None
    print(f"  -> Self-Healing Success! PR Opened: {rem_res.pr_url}")

def test_gstack_cartography():
    asyncio.run(_async_test_gstack_cartography())

if __name__ == "__main__":
    print("=" * 65)
    print("VESTIGIUM: GSTACK & AWESOME-SKILLS PIPELINE VALIDATION")
    print("=" * 65)
    test_gstack_cartography()

    print("\nALL GSTACK & SKILLS TESTS COMPLETED SUCCESSFULLY!")
