from fastapi import APIRouter, HTTPException, status
import os
from app.models.schema import (
    AnalysisRequest, 
    AnalysisResponse, 
    SynthesisRequest, 
    SynthesisResponse,
    RemediationRequest,
    RemediationResponse
)
from app.services.cartographer import CartographerService
from traversal import AttackPathFinder
from graph_db import graph_db

router = APIRouter(prefix="/api/v1", tags=["Analysis"])

@router.post(
    "/analyze",
    response_model=AnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze target repository, local path or package attack graph",
    description="Traverses dependencies, code execution call-sites, and CVE blast radiuses using AST parsing and Neo4j graph traversal."
)
async def analyze_target(request: AnalysisRequest) -> AnalysisResponse:
    if not request.target or not request.target.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Target repository URL or package name cannot be empty."
        )
    
    target_clean = request.target.strip()

    # If the target exists on the local filesystem or has target_type 'ast' / 'local', run AST parser & graph reachability
    if os.path.exists(target_clean) or request.target_type in ("ast", "local"):
        return AttackPathFinder.analyze_project_reachability(target_clean)

    # Otherwise run Cartographer simulation scenarios
    return await CartographerService.analyze_target(request)

@router.post(
    "/ast/scan",
    response_model=AnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Run Static AST code analysis and Neo4j reachability on local project"
)
async def scan_local_ast(request: AnalysisRequest) -> AnalysisResponse:
    return AttackPathFinder.analyze_project_reachability(request.target.strip())

@router.post(
    "/graph/ingest",
    status_code=status.HTTP_200_OK,
    summary="Ingest Phase 2 extracted_graph.json into Neo4j"
)
async def ingest_graph_data():
    result = graph_db.ingest_extracted_graph()
    return {
        "status": "success",
        "neo4j_connected": graph_db.is_connected,
        "nodes_ingested": result["nodes"],
        "edges_ingested": result["edges"]
    }

@router.post(
    "/synthesize",
    response_model=SynthesisResponse,
    status_code=status.HTTP_200_OK,
    summary="Synthesize grounded threat report and code remediation patch"
)
async def synthesize_threat_remediation(request: SynthesisRequest) -> SynthesisResponse:
    from synthesizer import synthesizer
    return synthesizer.synthesize(request)

@router.post(
    "/remediate",
    response_model=RemediationResponse,
    status_code=status.HTTP_200_OK,
    summary="Execute Self-Healing CI/CD verification, sandbox tests, and GitHub PR creation"
)
async def remediate_vulnerability(request: RemediationRequest) -> RemediationResponse:
    from healing_agent import healing_agent
    return healing_agent.remediate(request)



