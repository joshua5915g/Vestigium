from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.analysis import router as analysis_router

from contextlib import asynccontextmanager
from graph_db import graph_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize Neo4j constraints and ingest Phase 2 threat graph
    graph_db.setup_constraints()
    graph_db.ingest_extracted_graph()
    yield
    graph_db.close()

app = FastAPI(
    title="Vestigium API",
    description="GraphRAG-powered Vulnerability Cartographer Backend Service",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis_router)

from app.models.schema import SynthesisRequest, SynthesisResponse, RemediationRequest, RemediationResponse
from synthesizer import synthesizer
from healing_agent import healing_agent

@app.post("/api/synthesize", response_model=SynthesisResponse, tags=["Synthesis"])
async def synthesize_direct(request: SynthesisRequest) -> SynthesisResponse:
    return synthesizer.synthesize(request)

@app.post("/api/remediate", response_model=RemediationResponse, tags=["Self-Healing CI/CD"])
async def remediate_direct(request: RemediationRequest) -> RemediationResponse:
    return healing_agent.remediate(request)

@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "Vestigium Cartographer API",
        "status": "online",
        "version": "1.0.0",
        "endpoints": {
            "analyze": "POST /api/v1/analyze",
            "docs": "/docs"
        }
    }

@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
