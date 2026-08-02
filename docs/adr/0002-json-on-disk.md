# ADR-0002: JSON as the on-disk format

- **Status:** Accepted
- **Date:** 2026-08-02

## Context

The workflow model is a recursive tree. It must persist across editor sessions and be consumed at generation time by the converter.

Candidates considered:
- a single database / binary blob,
- one file per workflow **plus** an index you can shell-grep,
- a dense sidecar that regenerates everything.

## Decision

Store **one pretty-printed JSON file per workflow** under `.project-igniter/workflows/<id>.json`, and a lightweight **index** `workflows.json` that tracks schema, projects, and their env/standalone slots.

```jsonc
// workflows.json
{
  "schema": 1,
  "defaultProject": "root",
  "standalone": [],
  "projects": { "root": { "path": ".", "defaultEnv": "dev", "environments": {}, "standalone": [] } }
}
```

The index is small and greppable (important for the generator's drift detection, which reads `schema` via `grep` at run time — it never JSON-parses).

## Consequences

- **PR-reviewable**: a workflow is human-diffable text.
- **Versioned**: `schema` is bumped by the generator; the orchestrator's drift detection compares the stored schema vs the on-disk one.
- **Grep-able metadata**: the index is plain JSON you can combine with other tooling.
- Downside: large trees produce large files, and JSON offers no constraint checking without a separate schema step.