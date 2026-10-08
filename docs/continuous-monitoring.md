# Continuous dependency monitoring

The `Dependency security` GitHub Actions workflow runs the OSV scanner on pull
requests that change npm lockfiles, pinned Python requirements, or the scanner.
It also runs every Monday at 04:17 UTC and can be started manually from the
Actions tab.

The workflow exits unsuccessfully when any known advisory matches an exact
dependency version. An unavailable OSV service also fails the job instead of
reporting a clean scan. The JSON report is uploaded as a 14-day workflow
artifact, including when the scan job fails after producing output.

The job has read-only repository permissions, uses no secrets, and disables
persisted checkout credentials. Review the workflow result and artifact for
the advisory IDs and fixed versions before merging dependency changes.
