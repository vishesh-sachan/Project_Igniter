# ADR-0001: Zero-dependency generation

- **Status:** Accepted
- **Date:** 2026-08-02

## Context

Contributors to any open-source project should run setup with as few prerequisites as possible. We do not want to require a Node.js runtime, a Tauri runtime, or any JavaScript/type ecosystem in a *contributor's* environment just to install a project.

At the same time, the **editor** is a desktop app (Tauri + React) — that's fine for maintainers, but not for every contributor cloning a repo.

## Decision

Generate **native, zero-dependency shell scripts** (Bash and PowerShell) that embed the entire workflow. The generated scripts rely only on common POSIX / PowerShell built-ins.

- Bash: `read`, `[ ... ]`, `case`, `exec`, `sed`, `grep`, `cat`.
- PowerShell: `Read-Host`, `Test-Path`, `Select-String`, `&`.

No `chmod +x` is required either — the whole run chain uses `exec bash` (Bash) and `&` (PowerShell) to chain scripts.

## Consequences

- Contributors run `bash setup.sh` — nothing else.
- The converter is a pure function mapping workflows → script text; at generation time even `index.schema` is bumped so drift detection (comparing that number at run time) always considers regenerated scripts newer.
- Behaviour is duplicated per shell (Bash/PowerShell) with no shared runtime, so fixes in the converter must go to both emitted languages (2 step-converters per step).