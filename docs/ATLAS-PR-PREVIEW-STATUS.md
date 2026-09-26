# Atlas PR Preview — stato

Phase: `P0 BUILD CONTRACT`
Status: `IMPLEMENTED / REVIEW_PENDING`

Head after implementation: resolve from branch `infra/atlas-pr-preview`.

Implemented:
- exact-head manual build input;
- full SHA validation and checkout binding;
- static Atlas export;
- immutable artifact with 7-day retention;
- `EXACT_HEAD.txt` and `PREVIEW-MANIFEST.json` evidence;
- read-only permissions and checkout credentials disabled;
- automated policy check forbidding production Pages deployment permissions/actions.

Not implemented in P0:
- public preview URL;
- provider adapter;
- automatic cleanup at provider;
- PR comment receipt.

These remain deliberately deferred until P0 is reviewed. P0 must not be represented as a public preview service: it is the safe build/evidence foundation for one.
