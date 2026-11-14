# FREE-DEPLOY FD-05/B — Cloudflare metadata preflight

**Status:** IMPLEMENTATION_CANDIDATE / READ_ONLY / NO_DEPLOY. 14 November 2026.

TRAMA #315 is the program tracker; TRAMA #316 is the separate fixture verifier; TRAMA #314 is the pending governance decision. This increment lives in Atlas to reuse the existing environment and credentials only when a legitimate, separately approved diagnostic is possible. No new token, account, project, paid service, upload, or publication.

Historical evidence: Atlas run 36396987217 (28 September) successfully used Wrangler 4.142.0. That version is recorded for reproducibility, **not** installed or invoked here; an actual deployment adapter will require a current dependency/security review and lock. Historical success does not establish current credentials or quota.

The check uses Cloudflare's documented GET for the existing project trama-fd02; it rejects wrong project/hostname, Git-linked source, custom domains, Functions or unknown Functions status, environment bindings and analytics, absent deployment configuration or invalid current production deployment reference. A positive receipt is limited to metadata, not a cost, access, byte-integrity or authorization receipt. It contains no account ID, token, raw configuration or binding values. Unknown or denied responses stop. No redirects, retries or write requests. Test fixtures are synthetic. The normal PR job has no credentials. A separate diagnostic is dispatch-only, main-only, existing environment atlas-pr-preview; requires explicit authorization and valid scope; no invocation in this PR. A rejected request must not be bypassed. Public-site HTTP 403 from TRAMA #316 remains unresolved.

Official references: https://developers.cloudflare.com/api/resources/pages/subresources/projects/methods/get/ and https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/.

Future write adapter is separately gated: exact synthetic artifact and digest, current project/production branch and prior deployment receipt, current account FREE_ONLY cost/quotas and permissions, current legitimate remote access proof, pinned dependencies and explicit authorization; no student or private artifacts, no changes to existing sites. The future command and URL receipt must be validated; successful metadata alone cannot unlock it. The teacher will review the product and make the decision, not repeat manual uploads. Missione 118 remains private.
