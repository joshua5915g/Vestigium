# Vestigium // GraphRAG Vulnerability Cartographer

Vestigium is an attack-surface cartography engine that maps repository dependency trees, execution call-sites, and vulnerability blast radiuses into an interactive knowledge graph alongside automated GraphRAG threat assessments.

---

## System Architecture

* **Frontend (`/web`):** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, `react-force-graph-2d`, `lucide-react`, `react-markdown`.
* **Backend (`/api`):** Python 3.11+, FastAPI, Uvicorn, Pydantic.
* **Extraction Pipeline (`/pipeline`):** NLP Knowledge Graph extraction pipeline using strict Pydantic schemas, Structured Outputs (OpenAI / Gemini / Mock), and Neo4j Cypher export.
* **Analysis Engine:** Simulates asynchronous 3-second GraphRAG traversal with multi-hop attack paths:
  `Repository -> Entrypoint Function -> Dependency -> CVE -> Exploit Vector -> Crown Jewel Asset`

---

## Quickstart Guide

### 1. Start the FastAPI Backend

Open a terminal in `/api`:

```bash
cd api
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

* Backend API: `http://localhost:8000`
* Interactive API Documentation: `http://localhost:8000/docs`

Alternatively on Windows, double-click `api/run.bat`.

---

### 2. Start the Next.js Frontend

Open a terminal in `/web`:

```bash
cd web
npm run dev
```

* Web Dashboard: `http://localhost:3000`

---

### 3. Run the Threat Extraction Pipeline (Phase 2)

Open a terminal in `/pipeline`:

```bash
cd pipeline
python -m pip install -r requirements.txt
python run_pipeline.py --provider mock --count 4
```

To run against live NVD reports:
```bash
python run_pipeline.py --live-nvd --count 5
```

To run with real OpenAI or Gemini API:
1. Copy `.env.example` to `.env` and fill in `OPENAI_API_KEY` or `GEMINI_API_KEY`.
2. Run `python run_pipeline.py --provider openai` or `python run_pipeline.py --provider gemini`.

Artifacts generated:
* `pipeline/extracted_graph.json` (Structured JSON graph)
* `pipeline/extracted_graph.cypher` (Ready-to-run Neo4j Cypher batch import script)

---

## Graph Topology & Color Scheme

| Node Group | Color | Semantics |
| :--- | :--- | :--- |
| **Repository** | Cyan `#38bdf8` | Target codebase root |
| **Function** | Electric Blue `#60a5fa` | Execution call-site / entrypoint |
| **Dependency** | Amber `#fbbf24` | 3rd party package or trans-dependency |
| **CVE** | Crimson `#ef4444` | Identified vulnerability (CVSS scored) |
| **Exploit** | Blood Red `#dc2626` | Realizable adversary capability (e.g. RCE) |
| **Asset** | Purple `#a855f7` | Crown jewel database / credential vault |
| **Safe** | Emerald `#10b981` | Mitigated / hardened perimeter nodes |

---

## Preset Exploit Scenarios Available in UI

1. **auth-gateway (JWT RCE):** Unauthenticated login -> `jsonwebtoken@8.5.1` -> `CVE-2022-23529` (CVSS 9.8) -> AWS IAM Secret Vault Exfiltration.
2. **log-pipeline (Log4Shell):** Ingest Controller -> `log4j-core@2.14.1` -> `CVE-2021-44228` (CVSS 10.0) -> Remote JNDI Injection -> K8s Cluster Sovereign Token.
3. **config-engine (Prototype Pollution):** Request Body Merging -> `lodash@4.17.15` -> `CVE-2019-10744` (CVSS 9.1) -> Global Admin Escalation.
4. **tls-gateway (Heartbleed):** Network Gateway -> `OpenSSL@1.0.1f` -> `CVE-2014-0160` (CVSS 7.5) -> Memory Dump & Private Key Exposure.
