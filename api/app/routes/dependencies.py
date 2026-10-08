import os

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.dependency_scanner import scan_directory


router = APIRouter(prefix="/api/v1/dependencies", tags=["Dependency Security"])


class DependencyScanRequest(BaseModel):
    target: str = Field(..., min_length=1, max_length=2048, description="Local project directory to scan")


@router.post("/scan")
async def scan_dependencies(request: DependencyScanRequest):
    default_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    allowed_root = os.path.realpath(os.getenv("SCAN_ALLOWED_ROOT", default_root))
    target = os.path.realpath(os.path.join(allowed_root, request.target))

    try:
        if os.path.commonpath((allowed_root, target)) != allowed_root:
            raise HTTPException(status_code=400, detail="Scan target must be within SCAN_ALLOWED_ROOT.")
    except ValueError as error:
        raise HTTPException(status_code=400, detail="Scan target must be within SCAN_ALLOWED_ROOT.") from error

    try:
        return scan_directory(target)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except RuntimeError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error
