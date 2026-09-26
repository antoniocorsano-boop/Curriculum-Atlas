# Atlas PR Preview P0 — review checklist

- [ ] Branch originates from the intended `main` baseline.
- [ ] Changes are infrastructure-only.
- [ ] Workflow accepts a full exact-head SHA.
- [ ] Checkout is bound to that SHA and verifies equality.
- [ ] Checkout credentials are not persisted.
- [ ] Permissions are read-only.
- [ ] Static build succeeds for an Atlas candidate.
- [ ] Artifact contains `EXACT_HEAD.txt`.
- [ ] Artifact contains `PREVIEW-MANIFEST.json`.
- [ ] Manifest explicitly denies runtime/student/canonical publication authority.
- [ ] No `pages: write`, `id-token: write`, `deploy-pages` or `github-pages` production environment.
- [ ] Artifact expires after seven days.
- [ ] P0 is not described as a public preview URL service.
- [ ] Human exact-head review PASS before merge.
