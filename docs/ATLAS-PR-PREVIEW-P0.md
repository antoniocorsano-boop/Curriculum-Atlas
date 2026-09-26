# Atlas PR Preview — P0 scope freeze

P0 ends at the production-isolated exact-head static artifact.

Any of the following is P1 or later and must not be added to P0 during review:
- public URL deployment;
- provider credentials;
- automatic PR comments;
- provider cleanup API;
- custom domains;
- student-facing navigation;
- analytics or telemetry.

This freeze keeps the first infrastructure change small, reviewable and reversible.
