# Atlas PR Preview — fail-safe behavior

Failure must default to **no publication**.

If provenance, build, permissions, provider configuration, cleanup state or SHA binding is uncertain, the system may retain CI evidence but must not claim a valid human-review preview. Canonical Atlas availability must never depend on preview infrastructure.
