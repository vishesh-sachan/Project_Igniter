# Storage schema (reference)

Project Igniter persists everything as JSON in the targeted repository.

## The `.project-igniter/` layout

```
<project-root>/.project-igniter/
├── workflows.json           # the index
├── workflows/
│   └── <workflow-id>.json   # one file per workflow, pretty-printed
├── setup.sh                 # orchestrator (generated)
├── setup.ps1                # orchestrator (generated)
└── scripts/
    └── <project>/<env>/
        ├── setup.sh
        └── setup.ps1
```

The `setup.sh`/`setup.ps1` and the root wrappers are **generated** by the app and meant to be committed for contributors. `workflows.json` too.

## `workflows.json`

```jsonc
{
  "schema": 1,
  "defaultProject": "root",
  "standalone": [],                  // root-level standalone summaries
  "projects": {
    "root": {
      "path": ".",
      "defaultEnv": "dev",
      "environments": {},            // Record<envName, EnvEntry>
      "standalone": []
    }
  }
}
```

### The `schema` field

`schema: number` is the **drift detection** counter. It increments only when the user clicks **Generate Scripts** (in `generateScriptsService.ts`). Generated scripts compare the stored `SCHEMA` in user state against this value; a mismatch means the on-disk scripts are newer than the user's last run.

### Standalone vs environment slots

Each project tracks:

- `standalone` — `WorkflowSummary[]` of workflows that have no `environment`.
- `environments` — `Record<string, EnvEntry>`, one workflow per slot.

`WorkflowSummary` / `EnvEntry` mirror the identifying fields of a workflow (`id`, `name`, `description?`, `createdAt`, `updatedAt`), with `EnvEntry` technically also carrying `environment` on summaries inside the converter.

## Per-workflow file

`workflows/<id>.json` is the full `Workflow` object serialized with 2-space indentation.

## State while running (contributor side)

Not in the repo — it lives under the user's home dir:

```
~/.local/share/project-igniter/
└── <safe-project>/<safe-env>/
    ├── meta          # SCHEMA=<n>\nLAST_RUN=<yyyy-mm-dd>
    └── <VAR_NAME>    # one flat file per captured variable
```

- `<safe-project>` / `<safe-env>` are the project/environment keys with any non-alphanumeric char replaced by `_`.
- `save_state` / `load_state` (Bash) and `Save-State`/`Load-State` (PowerShell) read/write these files.
- Inputs are restored so re-runs skip already-satisfied prompts. `--reset` deletes the folder.

## Commands used by the frontend

| Operation | Function | Files touched |
|-----------|----------|----------------|
| Read / write a file | `read_file` / `write_file` / `delete_file` (Tauri: Rust FS) | — |
| Mark executable | `make_executable` | generated `.sh` |
| Load index | `workflowService.loadWorkflowIndex` | `workflows.json` |
| Save workflow | `workflowService.saveWorkflow` | `workflows.json` + `workflows/<id>.json` |
| Update metadata | `workflowService.updateWorkflowMetadata` | both |
| Delete workflow | `workflowService.deleteWorkflow` | both + removes the file |
| Generate scripts | `generateScriptsService.generateScripts` | all generated scripts, bumps `schema` |