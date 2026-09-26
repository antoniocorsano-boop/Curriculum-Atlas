# Atlas PR Preview — security boundary

## Threats addressed in P0

- accidental overwrite of canonical GitHub Pages;
- building a moving branch instead of the reviewed commit;
- workflow checkout credentials remaining available to build scripts;
- treating a build artifact as student-authorized publication;
- evidence that cannot be traced to an exact SHA.

## Controls

- `contents: read` only;
- `persist-credentials: false` on exact-head checkout;
- full 40-character SHA required;
- post-checkout SHA equality assertion;
- no `pages: write`, `id-token: write`, `deploy-pages`, production environment or provider credentials;
- artifact retention limited to seven days;
- manifest explicitly sets `runtimeAuthorized=false`, `studentUseAuthorized=false`, `canonicalPagesDeployment=false`.

## Deferred risks

A future publish adapter introduces a new trust boundary. It requires separate review for provider credentials, URL exposure, noindex, expiry/deletion, concurrency, stale deploy handling and exact SHA ↔ URL receipt. P0 does not authorize that adapter.
