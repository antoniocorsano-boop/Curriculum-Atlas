# Atlas PR Preview

Canonical documents for the preview infrastructure proposal:

- `ATLAS-PR-PREVIEW.md` — contract and invariants;
- `ATLAS-PR-PREVIEW-DECISION.md` — architectural decision;
- `ATLAS-PR-PREVIEW-SECURITY.md` — security boundary;
- `ATLAS-PR-PREVIEW-STATUS.md` — phase status;
- `ATLAS-PR-PREVIEW-CHECKLIST.md` — P0 review checklist;
- `ATLAS-PR-PREVIEW-G1-HANDOFF.md` — binding to the frozen PR #35 candidate.

Implementation:
- `.github/workflows/atlas-pr-preview-build.yml` — exact-head build artifact;
- `.github/workflows/atlas-pr-preview-policy.yml` — production-isolation gate;
- `scripts/verify-preview-workflow.mjs` — policy assertion.

P0 intentionally does not publish a URL.
