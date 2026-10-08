import hmac
import os

from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel, Field

from app.services.verified_upgrade_pr import (
    UpgradeConfigurationError,
    UpgradeRequestError,
    UpgradeTargetNotAllowedError,
    VerifiedUpgradePR,
)


router = APIRouter(prefix="/api/v1/dependencies", tags=["Remediation Pull Requests"])


def require_remediation_key(
    provided: str | None = Header(default=None, alias="X-Remediation-Key"),
) -> None:
    expected = os.getenv("REMEDIATION_API_KEY", "")
    if len(expected) < 32:
        raise HTTPException(
            status_code=503,
            detail="Configure a REMEDIATION_API_KEY of at least 32 characters to enable upgrade PRs.",
        )
    if not provided or not hmac.compare_digest(provided, expected):
        raise HTTPException(status_code=401, detail="A valid remediation API key is required.")


class UpgradePullRequestRequest(BaseModel):
    target: str = Field(..., min_length=3, max_length=200, description="GitHub owner/repository")
    manifest_path: str = Field(..., min_length=1, max_length=1024)
    advisory_id: str = Field(..., min_length=1, max_length=100)
    package_name: str = Field(..., min_length=1, max_length=256)
    current_version: str = Field(..., min_length=1, max_length=128)
    fixed_version: str = Field(..., min_length=1, max_length=128)


class UpgradePullRequestResponse(BaseModel):
    target: str
    advisory_id: str
    package: str
    current_version: str
    fixed_version: str
    manifest_path: str
    pull_request_number: int
    pull_request_url: str
    branch: str
    checks_state: str
    message: str


@router.post(
    "/upgrade-pr",
    response_model=UpgradePullRequestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Open an OSV-validated upgrade pull request for a pinned Python requirement",
)
def create_upgrade_pull_request(
    request: UpgradePullRequestRequest,
    _: None = Depends(require_remediation_key),
):
    try:
        return VerifiedUpgradePR().create(**request.model_dump())
    except UpgradeTargetNotAllowedError as error:
        raise HTTPException(status_code=403, detail=str(error)) from error
    except UpgradeConfigurationError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except UpgradeRequestError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except RuntimeError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error


@router.get(
    "/{owner}/{repo}/pull-requests/{pull_request_number}/checks",
    summary="Check whether GitHub CI passed for a Vestigium upgrade pull request",
)
def check_upgrade_pull_request(
    owner: str,
    repo: str,
    pull_request_number: int,
    _: None = Depends(require_remediation_key),
):
    try:
        return VerifiedUpgradePR().check_status(f"{owner}/{repo}", pull_request_number)
    except UpgradeTargetNotAllowedError as error:
        raise HTTPException(status_code=403, detail=str(error)) from error
    except UpgradeConfigurationError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except UpgradeRequestError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except RuntimeError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error
