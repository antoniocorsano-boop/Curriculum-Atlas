# Arena → Atlas automatic curriculum synchronization

## Runtime model

Atlas never owns curriculum authority.

`Arena release → public export bundle → Atlas hourly watcher → governed sync PR → Atlas gates → human merge`

The watcher compares:
- structural fingerprint;
- authority state;
- canonical source revision.

A change in any of these opens or updates the single branch `sync/arena-curriculum`.

## Publication rules

### PROVISIONAL_COMPLETE

- the candidate may be rendered in the PR preview for professional inspection;
- candidate-integrity gate may PASS;
- publication-authority gate MUST FAIL;
- public `main` must not be updated.

### APPROVED

Public promotion additionally requires:
- Arena `authorityReceiptRef`;
- SHA-256 integrity digest over the approved payload;
- Atlas build/visual/accessibility gates;
- human review of the exact head.

No curriculum edit is authored in Atlas. Corrections must return to Arena and produce a new Arena fingerprint.

## Bootstrap

The first candidate is the complete institutional master materialized by Arena PR #329. It replaces the reduced S3-V2 fixture only inside the sync candidate branch until institutional approval is complete.
