# Decision — Atlas PR Preview P0

Decision: separate **build evidence** from **public preview publication**.

Rationale:
- GitHub Pages is the canonical Atlas production channel and must not be overloaded with experimental PR content;
- exact-head review requires immutable provenance before it requires an URL;
- provider-specific publication adds credentials and lifecycle risks that deserve an independent gate;
- a reusable build contract avoids solving the same provenance problem for every future visual/human review.

Consequences:
- P0 is provider-neutral and safe to review independently;
- P1 will select/implement a publish adapter only after P0 PASS;
- PR #35 remains untouched while infrastructure evolves;
- student authorization remains a separate governance decision even after a preview exists.
