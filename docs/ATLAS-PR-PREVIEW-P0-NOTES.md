# Atlas PR Preview P0 — implementation notes

The build workflow is `workflow_dispatch` only in P0. This is intentional: arbitrary PR code must not automatically gain a publication path, and the exact SHA must be supplied explicitly during governed review.

The workflow uses the existing Atlas GitHub Pages static-export mode solely to create the `out/` artifact. It does not call the Pages deployment action and has no Pages write permission.
