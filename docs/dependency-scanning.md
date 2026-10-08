# Dependency exposure scanning

Vestigium's dependency scan reads `package-lock.json` (npm lockfile versions 1-3)
and exact `name==version` pins from `requirements.txt`. It skips unpinned Python
requirements because they do not identify an installed version. Scans recurse
through the selected directory while ignoring generated and vendored folders.

For each exact dependency coordinate, Vestigium queries the OSV batch API and
returns advisory IDs, aliases, severity when supplied by OSV, affected version,
manifest path, and fixed versions. OSV receives package names, ecosystems, and
versions only; source files are not sent.

The API's default allowed scan root is the repository root. Set
`SCAN_ALLOWED_ROOT` in the API environment to permit scanning another directory.
The API rejects targets that resolve outside that root.

Run a scan from `api`:

```powershell
python -m app.services.dependency_scanner --root .. --fail-on any
```

The command prints a JSON report. Exit codes are `0` for no matching findings,
`1` when the selected finding threshold is met, and `2` when scanning or the OSV
request fails.
