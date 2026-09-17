import json
from typing import List, Dict, Any
from schema import KnowledgeGraphExtraction, ExtractedNode, ExtractedEdge

class GraphFormatter:
    """
    Normalizes, deduplicates, and formats extracted knowledge graphs
    for JSON storage and Neo4j Cypher batch import.
    """

    @staticmethod
    def merge_extractions(extractions: List[KnowledgeGraphExtraction]) -> Dict[str, Any]:
        """
        Merges multiple CVE graph extractions into a unified knowledge graph,
        deduplicating common software, weakness, and threat nodes.
        """
        nodes_by_id: Dict[str, Dict[str, Any]] = {}
        edges_set: set[tuple[str, str, str]] = set()
        merged_edges: List[Dict[str, Any]] = []
        cves_indexed: List[str] = []

        for ext in extractions:
            if ext.cve_id:
                cves_indexed.append(ext.cve_id)

            for node in ext.nodes:
                if node.id not in nodes_by_id:
                    nodes_by_id[node.id] = {
                        "id": node.id,
                        "name": node.name,
                        "label": node.label,
                        "properties": dict(node.properties)
                    }
                else:
                    # Merge properties
                    nodes_by_id[node.id]["properties"].update(node.properties)

            for edge in ext.edges:
                edge_key = (edge.source, edge.target, edge.relationship_type)
                if edge_key not in edges_set:
                    edges_set.add(edge_key)
                    merged_edges.append({
                        "source": edge.source,
                        "target": edge.target,
                        "relationship_type": edge.relationship_type,
                        "properties": edge.properties
                    })

        # Calculate ontology distribution
        label_counts: Dict[str, int] = {}
        for n in nodes_by_id.values():
            lbl = n["label"]
            label_counts[lbl] = label_counts.get(lbl, 0) + 1

        unified_graph = {
            "metadata": {
                "cves_analyzed": cves_indexed,
                "total_nodes": len(nodes_by_id),
                "total_edges": len(merged_edges),
                "label_distribution": label_counts,
                "schema_version": "2.0.0"
            },
            "nodes": list(nodes_by_id.values()),
            "edges": merged_edges
        }

        return unified_graph

    @staticmethod
    def save_to_json(graph_data: Dict[str, Any], filepath: str) -> None:
        """
        Persists graph data into formatted JSON.
        """
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(graph_data, f, indent=2, ensure_ascii=False)
        print(f"[OK] Knowledge Graph successfully saved to: {filepath}")

    @staticmethod
    def export_to_cypher(graph_data: Dict[str, Any], filepath: str) -> None:
        """
        Generates ready-to-run Cypher batch script for direct import into Neo4j.
        """
        cypher_lines: List[str] = [
            "// ======================================================",
            "// Vestigium Phase 2 - Neo4j Automated Knowledge Graph Import",
            "// ======================================================",
            "",
            "// 1. Create Unique Constraints",
            "CREATE CONSTRAINT unique_node_id IF NOT EXISTS FOR (n:Entity) REQUIRE n.id IS UNIQUE;",
            ""
        ]

        # Nodes
        cypher_lines.append("// 2. Merge Nodes")
        for node in graph_data.get("nodes", []):
            node_id = node["id"].replace("'", "\\'")
            name = node["name"].replace("'", "\\'")
            label = node["label"]
            props = json.dumps(node.get("properties", {})).replace("'", "\\'")
            
            cypher_lines.append(
                f"MERGE (n:{label} {{id: '{node_id}'}}) "
                f"ON CREATE SET n.name = '{name}', n.properties = '{props}', n:Entity "
                f"ON MATCH SET n.properties = '{props}';"
            )

        cypher_lines.append("")
        cypher_lines.append("// 3. Merge Edges")
        for edge in graph_data.get("edges", []):
            src = edge["source"].replace("'", "\\'")
            tgt = edge["target"].replace("'", "\\'")
            rel = edge["relationship_type"]
            cypher_lines.append(
                f"MATCH (s:Entity {{id: '{src}'}}), (t:Entity {{id: '{tgt}'}}) "
                f"MERGE (s)-[:{rel}]->(t);"
            )

        with open(filepath, "w", encoding="utf-8") as f:
            f.write("\n".join(cypher_lines) + "\n")
        print(f"[OK] Neo4j Cypher script successfully saved to: {filepath}")
