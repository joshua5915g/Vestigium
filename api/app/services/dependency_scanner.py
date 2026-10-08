import argparse
import json
import os
import re
import sys
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


OSV_QUERY_URL = "https://api.osv.dev/v1/querybatch"
IGNORED_DIRECTORIES = {
    ".git",
    ".next",
    ".venv",
    "__pycache__",
    "build",
    "dist",
    "node_modules",
    "venv",
}
SEVERITY_ORDER = {"UNKNOWN": 0, "LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}


def _parse_requirements(path: str) -> list[dict[str, str]]:
    dependencies = []
    requirement_pattern = re.compile(
        r"^\s*([A-Za-z0-9_.-]+)\s*==\s*([A-Za-z0-9_.+-]+)(?:\s*;.*)?$"
    )
    with open(path, encoding="utf-8") as requirements:
        for line in requirements:
            match = requirement_pattern.match(line.split("#", 1)[0])
            if match:
                dependencies.append({
                    "name": match.group(1),
                    "version": match.group(2),
                    "ecosystem": "PyPI",
                    "manifest": path,
                })
    return dependencies


def _parse_npm_lock(path: str) -> list[dict[str, str]]:
    with open(path, encoding="utf-8") as lockfile:
        data = json.load(lockfile)

    dependencies = []
    packages = data.get("packages")
    if isinstance(packages, dict):
        for package_path, package in packages.items():
            if not package_path or not isinstance(package, dict):
                continue
            name = package.get("name")
            if not name:
                match = re.search(r"(?:^|/)node_modules/(.+)$", package_path)
                name = match.group(1) if match else None
            version = package.get("version")
            if name and version:
                dependencies.append({
                    "name": name,
                    "version": str(version),
                    "ecosystem": "npm",
                    "manifest": path,
                })
    else:
        def visit(entries: Any) -> None:
            if not isinstance(entries, dict):
                return
            for name, package in entries.items():
                if not isinstance(package, dict):
                    continue
                version = package.get("version")
                if version:
                    dependencies.append({
                        "name": name,
                        "version": str(version),
                        "ecosystem": "npm",
                        "manifest": path,
                    })
                visit(package.get("dependencies"))

        visit(data.get("dependencies"))
    return dependencies


def discover_dependencies(root: str) -> list[dict[str, str]]:
    root_path = os.path.realpath(root)
    if not os.path.isdir(root_path):
        raise ValueError(f"Scan target must be an existing directory: {root}")

    found: dict[tuple[str, str, str], dict[str, Any]] = {}
    for current, directories, files in os.walk(root_path):
        directories[:] = sorted(
            directory for directory in directories if directory not in IGNORED_DIRECTORIES
        )
        for filename in files:
            path = os.path.join(current, filename)
            try:
                if filename == "package-lock.json":
                    parsed = _parse_npm_lock(path)
                elif filename == "requirements.txt":
                    parsed = _parse_requirements(path)
                else:
                    continue
            except (OSError, json.JSONDecodeError) as error:
                raise ValueError(f"Could not parse dependency manifest {path}: {error}") from error

            for dependency in parsed:
                key = (
                    dependency["ecosystem"],
                    dependency["name"].lower(),
                    dependency["version"],
                )
                if key in found:
                    found[key]["manifests"].add(os.path.relpath(path, root_path))
                else:
                    found[key] = {
                        **dependency,
                        "manifests": {os.path.relpath(path, root_path)},
                    }

    result = []
    for dependency in found.values():
        result.append({
            "name": dependency["name"],
            "version": dependency["version"],
            "ecosystem": dependency["ecosystem"],
            "manifests": sorted(dependency["manifests"]),
        })
    return sorted(result, key=lambda item: (item["ecosystem"], item["name"].lower(), item["version"]))


def _severity(vulnerability: dict[str, Any]) -> str:
    database_severity = vulnerability.get("database_specific", {}).get("severity")
    if isinstance(database_severity, str):
        normalized = database_severity.upper()
        if normalized in SEVERITY_ORDER:
            return normalized

    for severity in vulnerability.get("severity", []):
        score = severity.get("score")
        if not isinstance(score, str):
            continue
        numeric = re.search(r"(?:^|/)(\d{1,2}(?:\.\d+)?)$", score)
        if numeric:
            value = float(numeric.group(1))
            if value >= 9.0:
                return "CRITICAL"
            if value >= 7.0:
                return "HIGH"
            if value >= 4.0:
                return "MEDIUM"
            return "LOW"
    return "UNKNOWN"


def _fixed_versions(vulnerability: dict[str, Any], package_name: str) -> list[str]:
    versions = set()
    for affected in vulnerability.get("affected", []):
        package = affected.get("package", {})
        if package.get("name", "").lower() != package_name.lower():
            continue
        for version_range in affected.get("ranges", []):
            for event in version_range.get("events", []):
                fixed = event.get("fixed")
                if fixed:
                    versions.add(str(fixed))
    return sorted(versions)


def query_osv(dependencies: list[dict[str, str]]) -> list[dict[str, Any]]:
    findings = []
    for start in range(0, len(dependencies), 100):
        batch = dependencies[start:start + 100]
        queries = [
            {
                "package": {"name": item["name"], "ecosystem": item["ecosystem"]},
                "version": item["version"],
            }
            for item in batch
        ]
        request = Request(
            OSV_QUERY_URL,
            data=json.dumps({"queries": queries}).encode("utf-8"),
            headers={"Content-Type": "application/json", "User-Agent": "Vestigium-Dependency-Scanner"},
            method="POST",
        )
        try:
            with urlopen(request, timeout=20) as response:
                results = json.loads(response.read().decode("utf-8")).get("results", [])
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as error:
            raise RuntimeError(f"OSV vulnerability query failed: {error}") from error
        if len(results) != len(batch):
            raise RuntimeError("OSV returned a result count that did not match the submitted dependency batch.")

        for dependency, result in zip(batch, results):
            for vulnerability in result.get("vulns", []):
                findings.append({
                    "id": vulnerability.get("id", "UNKNOWN"),
                    "aliases": vulnerability.get("aliases", []),
                    "summary": vulnerability.get("summary") or vulnerability.get("details", "").splitlines()[0],
                    "severity": _severity(vulnerability),
                    "dependency": dependency["name"],
                    "version": dependency["version"],
                    "ecosystem": dependency["ecosystem"],
                    "fixed_versions": _fixed_versions(vulnerability, dependency["name"]),
                    "manifests": dependency["manifests"],
                    "source": "OSV",
                })
    return findings


def scan_directory(root: str) -> dict[str, Any]:
    dependencies = discover_dependencies(root)
    findings = query_osv(dependencies) if dependencies else []
    return {
        "target": os.path.realpath(root),
        "source": "OSV",
        "dependency_count": len(dependencies),
        "finding_count": len(findings),
        "dependencies": dependencies,
        "findings": findings,
    }


def _cli() -> int:
    parser = argparse.ArgumentParser(description="Scan pinned dependencies and lockfiles against OSV.")
    parser.add_argument("--root", default=".", help="Project directory to scan.")
    parser.add_argument(
        "--fail-on",
        choices=("none", "any", "low", "medium", "high", "critical"),
        default="any",
        help="Exit non-zero when findings at or above this severity are present.",
    )
    args = parser.parse_args()
    try:
        result = scan_directory(args.root)
    except (RuntimeError, ValueError) as error:
        print(f"Dependency scan failed: {error}", file=sys.stderr)
        return 2

    print(json.dumps(result, indent=2))
    if args.fail_on == "none":
        return 0
    if args.fail_on == "any":
        return int(bool(result["findings"]))
    threshold = SEVERITY_ORDER[args.fail_on.upper()]
    return int(any(
        SEVERITY_ORDER.get(finding["severity"], 0) >= threshold
        for finding in result["findings"]
    ))


if __name__ == "__main__":
    raise SystemExit(_cli())
