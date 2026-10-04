# Studio Atlas → Atlas Learner Preview Adapter v0.1

Status: `IMPLEMENTATION_CANDIDATE / PREVIEW_ONLY / NOT_STUDENT_AUTHORIZED`

## Purpose

Provide a non-public learner preview that uses the existing Atlas Experience Runtime.

Studio Atlas does not render a fake learner mode inside the editor.

Instead:

`Studio Atlas snapshot → preview adapter → ExperienceDefinition → PathwayRuntimeSurface → ExperienceRuntime`

## Snapshot boundary

The adapter accepts:

`studio-atlas.preview-snapshot/v0.1`

Required safeguards:

- exact package digest;
- `runtimeAuthorized=false`;
- `studentAuthorized=false`;
- no learner identity;
- no telemetry;
- explicit scenes;
- at least one explicit `TRANSFER` scene.

The adapter fails closed when these invariants are absent.

## Transfer is not inferred

Atlas PATHWAY runtime requires transfer.

The adapter MUST NOT silently reinterpret the last ordinary scene as a transfer scene.

Studio Atlas must eventually expose a human-understandable authoring choice for transfer.

## Runtime reuse

The preview uses:

- `PathwayRuntimeSurface`;
- `ExperienceRuntime`;
- volatile session state;
- existing accessibility/focus/navigation behaviour.

No second player is introduced.

## Public boundary

Route:

`/percorsi/lab/studio-atlas-preview/`

The route:

- is noindex/nofollow;
- remains under `/lab/`;
- is not added to the public Percorsi catalogue;
- carries explicit non-student-authorized copy.

## Ephemeral preview bridge

The real creator preview does not serialize authoring content into the URL and does not require a preview database.

Studio Atlas:

1. creates an exact preview snapshot;
2. opens the Atlas lab route with a random `channel` nonce only;
3. waits for an origin-bound READY message from Atlas;
4. sends the snapshot directly to that exact Atlas window using `postMessage` and an exact target origin.

Atlas:

1. requires `window.opener`;
2. requires the configured Studio Atlas origin;
3. checks `event.origin`;
4. checks `event.source === window.opener`;
5. checks the random channel;
6. validates the snapshot before mounting the learner runtime.

Wildcard target origins are prohibited.

The snapshot is not persisted by Atlas.

## Static-export compatibility

The bridge is deliberately browser-to-browser so the preview route remains compatible with Atlas static export.

No server route or learner account is required for direct creator preview.

## Fixture

The technical fixture remains only for contract validation in CI.

It is not the runtime source for a real creator preview, is not a publishable Percorso and is not MUSEO ZERO canonical content.

## Future shared preview

A persistent opaque-ref broker may be added later for asynchronous/shared review links. It is not required for the direct **Vedi come studente** journey.
