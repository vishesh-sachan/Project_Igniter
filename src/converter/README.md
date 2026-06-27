# Converter Module

Converts visual workflows into zero-dependency native setup scripts (Bash + PowerShell). Contributors run the generated scripts — no Node, no Tauri, no runtime needed.

## Architecture

```
index.ts                 # Entry: reads index → walks projects/envs → returns files
  ├─ bash.ts             # Recursive tree walker → state-machine Bash dispatch
  ├─ powershell.ts       # Same → PowerShell dispatch
  ├─ orchestrator.ts     # Generates root setup.sh/setup.ps1 (flag parsing, drift, routing)
  └─ steps/              # Per-step-type converters (pure functions)
       ├─ information.ts
       ├─ input.ts
       ├─ check.ts
       ├─ condition.ts
       ├─ command.ts
       ├─ choice.ts
       ├─ file.ts
       ├─ flow.ts
       └─ osBranch.ts
```

### State Machine Dispatch

Every generated script uses this pattern:

```bash
NEXT="<first-step-id>"
while [ -n "$NEXT" ]; do
  case "$NEXT" in
    <step-id>)
      # step body code
      NEXT="<next-step-id>"
      ;;
  esac
done
```

This makes jumps trivial (`NEXT="target-id"`), branching natural (set NEXT based on condition), and osBranch uniform (select NEXT via `uname`).

### How Tree Walking Works

`bash.ts` and `powershell.ts` each implement:

- `generateWorkflow(workflow, followUpId)` — linear walk of steps, determines NEXT for each
- `generateStep(step, nextId, entries)` — dispatches to step converter, sets NEXT to `nextId`
- `generateBranchingStep(step, nextId, entries)` — handles check/condition/command/file/osBranch: recursively walks sub-workflows, sets NEXT based on success/failure

`followUpId` is what runs after the entire sub-workflow completes (the step after the enclosing branching step).

### Step Converter Contract

Each file in `steps/` exports:

```typescript
export function toBash(step: StepType): string;
export function toPowerShell(step: StepType): string;
```

The function returns only the **body** of the step — what command(s) to execute. It does NOT handle:
- Setting `NEXT` (done by the main converter)
- Input persistence (done via shared `load_state`/`save_state` helpers emitted by the main converter)
- Branching (wrapped by the main converter)

### Adding a New Step Type

1. Define the type in `workflow.ts`
2. Add it to the `Step` union
3. Create `steps/<name>.ts` with `toBash()` and `toPowerShell()`
4. Add a case in `bash.ts` and `powershell.ts` `generateStep()` or `generateBranchingStep()`

### Orchestrator

`orchestrator.ts` generates the root `setup.sh`/`setup.ps1` that:

1. Walks up from `cwd` to find `.project-igniter/`
2. Maps `cwd` to a project key (via `case` on relative path)
3. Parses `--env`, `--sync`, `--reset`, `--status`, `--help`
4. Manages `~/.local/share/project-igniter/<hash>/meta` (SCHEMA, LAST_RUN)
5. Drift detection: compares SCHEMA from state vs `workflows.json`
6. Routes to `.project-igniter/scripts/<project>/<env>/setup.sh`

### State Persistence

Inputs are stored as flat files under a human-readable path:

```
~/.local/share/project-igniter/
  frontend/
    prod/
      meta             # SCHEMA=5\nLAST_RUN=2026-06-23
      NODE_VERSION     # 20
      DB_PASSWORD      # secret123
  backend/
    dev/
      meta
      ...
```

The path is `<project-key>/<env>` with non-alphanumeric characters replaced by `_`. Consistent between orchestrator and per-env scripts — both derive project+env from their path.

### Input Sanitization

User-provided values (`defaultValue`, `prompt`, `content`, `title`, `step.value`, search/replace patterns) are escaped in generated scripts to prevent code injection:

- **Bash**: double quotes, backslashes, `$`, and backticks are escaped
- **PowerShell**: single quotes (used for string delimiters) are doubled
- **Sed**: `|` delimiter, `\`, `&` are escaped in patterns and replacements

### Caveats

- The orchestrator `setup.sh` reads `workflows.json` at runtime via `grep` for drift detection. It does NOT parse JSON.
- `convertAll()` in `index.ts` is a pure function — it returns a list of `{path, content}` tuples. The caller (Tauri command) handles actual file I/O via `write_file`.
- Generated scripts assume common POSIX tools (`uname`, `grep`, `sed`). No non-standard dependencies.
