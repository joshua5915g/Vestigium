import os
import posixpath
import re
import uuid
from typing import Any

from app.services.dependency_scanner import query_osv


OWNER_REPOSITORY_PATTERN = re.compile(r"^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$")
PINNED_REQUIREMENT_PATTERN = re.compile(
    r"^(\s*)([A-Za-z0-9_.-]+)(\[[A-Za-z0-9_,.-]+\])?(\s*==\s*)"
    r"([A-Za-z0-9_.+-]+)(.*)$"
)
MAX_MANIFEST_SIZE = 1_000_000


class UpgradeRequestError(ValueError):
    pass


class UpgradeConfigurationError(RuntimeError):
    pass


class UpgradeTargetNotAllowedError(PermissionError):
    pass


def _ensure_allowed_repository(target: str) -> None:
    configured = os.getenv("GITHUB_REMEDIATION_REPOS", "")
    allowlist = {item.strip().lower() for item in configured.split(",") if item.strip()}
    if not allowlist:
        raise UpgradeConfigurationError(
            "Configure GITHUB_REMEDIATION_REPOS with the repositories allowed for automated upgrade PRs."
        )
    if target.lower() not in allowlist:
        raise UpgradeTargetNotAllowedError("GitHub repository is not in GITHUB_REMEDIATION_REPOS.")


def _safe_requirement_path(path: str) -> str:
    normalized = posixpath.normpath(path.replace("\\", "/"))
    if (
        normalized in ("", ".")
        or normalized.startswith("/")
        or normalized == ".."
        or normalized.startswith("../")
        or posixpath.basename(normalized).lower() != "requirements.txt"
    ):
        raise UpgradeRequestError("Only a repository-relative requirements.txt path is supported.")
    return normalized


def _normalized_package_name(name: str) -> str:
    return re.sub(r"[-_.]+", "-", name).lower()


def update_pinned_requirement(
    content: str,
    package_name: str,
    current_version: str,
    fixed_version: str,
) -> str:
    if not re.fullmatch(r"[A-Za-z0-9_.+-]+", fixed_version):
        raise UpgradeRequestError("OSV returned an invalid fixed version.")

    lines = content.splitlines(keepends=True)
    matching_lines = []
    for index, line in enumerate(lines):
        match = PINNED_REQUIREMENT_PATTERN.match(line.rstrip("\r\n"))
        if match and _normalized_package_name(match.group(2)) == _normalized_package_name(package_name):
            matching_lines.append((index, match))

    if len(matching_lines) != 1:
        raise UpgradeRequestError(
            f"Expected exactly one pinned requirement for {package_name}; found {len(matching_lines)}."
        )

    index, match = matching_lines[0]
    if match.group(5) != current_version:
        raise UpgradeRequestError(
            f"Repository pins {package_name} at {match.group(5)}, not scanned version {current_version}."
        )
    line_ending = "\r\n" if lines[index].endswith("\r\n") else "\n" if lines[index].endswith("\n") else ""
    lines[index] = (
        f"{match.group(1)}{match.group(2)}{match.group(3) or ''}{match.group(4)}{fixed_version}"
        f"{match.group(6)}{line_ending}"
    )
    return "".join(lines)


def _verify_osv_advisory(
    advisory_id: str,
    package_name: str,
    current_version: str,
    fixed_version: str,
) -> None:
    dependency = {
        "name": package_name,
        "version": current_version,
        "ecosystem": "PyPI",
        "manifests": [],
    }
    advisories = query_osv([dependency])
    for advisory in advisories:
        identifiers = {advisory["id"].lower()}
        identifiers.update(alias.lower() for alias in advisory["aliases"])
        if advisory_id.lower() in identifiers and fixed_version in advisory["fixed_versions"]:
            return
    raise UpgradeRequestError(
        "OSV did not confirm this advisory and fixed version for the exact pinned dependency."
    )


def _checks_state(check_runs: list[dict[str, Any]], statuses: list[dict[str, Any]]) -> str:
    if any(
        item["conclusion"] in {"failure", "cancelled", "timed_out", "action_required"}
        for item in check_runs
    ) or any(item["state"] in {"failure", "error"} for item in statuses):
        return "failed"

    if any(
        item["status"] != "completed"
        or item["conclusion"] not in {"success", "neutral", "skipped"}
        for item in check_runs
    ) or any(item["state"] == "pending" for item in statuses):
        return "pending"

    if any(item["conclusion"] == "success" for item in check_runs) or any(
        item["state"] == "success" for item in statuses
    ):
        return "verified"
    return "not_configured"


class VerifiedUpgradePR:
    def __init__(self, token: str | None = None):
        self.token = token or os.getenv("GITHUB_TOKEN")

    def create(
        self,
        target: str,
        manifest_path: str,
        advisory_id: str,
        package_name: str,
        current_version: str,
        fixed_version: str,
    ) -> dict[str, Any]:
        if not OWNER_REPOSITORY_PATTERN.fullmatch(target) or any(
            segment in {".", ".."} for segment in target.split("/")
        ):
            raise UpgradeRequestError("GitHub target must use the owner/repository format.")
        _ensure_allowed_repository(target)
        path = _safe_requirement_path(manifest_path)
        if not re.fullmatch(r"[A-Za-z0-9.-]+", advisory_id):
            raise UpgradeRequestError("Advisory ID contains invalid characters.")
        if not self.token:
            raise UpgradeConfigurationError(
                "Configure GITHUB_TOKEN with repository contents and pull-request write access."
            )
        _verify_osv_advisory(advisory_id, package_name, current_version, fixed_version)

        from github import Auth, Github

        github = Github(auth=Auth.Token(self.token))
        branch = f"vestigium/security/{advisory_id.lower()}-{uuid.uuid4().hex[:10]}"
        repository = None
        branch_created = False
        try:
            repository = github.get_repo(target)
            base_branch = repository.default_branch
            base_sha = repository.get_git_ref(f"heads/{base_branch}").object.sha
            contents = repository.get_contents(path, ref=base_branch)
            if isinstance(contents, list):
                raise UpgradeRequestError("The selected requirements.txt path is not a file.")
            if contents.size > MAX_MANIFEST_SIZE:
                raise UpgradeRequestError("The requirements.txt file is too large to update safely.")

            original = contents.decoded_content.decode("utf-8")
            updated = update_pinned_requirement(
                original,
                package_name,
                current_version,
                fixed_version,
            )
            repository.create_git_ref(ref=f"refs/heads/{branch}", sha=base_sha)
            branch_created = True
            repository.update_file(
                path=path,
                message=f"security: upgrade {package_name} to {fixed_version}",
                content=updated,
                sha=contents.sha,
                branch=branch,
            )
            pull_request = repository.create_pull(
                title=f"security: upgrade {package_name} for {advisory_id}",
                body=(
                    "## Vestigium dependency upgrade\n\n"
                    f"- Advisory: `{advisory_id}` (revalidated against OSV)\n"
                    f"- Package: `{package_name}`\n"
                    f"- Version: `{current_version}` → `{fixed_version}`\n"
                    f"- Manifest: `{path}`\n\n"
                    "This pull request changes only an exact-pinned Python requirement. "
                    "Review the diff and wait for this repository's required CI checks before merging. "
                    "Vestigium does not claim that tests passed until checks are reported as successful."
                ),
                head=branch,
                base=base_branch,
            )
            return {
                "target": target,
                "advisory_id": advisory_id,
                "package": package_name,
                "current_version": current_version,
                "fixed_version": fixed_version,
                "manifest_path": path,
                "pull_request_number": pull_request.number,
                "pull_request_url": pull_request.html_url,
                "branch": branch,
                "checks_state": "pending",
                "message": "Pull request opened. Repository CI checks must pass before the upgrade is verified.",
            }
        except UpgradeRequestError:
            raise
        except Exception as error:
            cleanup_error = None
            if branch_created and repository is not None:
                try:
                    repository.get_git_ref(f"heads/{branch}").delete()
                except Exception as cleanup:
                    cleanup_error = cleanup
            cleanup_message = f" Branch cleanup also failed: {cleanup_error}" if cleanup_error else ""
            raise RuntimeError(
                f"GitHub upgrade pull request could not be created: {error}.{cleanup_message}"
            ) from error
        finally:
            github.close()

    def check_status(self, target: str, pull_request_number: int) -> dict[str, Any]:
        if not OWNER_REPOSITORY_PATTERN.fullmatch(target) or any(
            segment in {".", ".."} for segment in target.split("/")
        ):
            raise UpgradeRequestError("GitHub target must use the owner/repository format.")
        _ensure_allowed_repository(target)
        if not self.token:
            raise UpgradeConfigurationError("Configure GITHUB_TOKEN with repository checks read access.")

        from github import Auth, Github

        github = Github(auth=Auth.Token(self.token))
        try:
            repository = github.get_repo(target)
            pull_request = repository.get_pull(pull_request_number)
            commit = repository.get_commit(pull_request.head.sha)
            check_runs = [
                {
                    "name": check.name,
                    "status": check.status,
                    "conclusion": check.conclusion,
                }
                for check in commit.get_check_runs()
            ]
            statuses = [
                {"context": status.context, "state": status.state}
                for status in commit.get_combined_status().statuses
            ]

            return {
                "target": target,
                "pull_request_number": pull_request_number,
                "pull_request_url": pull_request.html_url,
                "checks_state": _checks_state(check_runs, statuses),
                "check_runs": check_runs,
                "commit_statuses": statuses,
            }
        except Exception as error:
            raise RuntimeError(f"GitHub CI status could not be retrieved: {error}") from error
        finally:
            github.close()
