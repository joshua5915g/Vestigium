# OSV-validated upgrade pull requests

For findings in exact-pinned Python `requirements.txt` files, Vestigium can
re-query OSV for the exact package version and advisory, verify that OSV lists
the selected version as fixed, and open a GitHub pull request that updates only
that pin. It refuses stale findings, ambiguous duplicate pins, unsafe paths,
and fixed versions not confirmed by OSV.

The API requires `GITHUB_TOKEN` with repository contents read/write and pull
request write access, `GITHUB_REMEDIATION_REPOS` containing a comma-separated
allowlist of `owner/repository` names, and a `REMEDIATION_API_KEY` of at least
32 characters. The allowlist and API key prevent anonymous callers from using the
server's GitHub token to open PRs, even for an allowed repository. Use a
least-privilege GitHub token and configure the API's `SCAN_ALLOWED_ROOT`
separately for local scans. Enter the remediation API key in the UI only when
using this feature; it is held in page memory and sent over the API request, not
saved in browser storage. The repository should have its own CI workflows
enabled; Vestigium never describes an opened pull request as verified until
GitHub reports at least one successful check and no failing or pending checks.

Use `GET /api/v1/dependencies/{owner}/{repo}/pull-requests/{number}/checks` to
poll CI state. The response distinguishes `pending`, `verified`, `failed`, and
`not_configured`; the last state means no usable CI check has reported yet.

Automatic PRs currently support exact-pinned Python requirements only. Npm
upgrades are not offered because safely changing `package.json` also requires
regenerating and validating its lockfile.
