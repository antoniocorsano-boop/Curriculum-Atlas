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

## Fixture

The first route uses a technical fixture only to prove the adapter boundary.

It is not a publishable Percorso and is not MUSEO ZERO canonical content.

## Next handoff

Replace the fixture source with an exact immutable Studio Atlas preview snapshot/receipt after the cross-product transport contract is implemented.
