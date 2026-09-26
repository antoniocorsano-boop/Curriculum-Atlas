# Atlas PR Preview — P1 boundary

P1 begins only after P0 PASS.

P1 objective: attach a temporary, isolated, navigable URL to a P0 exact-head artifact/build while preserving provenance and non-authority.

Required before P1 implementation:
1. provider/channel selection;
2. least-privilege credential model;
3. exact SHA ↔ URL receipt;
4. noindex/nofollow where supported;
5. stale/cleanup policy;
6. concurrency behavior when a PR head changes;
7. smartphone/desktop reachability;
8. confirmation that canonical GitHub Pages remains untouched.

The first P1 validation target is PR #35 exact head `c34420bf7a80f1f0e7e236b9b78f1e19e96cc59b`.
