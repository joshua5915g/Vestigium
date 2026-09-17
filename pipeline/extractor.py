import os
import json
import re
from typing import Dict, Any, Optional
from dotenv import load_dotenv

from schema import KnowledgeGraphExtraction, ExtractedNode, ExtractedEdge
from prompts import SYSTEM_EXTRACTION_PROMPT, USER_EXTRACTION_TEMPLATE

load_dotenv()

class LLMExtractor:
    """
    NLP Knowledge Graph Extraction Engine.
    Supports OpenAI Structured Outputs, Gemini API, and Deterministic Mock Fallback.
    """

    def __init__(self, provider: Optional[str] = None):
        self.provider = (provider or os.getenv("LLM_PROVIDER", "mock")).lower()
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        
        # Auto-fallback to mock if no keys are provided
        if self.provider == "openai" and not self.openai_api_key:
            print("[INFO] No OPENAI_API_KEY detected. Defaulting to high-fidelity Mock Extractor.")
            self.provider = "mock"
        elif self.provider == "gemini" and not self.gemini_api_key:
            print("[INFO] No GEMINI_API_KEY detected. Defaulting to high-fidelity Mock Extractor.")
            self.provider = "mock"

    def extract_graph(self, cve_report: Dict[str, Any]) -> KnowledgeGraphExtraction:
        """
        Ingests a CVE record or raw description string and extracts
        a structured Knowledge Graph conforming to KnowledgeGraphExtraction.
        """
        report_text = cve_report.get("description", "")
        cve_id = cve_report.get("id", "UNKNOWN-CVE")

        if self.provider == "openai":
            return self._extract_via_openai(cve_id, report_text)
        elif self.provider == "gemini":
            return self._extract_via_gemini(cve_id, report_text)
        else:
            return self._extract_via_mock(cve_id, report_text, cve_report)

    def _extract_via_openai(self, cve_id: str, report_text: str) -> KnowledgeGraphExtraction:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=self.openai_api_key)
            model_name = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

            user_prompt = USER_EXTRACTION_TEMPLATE.format(report_text=report_text)

            # Use OpenAI Structured Outputs via client.beta.chat.completions.parse
            completion = client.beta.chat.completions.parse(
                model=model_name,
                messages=[
                    {"role": "system", "content": SYSTEM_EXTRACTION_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                response_format=KnowledgeGraphExtraction,
                temperature=0.1
            )
            parsed_graph = completion.choices[0].message.parsed
            if not parsed_graph.cve_id:
                parsed_graph.cve_id = cve_id
            return parsed_graph
        except Exception as err:
            print(f"[WARN] OpenAI extraction failed: {err}. Falling back to mock extractor.")
            return self._extract_via_mock(cve_id, report_text, {"id": cve_id, "description": report_text})

    def _extract_via_gemini(self, cve_id: str, report_text: str) -> KnowledgeGraphExtraction:
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=self.gemini_api_key)
            model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

            user_prompt = USER_EXTRACTION_TEMPLATE.format(report_text=report_text)

            response = client.models.generate_content(
                model=model_name,
                contents=f"{SYSTEM_EXTRACTION_PROMPT}\n\n{user_prompt}",
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=KnowledgeGraphExtraction,
                    temperature=0.1
                )
            )
            data = json.loads(response.text)
            parsed = KnowledgeGraphExtraction.model_validate(data)
            if not parsed.cve_id:
                parsed.cve_id = cve_id
            return parsed
        except Exception as err:
            print(f"[WARN] Gemini extraction failed: {err}. Falling back to mock extractor.")
            return self._extract_via_mock(cve_id, report_text, {"id": cve_id, "description": report_text})

    def _extract_via_mock(
        self,
        cve_id: str,
        report_text: str,
        raw_meta: Dict[str, Any]
    ) -> KnowledgeGraphExtraction:
        """
        Deterministic NLP rule & heuristic extractor for offline test runs.
        Emulates full LLM structured output with complete referential integrity.
        """
        text_lower = report_text.lower()
        nodes: list[ExtractedNode] = []
        edges: list[ExtractedEdge] = []

        # 1. Primary Vulnerability Node
        vuln_slug = f"vuln-{cve_id.lower()}"
        nodes.append(ExtractedNode(
            id=vuln_slug,
            name=cve_id,
            label="Vulnerability",
            properties={
                "cvss": raw_meta.get("cvss", 8.5),
                "severity": raw_meta.get("severity", "HIGH"),
                "cve_id": cve_id,
                "published": raw_meta.get("published", "")
            }
        ))

        # 2. Identify Software / Dependencies
        if "log4j" in text_lower:
            sw_id = "software-apache-log4j"
            nodes.append(ExtractedNode(
                id=sw_id,
                name="Apache Log4j2",
                label="Software",
                properties={"ecosystem": "maven", "affected_versions": "2.0-beta9 <= 2.14.1"}
            ))
            edges.append(ExtractedEdge(source=vuln_slug, target=sw_id, relationship_type="AFFECTS"))

            vec_id = "vector-ldap-jndi"
            nodes.append(ExtractedNode(id=vec_id, name="LDAP JNDI Lookup Injection", label="AttackVector"))
            edges.append(ExtractedEdge(source=vuln_slug, target=vec_id, relationship_type="EXPLOITED_VIA"))

            weak_id = "weakness-cwe-502"
            nodes.append(ExtractedNode(id=weak_id, name="CWE-502: Deserialization of Untrusted Data", label="Weakness"))
            edges.append(ExtractedEdge(source=vuln_slug, target=weak_id, relationship_type="EXEMPLIFIES"))

            imp_id = "impact-remote-code-execution"
            nodes.append(ExtractedNode(id=imp_id, name="Remote Code Execution", label="Impact"))
            edges.append(ExtractedEdge(source=vuln_slug, target=imp_id, relationship_type="LEADS_TO"))

            mit_id = "mitigation-upgrade-log4j"
            nodes.append(ExtractedNode(id=mit_id, name="Upgrade to log4j-core >= 2.17.1", label="Mitigation"))
            edges.append(ExtractedEdge(source=vuln_slug, target=mit_id, relationship_type="MITIGATED_BY"))

            summary = "Unconstrained JNDI lookups in Apache Log4j allow remote unauthenticated code execution."

        elif "jsonwebtoken" in text_lower:
            sw_id = "software-jsonwebtoken"
            nodes.append(ExtractedNode(
                id=sw_id,
                name="jsonwebtoken (Node.js)",
                label="Software",
                properties={"ecosystem": "npm", "affected_versions": "<= 8.5.1"}
            ))
            edges.append(ExtractedEdge(source=vuln_slug, target=sw_id, relationship_type="AFFECTS"))

            vec_id = "vector-tostring-injection"
            nodes.append(ExtractedNode(id=vec_id, name="Crafted secretOrPublicKey Parameter", label="AttackVector"))
            edges.append(ExtractedEdge(source=vuln_slug, target=vec_id, relationship_type="EXPLOITED_VIA"))

            weak_id = "weakness-cwe-94"
            nodes.append(ExtractedNode(id=weak_id, name="CWE-94: Code Injection", label="Weakness"))
            edges.append(ExtractedEdge(source=vuln_slug, target=weak_id, relationship_type="EXEMPLIFIES"))

            imp_id = "impact-rce"
            nodes.append(ExtractedNode(id=imp_id, name="Arbitrary Remote Code Execution", label="Impact"))
            edges.append(ExtractedEdge(source=vuln_slug, target=imp_id, relationship_type="LEADS_TO"))

            mit_id = "mitigation-upgrade-jsonwebtoken"
            nodes.append(ExtractedNode(id=mit_id, name="Upgrade jsonwebtoken to >= 9.0.0", label="Mitigation"))
            edges.append(ExtractedEdge(source=vuln_slug, target=mit_id, relationship_type="MITIGATED_BY"))

            summary = "jsonwebtoken <= 8.5.1 key retrieval flaw permits arbitrary code execution via forged secret objects."

        elif "xz" in text_lower or "liblzma" in text_lower:
            sw_id = "software-xz-utils"
            nodes.append(ExtractedNode(
                id=sw_id,
                name="XZ Utils (liblzma)",
                label="Software",
                properties={"ecosystem": "c/c++", "affected_versions": "5.6.0 - 5.6.1"}
            ))
            edges.append(ExtractedEdge(source=vuln_slug, target=sw_id, relationship_type="AFFECTS"))

            sw_sshd = "software-openssh-sshd"
            nodes.append(ExtractedNode(id=sw_sshd, name="OpenSSH sshd", label="Software"))
            edges.append(ExtractedEdge(source=sw_sshd, target=sw_id, relationship_type="DEPENDS_ON"))

            vec_id = "vector-build-backdoor"
            nodes.append(ExtractedNode(id=vec_id, name="Obfuscated M4 Macro Payload", label="AttackVector"))
            edges.append(ExtractedEdge(source=vuln_slug, target=vec_id, relationship_type="EXPLOITED_VIA"))

            imp_id = "impact-ssh-auth-bypass"
            nodes.append(ExtractedNode(id=imp_id, name="Pre-Authentication Root Compromise", label="Impact"))
            edges.append(ExtractedEdge(source=vuln_slug, target=imp_id, relationship_type="LEADS_TO"))

            mit_id = "mitigation-downgrade-xz"
            nodes.append(ExtractedNode(id=mit_id, name="Revert xz-utils to 5.4.x", label="Mitigation"))
            edges.append(ExtractedEdge(source=vuln_slug, target=mit_id, relationship_type="MITIGATED_BY"))

            summary = "Supply-chain backdoor in XZ Utils compromises OpenSSH server authentication."

        else:
            # Generic heuristic fallback
            sw_name = cve_id.split("-")[0] if "-" in cve_id else "Target-System"
            sw_id = f"software-{sw_name.lower()}"
            nodes.append(ExtractedNode(id=sw_id, name=sw_name, label="Software"))
            edges.append(ExtractedEdge(source=vuln_slug, target=sw_id, relationship_type="AFFECTS"))

            imp_id = "impact-service-compromise"
            nodes.append(ExtractedNode(id=imp_id, name="System Integrity Compromise", label="Impact"))
            edges.append(ExtractedEdge(source=vuln_slug, target=imp_id, relationship_type="LEADS_TO"))

            mit_id = "mitigation-apply-security-patch"
            nodes.append(ExtractedNode(id=mit_id, name="Apply Vendor Security Patch", label="Mitigation"))
            edges.append(ExtractedEdge(source=vuln_slug, target=mit_id, relationship_type="MITIGATED_BY"))

            summary = f"Vulnerability {cve_id} evaluated with structured graph mapping."

        # Threat Actor node common to remote threats
        actor_id = "actor-remote-unauthenticated"
        nodes.append(ExtractedNode(id=actor_id, name="Unauthenticated Remote Adversary", label="ThreatActor"))
        edges.append(ExtractedEdge(source=vuln_slug, target=actor_id, relationship_type="ATTEMPTED_BY"))

        return KnowledgeGraphExtraction(
            cve_id=cve_id,
            summary=summary,
            nodes=nodes,
            edges=edges
        )
