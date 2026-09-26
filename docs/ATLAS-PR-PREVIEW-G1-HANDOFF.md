# Atlas PR Preview — G1 handoff

Target review candidate:
- PR: `#35`
- exact head: `c34420bf7a80f1f0e7e236b9b78f1e19e96cc59b`
- state: `IMPLEMENTATION_CANDIDATE / NOT_RUNTIME_AUTHORIZED`

When P0 is approved, the first build validation must use exactly the SHA above and must produce an artifact whose `EXACT_HEAD.txt` and `PREVIEW-MANIFEST.json` both bind to it.

A later public preview URL may be accepted for human G1.4 testing only when the publish adapter also proves the same SHA binding. No build or preview of a later commit can substitute for the frozen G1 candidate without reopening the exact-head gate.
