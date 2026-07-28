# Project Igniter

Project Igniter captures project setup processes and turns them into interactive installers, so contributors can get a project running with a single command instead of wading through lengthy documentation.

## How It Works

Project Igniter is a desktop application that lets maintainers model their project's setup as a **visual workflow** composed of steps. Each step represents an action the user performs during setup — prompting for input, running commands, checking conditions, branching based on variables, etc.

The workflow is persisted as JSON and can be executed by the runtime installer.

## Workflow Architecture

### Data Model

A workflow is a **recursive tree** of steps. The top level contains an ordered list of steps, and certain step types contain nested sub-workflows for different execution branches.

```
Workflow {
  steps: Step[]          // ordered; array index determines execution order
}
```

Each step has a unique `id` (UUID), a `name`, and a `type` that determines its behavior and available properties.

### Step Types

| Type | Branches | Purpose |
|---|---|---|
| `input` | — | Prompt user for text input, store in a variable |
| `information` | — | Display informational message |
| `choice` | — | Multiple choice prompt |
| `flow` | — | Control flow marker (`continue` acts as terminator in sub-workflows) |
| `check` | `onSuccess`, `onFailure` | Validate a condition (command exit code, file existence, env var presence) |
| `condition` | `onTrue`, `onFalse` | Branch based on a variable comparison |
| `command` | `onSuccess`, `onFailure` | Execute a shell command |
| `file` | `onSuccess`, `onFailure` | Create, append, or replace text in a file |
| `osBranch` | `macos`, `linux`, `windows` | Branch based on the user's operating system |

### Branching & Recursive Nesting

Steps with branches (`check`, `condition`, `command`, `file`, `osBranch`) each contain nested `Workflow` objects. When a branch executes, its sub-workflow runs as a self-contained sequence of steps. This creates a tree structure:

```
Root Workflow
├── Input: "Project name"
├── Command: "npm install"
│   ├── onSuccess
│   │   ├── Information: "Installed successfully"
│   │   └── Flow: continue
│   └── onFailure
│       └── Check: "Is Node installed?"
│           ├── onSuccess → Command: "Install Node"
│           └── onFailure → ...
└── Flow: continue (only in sub-workflows)
```

#### Flow Step as Sentinel

Every sub-workflow (branch) is initialized with a single `flow` step of type `continue` as the last item. This step acts as a **sentinel** — new steps added to the branch are inserted before it, and it cannot be reordered or deleted. The flow step ensures the sub-workflow returns control to the parent after execution.

### Ordering

- Steps within a workflow are **ordered by array index**.
- The workflow editor supports **drag-to-reorder** within a branch via a grip handle (≡). Dragging is scoped to a single branch — you cannot drag steps across branches.
- The `flow` step is always anchored at the bottom and excluded from reordering.

### Persistence

Workflows are saved as JSON files in `.project-igniter/workflows/<id>.json`. A separate index at `.project-igniter/workflows.json` tracks all workflows.

### Generated Scripts

When scripts are generated (via the "Generate Scripts" button), the converter produces:

```
<project-root>/
├── setup.sh                          ← public entry point (committed to repo)
├── setup.ps1                         ← public entry point (committed to repo)
└── .project-igniter/
    ├── setup.sh                      ← orchestrator (flag parsing, drift, routing)
    ├── setup.ps1                     ← orchestrator
    ├── workflows.json                ← index (schema, project defs, env refs)
    ├── workflows/<id>.json           ← individual workflow models
    └── scripts/<project>/<env>/
        ├── setup.sh                  ← per-environment execution script
        └── setup.ps1
```

No `chmod +x` is needed on any generated file — the chain uses `exec bash` and
PowerShell's `&` invocation throughout.

**Contributor workflow:**
```bash
git clone <repo>
bash setup.sh              # prompts for inputs, runs setup steps
# or with a one-time chmod:
chmod +x setup.sh && ./setup.sh
```

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop Framework | Tauri v2 |
| Frontend | React 19, TypeScript |
| State Management | Zustand 5 |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 4 |
| Drag & Drop | @dnd-kit/sortable |
| Backend | Rust (Tauri commands) |

## Editor UI

The workflow editor is a 3-panel layout:

- **Left**: Context variables panel — lists all variables referenced across steps
- **Center**: Workflow tree — visual tree editor with drag-to-reorder, expand/collapse for branches, and an "Add Step" button
- **Right**: Properties panel — form editor for the selected step's properties

## Current Status

Early development. Focus is on workflow modeling and the visual editor.
