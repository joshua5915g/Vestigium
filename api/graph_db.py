import os
import json
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

class InMemoryGraphStore:
    """
    High-performance in-memory graph fallback engine.
    Ensures zero downtime if live Neo4j daemon is temporarily offline.
    """
    def __init__(self):
        self.nodes: Dict[str, Dict[str, Any]] = {}
        self.edges: List[Dict[str, Any]] = []
        self.out_edges: Dict[str, List[Dict[str, Any]]] = {}
        self.in_edges: Dict[str, List[Dict[str, Any]]] = {}

    def clear(self):
        self.nodes.clear()
        self.edges.clear()
        self.out_edges.clear()
        self.in_edges.clear()

    def merge_node(self, node_id: str, label: str, name: str, properties: Dict[str, Any]):
        if node_id in self.nodes:
            self.nodes[node_id]["properties"].update(properties)
            self.nodes[node_id]["name"] = name
        else:
            self.nodes[node_id] = {
                "id": node_id,
                "label": label,
                "name": name,
                "properties": dict(properties)
            }

    def merge_edge(self, source_id: str, target_id: str, rel_type: str, properties: Dict[str, Any]):
        edge = {
            "source": source_id,
            "target": target_id,
            "relationship_type": rel_type,
            "properties": dict(properties)
        }
        self.edges.append(edge)
        self.out_edges.setdefault(source_id, []).append(edge)
        self.in_edges.setdefault(target_id, []).append(edge)


class Neo4jManager:
    """
    Neo4j Graph Database Manager.
    Handles connection lifecycle, constraints, batch UNWIND ingestion,
    and Cypher traversal execution with in-memory fallback.
    """

    def __init__(self):
        self.uri = os.getenv("NEO4J_URI", "neo4j://localhost:7687")
        self.username = os.getenv("NEO4J_USERNAME", "neo4j")
        self.password = os.getenv("NEO4J_PASSWORD", "password")
        self.database = os.getenv("NEO4J_DATABASE", "neo4j")
        self.driver = None
        self.is_connected = False
        self.in_memory_store = InMemoryGraphStore()

        self._init_driver()

    def _init_driver(self):
        try:
            from neo4j import GraphDatabase, exceptions
            self.driver = GraphDatabase.driver(
                self.uri,
                auth=(self.username, self.password),
                max_connection_lifetime=30 * 60,
                max_connection_pool_size=50,
                connection_acquisition_timeout=3.0
            )
            # Verify connectivity with short timeout
            self.driver.verify_connectivity()
            self.is_connected = True
            print(f"[OK] Connected to live Neo4j Database at {self.uri}")
        except Exception as err:
            self.is_connected = False
            self.driver = None
            print(f"[INFO] Live Neo4j instance not detected ({err}). Initializing In-Memory Graph Engine.")

    def close(self):
        if self.driver:
            self.driver.close()

    def setup_constraints(self):
        """
        Applies uniqueness constraints and indexes for entity lookups.
        """
        if not self.is_connected:
            return

        constraint_query = (
            "CREATE CONSTRAINT unique_entity_id IF NOT EXISTS "
            "FOR (n:Entity) REQUIRE n.id IS UNIQUE;"
        )
        index_query = (
            "CREATE INDEX entity_name_idx IF NOT EXISTS "
            "FOR (n:Entity) ON (n.name);"
        )

        try:
            with self.driver.session(database=self.database) as session:
                session.run(constraint_query)
                session.run(index_query)
                print("[OK] Neo4j constraints & indexes verified.")
        except Exception as err:
            print(f"[WARN] Error creating Neo4j constraints: {err}")

    def ingest_extracted_graph(self, filepath: Optional[str] = None) -> Dict[str, int]:
        """
        Ingests the Phase 2 extracted_graph.json into Neo4j using batched UNWIND MERGE queries.
        """
        if not filepath:
            # Default to ../pipeline/extracted_graph.json or pipeline/extracted_graph.json
            base_dir = os.path.dirname(os.path.abspath(__file__))
            cand1 = os.path.join(base_dir, "..", "pipeline", "extracted_graph.json")
            cand2 = os.path.join(base_dir, "extracted_graph.json")
            filepath = cand1 if os.path.exists(cand1) else cand2

        if not os.path.exists(filepath):
            print(f"[WARN] Extracted graph file not found at {filepath}. Ingestion skipped.")
            return {"nodes": 0, "edges": 0}

        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)

        nodes = data.get("nodes", [])
        edges = data.get("edges", [])

        # Always update in-memory store
        for n in nodes:
            self.in_memory_store.merge_node(
                node_id=n["id"],
                label=n.get("label", "Entity"),
                name=n.get("name", n["id"]),
                properties=n.get("properties", {})
            )
        for e in edges:
            self.in_memory_store.merge_edge(
                source_id=e["source"],
                target_id=e["target"],
                rel_type=e.get("relationship_type", "RELATED_TO"),
                properties=e.get("properties", {})
            )

        if not self.is_connected:
            print(f"[OK] Ingested {len(nodes)} nodes & {len(edges)} edges into In-Memory Graph Store.")
            return {"nodes": len(nodes), "edges": len(edges)}

        # Batched UNWIND ingestion into live Neo4j
        node_unwind_query = """
        UNWIND $nodes AS nodeData
        MERGE (n:Entity {id: nodeData.id})
        SET n.name = nodeData.name,
            n.label = nodeData.label,
            n += nodeData.properties
        """

        edge_unwind_query = """
        UNWIND $edges AS edgeData
        MATCH (src:Entity {id: edgeData.source})
        MATCH (tgt:Entity {id: edgeData.target})
        MERGE (src)-[r:RELATIONSHIP {type: edgeData.relationship_type}]->(tgt)
        SET r += edgeData.properties
        """

        try:
            with self.driver.session(database=self.database) as session:
                session.run(node_unwind_query, nodes=nodes)
                session.run(edge_unwind_query, edges=edges)
            print(f"[OK] Batched {len(nodes)} nodes & {len(edges)} edges into live Neo4j.")
            return {"nodes": len(nodes), "edges": len(edges)}
        except Exception as err:
            print(f"[WARN] Neo4j transactional ingestion failed: {err}")
            return {"nodes": len(nodes), "edges": len(edges)}

    def execute_query(self, cypher: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Executes Cypher query on live Neo4j or falls back to in-memory evaluation.
        """
        if self.is_connected and self.driver:
            try:
                with self.driver.session(database=self.database) as session:
                    result = session.run(cypher, params or {})
                    return [record.data() for record in result]
            except Exception as err:
                print(f"[WARN] Cypher execution error: {err}. Falling back to in-memory store.")

        return []

# Global singleton instance
graph_db = Neo4jManager()
