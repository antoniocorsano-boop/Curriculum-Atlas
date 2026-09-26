# Atlas PR Preview — operations

## P0 build request

Inputs:
- PR number;
- full 40-character exact-head SHA.

Expected output:
- static `out/` artifact;
- `EXACT_HEAD.txt` matching requested SHA;
- `PREVIEW-MANIFEST.json` matching PR and SHA;
- seven-day retention.

## Invalid conditions

Stop and mark the evidence invalid if:
- checked-out SHA differs from input;
- build fails;
- artifact lacks either provenance file;
- workflow requests production Pages permissions;
- evidence is reused for a different SHA.

## Human use

P0 artifact is not itself the mobile review URL. Human accessibility review begins only after a P1 adapter publishes the exact candidate under an isolated temporary URL.
