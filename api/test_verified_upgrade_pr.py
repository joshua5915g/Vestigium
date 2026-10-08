import pytest
from fastapi import HTTPException

from app.routes.upgrade_pr import require_remediation_key
from app.services import verified_upgrade_pr as upgrade_service
from app.services.verified_upgrade_pr import UpgradeRequestError


def test_updates_one_exact_pin_and_preserves_crlf_and_comment():
    original = "requests==2.31.0 ; python_version >= '3.8'  # pinned\r\nflask==3.0.0\r\n"

    result = upgrade_service.update_pinned_requirement(
        original,
        "requests",
        "2.31.0",
        "2.32.0",
    )

    assert result == "requests==2.32.0 ; python_version >= '3.8'  # pinned\r\nflask==3.0.0\r\n"

    extras = upgrade_service.update_pinned_requirement(
        "httpx[http2]==0.27.0 --hash=sha256:abcd\n",
        "httpx",
        "0.27.0",
        "0.28.0",
    )
    assert extras == "httpx[http2]==0.28.0 --hash=sha256:abcd\n"


def test_rejects_stale_or_ambiguous_pins():
    with pytest.raises(UpgradeRequestError, match="not scanned version"):
        upgrade_service.update_pinned_requirement(
            "requests==2.32.0\n", "requests", "2.31.0", "2.33.0"
        )

    with pytest.raises(UpgradeRequestError, match="found 2"):
        upgrade_service.update_pinned_requirement(
            "requests==2.31.0\nRequests==2.31.0\n",
            "requests",
            "2.31.0",
            "2.32.0",
        )


@pytest.mark.parametrize(
    "path",
    ["../requirements.txt", "/requirements.txt", "package.json", "src/../secret.txt"],
)
def test_rejects_unsafe_or_unsupported_manifest_paths(path):
    with pytest.raises(UpgradeRequestError, match="requirements.txt"):
        upgrade_service._safe_requirement_path(path)


def test_revalidates_advisory_alias_and_fixed_version(monkeypatch):
    monkeypatch.setattr(
        upgrade_service,
        "query_osv",
        lambda _dependencies: [{
            "id": "GHSA-example-1234",
            "aliases": ["CVE-2024-0001"],
            "fixed_versions": ["2.32.0"],
        }],
    )

    upgrade_service._verify_osv_advisory("CVE-2024-0001", "requests", "2.31.0", "2.32.0")

    with pytest.raises(UpgradeRequestError, match="did not confirm"):
        upgrade_service._verify_osv_advisory("CVE-2024-0001", "requests", "2.31.0", "2.33.0")


def test_requires_an_explicit_github_repository_allowlist(monkeypatch):
    monkeypatch.delenv("GITHUB_REMEDIATION_REPOS", raising=False)
    with pytest.raises(upgrade_service.UpgradeConfigurationError, match="GITHUB_REMEDIATION_REPOS"):
        upgrade_service._ensure_allowed_repository("owner/repo")

    monkeypatch.setenv("GITHUB_REMEDIATION_REPOS", "owner/repo")
    upgrade_service._ensure_allowed_repository("OWNER/REPO")
    with pytest.raises(upgrade_service.UpgradeTargetNotAllowedError):
        upgrade_service._ensure_allowed_repository("other/repo")


def test_remediation_api_key_is_required_and_compared(monkeypatch):
    secret = "a" * 32
    monkeypatch.setenv("REMEDIATION_API_KEY", secret)
    require_remediation_key(secret)

    with pytest.raises(HTTPException) as error:
        require_remediation_key("wrong")
    assert error.value.status_code == 401

    monkeypatch.setenv("REMEDIATION_API_KEY", "short")
    with pytest.raises(HTTPException) as error:
        require_remediation_key(secret)
    assert error.value.status_code == 503


def test_ci_status_is_verified_only_after_successful_check():
    assert upgrade_service._checks_state([], []) == "not_configured"
    assert upgrade_service._checks_state(
        [{"status": "in_progress", "conclusion": None}], []
    ) == "pending"
    assert upgrade_service._checks_state(
        [{"status": "completed", "conclusion": "failure"}], []
    ) == "failed"
    assert upgrade_service._checks_state(
        [{"status": "completed", "conclusion": "success"}], []
    ) == "verified"
    assert upgrade_service._checks_state(
        [{"status": "completed", "conclusion": "skipped"}], []
    ) == "not_configured"
