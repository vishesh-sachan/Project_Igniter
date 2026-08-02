# Generated scripts

Pressing **Generate Scripts** turns the stored workflows into a set of runnable files inside the target repo. This guide explains the output — how it's structured, how contributors run it, and what each piece does.

## What gets generated

Given a project at `<root>`:

```
<root>/
├── setup.sh                          # public entry point (committed)
├── setup.ps1                        # public entry point (committed)
└── .project-igniter/
    ├── setup.sh                     # orchestrator
    ├── setup.ps1                    # orchestrator
    ├── workflows.json               # index (schema, projects, env mappings, standalone)
    ├── workflows/<id>.json          # individual workflow models
    └── scripts/
        └── <project>/<env>/
            ├── setup.sh             # per-environment converted script
            └── setup.ps1
```

- The **root wrapper** scripts are the public surface: they forward to the orchestrator.
- The **orchestrator** discovers the project from the current directory, parses flags, manages state, and finally calls the per-(project, env) script via `exec bash` (Bash) or `&` (PowerShell).
- The **per-env scripts** contain the actual converted workflow state machine.

### No `chmod +x` required

The chain uses `exec bash` (Bash) and `&` (PowerShell) throughout, so the executable bit is never needed. Contributors can run:

```bash
bash setup.sh                # any environment with bash
# or, once:
chmod +x setup.sh && ./setup.sh
```

## Responsibilities by file

| File | Role |
|------|------|
| `<root>/setup.sh` | Root wrapper; forwards to `.project-igniter/setup.sh` with all args; shows an error if scripts weren't generated. |
| `.project-igniter/setup.sh` | Orchestrator (see below). |
| `.project-igniter/scripts/<proj>/<env>/setup.sh` | The actual converted workflow for that environment. |

## The orchestrator

Sequence performed by `.project-igniter/setup.sh` (and its PowerShell twin):

1. **Locate the root** — walk parent directories for a `.project-igniter/` folder.
2. **Parse CLI flags** — `--proj`, `--env`, `--reset`, `--status`, `--help`.
3. **Resolve project + env** — `--proj`/`--env` may be given explicitly; otherwise the project is auto-detected from the current directory (via relative path matching), and the env falls back to the project default.
4. **State location** — `~/.local/share/project-igniter/<safe-project>/<safe-env>/`.
5. **Handle `--reset` / `--status`** and exit.
6. **Drift detection** — compares the stored `SCHEMA` in state against the `schema` field in `workflows.json`; if they differ, prints an informational update and moves on.
7. **Update** the meta file (`SCHEMA`, `LAST_RUN`).
8. **Route** to the converted target script and `exec` it.

See [orchestrator-flags](../reference/orchestrator-flags.md) for full flag documentation.

## State persistence

Inputs are stored flat and human-readable:

```
~/.local/share/project-igniter/
├── frontend/
│   └── prod/
│       ├── meta             # SCHEMA=n\nLAST_RUN=yyyy-mm-dd
│       └── NODE_VERSION     # 20
└── backend/
    └── dev/
        ├── meta
        └── ...
```

`<safe-project>` / `<safe-env>` replace non-alphanumeric characters with `_`. The orchestrator and per-environment script derive the same path from the same project+env, so state is consistent.

Because state is restored, a contributor re-running `setup.sh` is not re-prompted for inputs that already have stored values — setup is idempotent and re-runnable.

## Variables & interpolation

At conversion time:

- `{{NAME}}` becomes `${NAME}` in Bash and `$NAME` in PowerShell.
- User-typed values (prompts, defaults, content, search/replace) are escaped to the target shell to prevent injection.
- Declared variable names are run through `sanitizeVarName`.

## Schema / drift note

Every click of **Generate Scripts** increments `index.schema`. The generated scripts are therefore always considered "newer" than any stored user state, and the orchestrator re-checks declaratively each run. This means stale runs after any regeneration are caught.

## Troubleshooting

| Symptom | Likely cause |
|---------|--------------|
| `Error: no setup script found for project=… env=` | Empty `ENV` — pass it via `--env`, or the project default is empty. |
| `Error: setup scripts not found` (root wrapper) | You haven't run **Generate Scripts** yet. |
| `current directory does not match any project` | Run from a directory inside the repo, or pass `--proj <name>`. |