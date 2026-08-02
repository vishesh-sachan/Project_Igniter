# Project Igniter Documentation

Project Igniter is a desktop application that lets maintainers model project setup as a **visual workflow** and generate **zero-dependency** setup scripts (Bash + PowerShell) from it. Contributors run a single command — `bash setup.sh` — and get walked through the whole setup.

This directory is the canonical reference for how Project Igniter works internally and how to use it.

## Start Here

| Document | What it covers |
|----------|----------------|
| [Architecture](architecture.md) | How the data model, editor, converter, and orchestrator interlock |
| [Working with the Composer](guides/01-getting-started.md) | First-run flow and the three-panel editor layout |
| [Authoring a workflow](guides/02-authoring-a-workflow.md) | Designing steps, branches, variables, and OS handling |
| [Generated scripts](guides/03-generated-scripts.md) | What the converter produces and how contributors run it |
| [Monorepo & projects](guides/04-monorepo-projects.md) | Managing multiple projects/environments in one repo |
| [Contributing](guides/05-contribution-workflow.md) | Setting up the app for development and process |

## Reference

| Document | What it covers |
|----------|----------------|
| [Step types](reference/step-types.md) | Every step, its fields, branches, and generated code |
| [Index & storage schema](reference/storage-schema.md) | `.project-igniter/`, `workflows.json`, state directory |
| [Orchestrator flags](reference/orchestrator-flags.md) | `setup.sh` / `setup.ps1` CLI and behaviours |

## Patterns

| Document | What it covers |
|----------|----------------|
| [Recursive tree utilities](patterns/recursive-tree-utils.md) | The `find/update/delete/move/add` helper family |
| [State-machine dispatch](patterns/state-machine-dispatch.md) | How generated scripts run as a `NEXT` state machine |
| [OS merge (Same as)](patterns/os-branch.md) | Deduplicating branches with `mergeFrom` |

## Decision Records

See [adr/](adr/) for architecture decision records.

## Related Links

- Converter module internals: [`src/converter/README.md`](../src/converter/README.md)
- Landing page & roadmap: <https://project-igniter.nytkode.com/#roadmap>