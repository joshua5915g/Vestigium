from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field, model_validator

NodeLabel = Literal[
    "Software",
    "Vulnerability",
    "Weakness",
    "AttackVector",
    "Impact",
    "Mitigation",
    "ThreatActor"
]

RelationshipType = Literal[
    "AFFECTS",
    "EXEMPLIFIES",
    "LEADS_TO",
    "EXPLOITED_VIA",
    "MITIGATED_BY",
    "ATTEMPTED_BY",
    "DEPENDS_ON"
]

class ExtractedNode(BaseModel):
    id: str = Field(..., description="Unique slugified identifier (e.g. 'software-log4j-core', 'cve-2021-44228')")
    name: str = Field(..., description="Canonical human-readable display name")
    label: NodeLabel = Field(..., description="Ontological category of the node")
    properties: Dict[str, Any] = Field(default_factory=dict, description="Arbitrary attributes like cvss, cwe_id, version, severity")

class ExtractedEdge(BaseModel):
    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    relationship_type: RelationshipType = Field(..., description="Ontological relationship type in UPPERCASE")
    properties: Dict[str, Any] = Field(default_factory=dict, description="Metadata such as confidence, protocol, scope")

class KnowledgeGraphExtraction(BaseModel):
    cve_id: Optional[str] = Field(default=None, description="Primary CVE identifier analyzed")
    summary: str = Field(..., description="One-sentence executive summary of the threat")
    nodes: List[ExtractedNode] = Field(default_factory=list, description="Extracted knowledge graph nodes")
    edges: List[ExtractedEdge] = Field(default_factory=list, description="Directed ontological relationships")

    @model_validator(mode="after")
    def validate_referential_integrity(self) -> "KnowledgeGraphExtraction":
        """
        Guarantees graph referential integrity:
        Every edge's source and target must exist in the node set.
        Prunes dangling edges to ensure Neo4j batch consistency.
        """
        node_ids = {n.id for n in self.nodes}
        valid_edges: List[ExtractedEdge] = []

        for edge in self.edges:
            if edge.source in node_ids and edge.target in node_ids:
                valid_edges.append(edge)
            else:
                # Log or skip dangling relationship
                pass
        
        self.edges = valid_edges
        return self
