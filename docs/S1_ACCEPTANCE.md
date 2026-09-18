# S1 — Spatial POC acceptance contract

S1 is a proof of concept, not a public release.

## Functional journeys

1. Universe → select a curriculum node → Focus inspector → Back.
2. Universe → Galaxy → Verticale → Timeline without changing the underlying dataset.
3. Search → select node/segment → provenance.
4. Filter Da rivedere → only source-review nodes remain visible.
5. Toggle Esplora come elenco → same curriculum nodes are available without Canvas interaction.

## Data gates

- 15 real curriculum nodes.
- 7 real Docente OS plan segments.
- 16 real candidate links from the consolidated registry subset.
- 9 REVIEW_READY_PROPOSED.
- 2 EXPLORATORY_PROPOSED.
- 5 BLOCKED_PENDING_SOURCE_REVIEW.
- 0 VALIDATED created by S1.

## Human/device gates still required

- Android interaction test.
- Desktop interaction test.
- LIM/browser test.
- Keyboard-only test.
- Screen-reader inspection of the HTML mirror.
- Visual orientation test.
- Performance observation on the Android reference device.

Until these are completed:

S1_STATUS = IMPLEMENTED_PENDING_HUMAN_DEVICE_VALIDATION
