# Atlas PR Preview P0 — validation plan

1. Run repository CI on infrastructure PR.
2. Run `Atlas PR Preview Policy`; it must PASS.
3. Review diff to confirm no product/runtime changes.
4. Confirm canonical Pages workflow is unchanged.
5. Confirm PR #35 head remains `c34420bf7a80f1f0e7e236b9b78f1e19e96cc59b`.
6. Human exact-head review P0.
7. Only after P0 integration, dispatch the build workflow against PR #35 frozen SHA and inspect provenance artifact.
8. P1 provider adapter remains a separate change.
