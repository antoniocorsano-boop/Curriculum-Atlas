# Atlas PR Preview — provenance receipt

Minimum provenance tuple:

`repository + PR number + exact 40-char SHA + workflow run + artifact/deploy identifier + generated-at time`

P0 records repository context implicitly in GitHub Actions and writes PR, SHA and run ID into the artifact manifest. P1 must extend the tuple with the public preview deployment identifier/URL and generated-at timestamp without weakening the exact-head binding.
