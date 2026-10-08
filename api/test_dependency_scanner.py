import asyncio
import json

import pytest

from app.routes import dependencies as dependency_routes
from app.services import dependency_scanner


def test_discovers_exact_npm_and_python_versions(tmp_path):
    (tmp_path / "package-lock.json").write_text(
        json.dumps({
            "lockfileVersion": 3,
            "packages": {
                "": {"name": "sample"},
                "node_modules/lodash": {"version": "4.17.20"},
                "node_modules/@scope/lib": {"name": "@scope/lib", "version": "1.2.3"},
            },
        }),
        encoding="utf-8",
    )
    (tmp_path / "requirements.txt").write_text(
        "requests==2.31.0\n"
        "httpx[http2]==0.27.0 --hash=sha256:abcd\n"
        "urllib3>=2.0\n"
        "# comment\n",
        encoding="utf-8",
    )
    (tmp_path / "node_modules" / "ignored").mkdir(parents=True)
    (tmp_path / "node_modules" / "ignored" / "package-lock.json").write_text(
        "not json", encoding="utf-8"
    )

    found = dependency_scanner.discover_dependencies(str(tmp_path))
    by_name = {(item["ecosystem"], item["name"]): item["version"] for item in found}

    assert by_name == {
        ("PyPI", "requests"): "2.31.0",
        ("PyPI", "httpx"): "0.27.0",
        ("npm", "@scope/lib"): "1.2.3",
        ("npm", "lodash"): "4.17.20",
    }


def test_discovers_legacy_npm_lock_dependencies(tmp_path):
    lockfile = tmp_path / "package-lock.json"
    lockfile.write_text(json.dumps({
        "lockfileVersion": 1,
        "dependencies": {
            "left-pad": {
                "version": "1.3.0",
                "dependencies": {"minimist": {"version": "1.2.5"}},
            },
        },
    }), encoding="utf-8")

    found = dependency_scanner._parse_npm_lock(str(lockfile))

    assert {(item["name"], item["version"]) for item in found} == {
        ("left-pad", "1.3.0"),
        ("minimist", "1.2.5"),
    }


def test_scan_reports_osv_findings_for_exact_versions(tmp_path, monkeypatch):
    (tmp_path / "requirements.txt").write_text("requests==2.31.0\n", encoding="utf-8")
    vulnerability = {
        "id": "GHSA-test-1234",
        "aliases": ["CVE-2024-0001"],
        "summary": "Test advisory",
        "database_specific": {"severity": "HIGH"},
        "affected": [{
            "package": {"name": "requests"},
            "ranges": [{"events": [{"introduced": "0"}, {"fixed": "2.32.0"}]}],
        }],
    }
    monkeypatch.setattr(
        dependency_scanner,
        "query_osv",
        lambda dependencies: [{
            "id": vulnerability["id"],
            "aliases": vulnerability["aliases"],
            "summary": vulnerability["summary"],
            "severity": dependency_scanner._severity(vulnerability),
            "dependency": dependencies[0]["name"],
            "version": dependencies[0]["version"],
            "ecosystem": dependencies[0]["ecosystem"],
            "fixed_versions": dependency_scanner._fixed_versions(vulnerability, "requests"),
            "manifests": dependencies[0]["manifests"],
            "source": "OSV",
        }],
    )

    result = dependency_scanner.scan_directory(str(tmp_path))

    assert result["dependency_count"] == 1
    assert result["finding_count"] == 1
    assert result["findings"][0]["severity"] == "HIGH"
    assert result["findings"][0]["fixed_versions"] == ["2.32.0"]


def test_rejects_non_directory_target(tmp_path):
    target = tmp_path / "requirements.txt"
    target.write_text("requests==2.31.0", encoding="utf-8")

    with pytest.raises(ValueError, match="existing directory"):
        dependency_scanner.discover_dependencies(str(target))


def test_scan_route_limits_targets_to_configured_root(tmp_path, monkeypatch):
    monkeypatch.setenv("SCAN_ALLOWED_ROOT", str(tmp_path))
    monkeypatch.setattr(
        dependency_routes,
        "scan_directory",
        lambda path: {"target": path, "finding_count": 0},
    )

    result = asyncio.run(dependency_routes.scan_dependencies(
        dependency_routes.DependencyScanRequest(target=".")
    ))
    assert result["target"] == str(tmp_path)

    with pytest.raises(dependency_routes.HTTPException) as error:
        asyncio.run(dependency_routes.scan_dependencies(
            dependency_routes.DependencyScanRequest(target="../outside")
        ))
    assert error.value.status_code == 400
