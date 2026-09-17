import os
import sys
import argparse
from typing import List

from fetcher import NVDFetcher
from extractor import LLMExtractor
from formatter import GraphFormatter
from schema import KnowledgeGraphExtraction

def main():
    parser = argparse.ArgumentParser(
        description="Vestigium Phase 2 - LLM Threat Intelligence Knowledge Graph Extraction Pipeline"
    )
    parser.add_argument(
        "--provider",
        choices=["mock", "openai", "gemini"],
        default=None,
        help="LLM provider for extraction (defaults to .env LLM_PROVIDER or 'mock')"
    )
    parser.add_argument(
        "--live-nvd",
        action="store_true",
        default=False,
        help="Query the live National Vulnerability Database API instead of the benchmark corpus"
    )
    parser.add_argument(
        "--count",
        type=int,
        default=4,
        help="Number of CVE reports to extract (default: 4)"
    )
    parser.add_argument(
        "--keyword",
        type=str,
        default=None,
        help="Optional keyword filter for NVD search (e.g., 'Log4j', 'RCE', 'injection')"
    )
    parser.add_argument(
        "--output-json",
        type=str,
        default=os.path.join(os.path.dirname(__file__), "extracted_graph.json"),
        help="Destination path for output JSON file"
    )
    parser.add_argument(
        "--output-cypher",
        type=str,
        default=os.path.join(os.path.dirname(__file__), "extracted_graph.cypher"),
        help="Destination path for Neo4j Cypher import script"
    )

    args = parser.parse_args()

    print("\n" + "=" * 65)
    print(" VESTIGIUM // THREAT INTELLIGENCE GRAPH EXTRACTION PIPELINE")
    print("=" * 65)
    print(f"[*] Mode: {'Live NVD API' if args.live_nvd else 'Offline Benchmark Corpus'}")
    print(f"[*] Target Sample Count: {args.count}")

    # 1. Fetch Ingestion
    print("\n[Phase 1/3] Ingesting Raw Threat Disclosures...")
    corpus = NVDFetcher.get_cve_corpus(
        use_live_api=args.live_nvd,
        limit=args.count,
        keyword=args.keyword
    )
    print(f"[+] Loaded {len(corpus)} vulnerability report(s) for extraction.")

    # 2. Extract with LLM Engine
    print("\n[Phase 2/3] Extracting Ontological Entities & Semantic Edges...")
    extractor = LLMExtractor(provider=args.provider)
    print(f"[*] Active Extractor Engine: [{extractor.provider.upper()}]")

    extractions: List[KnowledgeGraphExtraction] = []
    for idx, cve in enumerate(corpus, start=1):
        cve_id = cve.get("id", "UNKNOWN")
        print(f"  --> Processing ({idx}/{len(corpus)}): {cve_id}...")
        graph_extraction = extractor.extract_graph(cve)
        extractions.append(graph_extraction)
        print(f"      Extracted {len(graph_extraction.nodes)} nodes, {len(graph_extraction.edges)} relationships.")

    # 3. Merge, Deduplicate & Format
    print("\n[Phase 3/3] Normalizing Graph & Generating Neo4j Ingestion Artifacts...")
    unified_graph = GraphFormatter.merge_extractions(extractions)

    GraphFormatter.save_to_json(unified_graph, args.output_json)
    GraphFormatter.export_to_cypher(unified_graph, args.output_cypher)

    meta = unified_graph["metadata"]
    print("\n" + "-" * 65)
    print(" EXTRACTION PIPELINE METRICS")
    print("-" * 65)
    print(f"  * CVEs Analyzed       : {len(meta['cves_analyzed'])} ({', '.join(meta['cves_analyzed'])})")
    print(f"  * Total Unified Nodes : {meta['total_nodes']}")
    print(f"  * Total Unified Edges : {meta['total_edges']}")
    print(f"  * Entity Distribution :")
    for lbl, count in meta["label_distribution"].items():
        print(f"      - {lbl.ljust(15)} : {count}")
    print("-" * 65)
    print(f"[SUCCESS] Pipeline completed cleanly. Artifacts generated.")
    print("=" * 65 + "\n")

if __name__ == "__main__":
    main()
