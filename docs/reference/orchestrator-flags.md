# Orchestrator flags (reference)

Both generated `<root>/setup.sh` / `<root>/setup.ps1` accept the same flags because they forward everything to `.project-igniter/setup.sh` / `setup.ps1`.

## Usage

```bash
setup.sh [--proj <name>] [--env <name>] [--reset] [--status] [--help]
```

```powershell
.\setup.ps1 [-proj <name>] [-env <name>] [-reset] [-status] [-help]
```

## Flags

| Flag | Argument | Default | Purpose |
|------|----------|---------|---------|
| `--proj <name>` | project key | auto-detect from cwd | Run setup for a specific project. |
| `--env <name>` | env name | project `defaultEnv` | Target a specific environment. |
| `--reset` | — | off | Delete the stored state dir for this project/env, then exit. |
| `--status` | — | off | Print project, env, schema, last run, and current captured variables, then exit. |
| `--help` | — | — | Print usage and exit. |

## Project detection

If `--proj` is not given, the orchestrator determines the project from the current directory:

- It walks up from `cwd` to find `.project-igniter/`.
- The project key is chosen by **relative path matching** against the project definitions in `workflows.json` (longest path wins).

If the current directory matches no project, the scaffolding prints:

```
Error: current directory does not match any project in workflows.json
Use --proj <name> to specify a project.
```

## End-to-end sequence

1. Locate `.project-igniter/` (walks parent directories).
2. Parse flags.
3. Resolve project + env (explicit or auto-detected).
4. Derive the state dir: `~/.local/share/project-igniter/<safe-project>/<safe-env>/`.
5. Run `--reset` / `--status` if requested.
6. Read `schema` & stored schema; print drift notice if they differ.
7. Write `SCHEMA` + `LAST_RUN` to `meta`.
8. `exec` / `&` the per-environment script: `.project-igniter/scripts/<project>/<env>/setup.sh`.

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | Success (or `--reset` / `--status` / `--help`). |
| `1` | Generic error (missing `.project-igniter`, unknown flag, bad project/env, unsupported OS). |