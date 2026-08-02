# Architecture

This is the five-minute map plus the deep dive. It explains how the app's pieces interlock — the **model** (a recursive workflow tree), the **editor** (a React/Zustand tree editor), the **storage** (JSON on disk), and the **converter** (which turns the model into standalone shell scripts).

## The stack in one picture

```
+--------------------------------------------------------------+
| UI (React 19 + Tailwind)                                   |
|  ProjectSelection   ProjectOverview   WorkflowBuilder      |
+--------------------------------------------------------------+
                                      |
                              feature/ state
                                      v
+--------------------------------------------------------------+
| EDITOR STATE (Zustand)                                     |
|  useWorkflowStore  ->  workflow tree  + selection + dirty    |
|  workflowUtils      ->  pure recursive tree transforms        |
|  workflowFactory    ->  step/workflow constructors            |
+--------------------------------------------------------------+
                                      |
                              service/ persistence
                                      v
+--------------------------------------------------------------+
| SERVICES (Tauri invoke -> Rust FS)                           |
|  workflowService          -> .project-igniter/workflows.json  |
|  generateScriptsService   -> converter output to disk        |
+--------------------------------------------------------------+
                                      |
                              converter/ (pure, no I/O)
                                      v
+--------------------------------------------------------------+
| CONVERTER                                                    |
|  index.ts        -> walks projects/envs, returns files       |
|  bash / powershell -> NEXT state-machine emission            |
|  steps/*        -> per-step-type toBash/toPowerShell        |
|  orchestrator   -> entry-point scripts + drift + routing     |
+--------------------------------------------------------------+
```

The boundary that matters: **everything above the converter is deterministic and pure at generation time**. The converter never touches the filesystem — `convertAll()` returns a list of `{ path, content }` tuples, and the caller (a Tauri command) is responsible for writing them.

## The data model

### Workflow = recursive tree

A workflow is an ordered list of steps. Some step types *contain* their own sub-workflows (branches), which means the whole thing is a tree of arbitrary depth.

```ts
interface Workflow {
  id: string;
  name: string;
  description?: string;
  environment?: string;   // when set, this workflow owns an environment slot
  createdAt: string;
  updatedAt: string;
  steps: Step[];
}
```

`steps` order is execution order. There are 9 step types, described in [Step types](reference/step-types.md):

```
input · information · check · condition · command · choice · file · osBranch · flow
```

`flow` is special: it is a control-flow marker. The only editor-exposed variant is `continue`, which acts as a **sentinel** at the end of every branch. `jump` exists in the type but is not currently editable.

### Branching semantics

These step types own sub-workflows:

| Step | Branches |
|------|----------|
| `check` | `onSuccess`, `onFailure` |
| `condition` | `onTrue`, `onFalse` |
| `command` | `onSuccess`, `onFailure` |
| `file` | `onSuccess`, `onFailure` |
| `osBranch` | `macos`, `linux`, `windows` |

Each branch is *itself* a full `Workflow` initialized with a `continue` sentinel (see [factory](../src/features/workflow/factory/workflowFactory.ts)).

### OS merge

An `osBranch` step may hoist one branch to serve as another via `macosMergeFrom` / `linuxMergeFrom` / `windowsMergeFrom`. In the editor this is the "Same as" dropdown. The merge is **resolved at generation time**, not stored in the script — `resolveOSMerges()` deep-clones the source branch, making edits in the profile branch impossible to lose.

## The editor

### Zustand store

`useWorkflowStore` holds the active workflow, the selected step id, and a dirty flag. Every mutation (`addStep`, `moveStep`, `updateStep`, `deleteStep`, `duplicateStep`) is a pure transform from `workflowUtils` wrapped with `touchWorkflow`, which stamps a fresh `updatedAt`.

### Immutable tree transforms

`workflowUtils.ts` is the heart of editing. It implements the full set of primitives that walk the tree **recursively**. See [patterns/recursive-tree-utils](patterns/recursive-tree-utils.md) for the contract shared by all of them.

The transforms do not mutate — they return new objects. This makes undo and React time travel trivial later.

### Path addressing

The editor addresses a step by a `WorkflowPath`: an array of `stepId | branch`. Example:

```
[ "check-1", "onSuccess", "cmd-2" ]
```

means "inside the `onSuccess` branch of step `cmd-2`". The tree component produces these paths during add/move, and `addStepToWorkflow` / `moveStepInWorkflow` consume them.

### Context variables panel

`collectContextVariables()` walks the tree and gathers every variable declared by `input`, `choice`, and `command` captures and collects them into a deduplicated list. It walks into branches recursively.

## Editor layout

The workflow editor is a 3-panel layout maintained in `WorkflowBuilder.tsx`:

- **Left**: Context Variables panel (only if any variables exist)
- **Center**: Workflow tree (visual, drag-to-reorder, expand collapse)
- **Right**: Properties panel for the selected step

## Persistence

Workflows are stored in the project as JSON:

```
<project-root>/.project-igniter/
├── workflows.json           # index: schema version, projects, environments, standalone
└── workflows/
    └── <workflow-id>.json   # one JSON per workflow
```

`workflows.json` has a `schema: number` field that is **auto-incremented every generate** — see below.

### What flows: root vs project scoping

The index organises workflows into per-project **standalone** lists and per-(project, env) **environment** slots. When a workflow has `environment` set, it claims that slot; claiming a slot that another workflow already holds **releases** the previous holder to standalone (see `releaseEnvironment` in `workflowService.ts`).

## The converter

### Two-layer emission

1. Per-(project, env), a per-step branch emits a **state machine** of `NEXT` pointer assignments (see [patterns/state-machine-dispatch](patterns/state-machine-dispatch.md)). This is `src/converter/bash.ts` / `powershell.ts`.
2. The **orchestrator** (`orchestrator.ts`) emits top-level `setup.sh` / `setup.ps1` that discover the project from `cwd`, parse CLI flags, detect drift, and route to the per-(project, env) script.

`convertAll()` produces both layers, plus the root wrappers. Full details in [generated scripts](guides/03-generated-scripts.md).

### Input & variable interpolation

Everything a user types is escaped at generation time to prevent code injection in generated scripts. Reference the escape helpers used:

| Context | Note |
|--------|------|
| Behavior | Run every value through `interpolateVars` first to expand `{{name}}`, then escape for the target shell |

## Where the files live

| Concern | Files |
|---------|-------|
| Types | `src/features/workflow/types/workflow.ts` |
| Factory | `src/features/workflow/factory/workflowFactory.ts` |
| Store | `src/features/workflow/store/useWorkflowStore.ts` |
| Tree utils | `src/features/workflow/utils/workflowUtils.ts` |
| Storage | `src/services/workflowService.ts` |
| Generation | `src/services/generateScriptsService.ts` |
| Converter | `src/converter/*` |
| Editor | `src/pages/WorkflowBuilder.tsx`, `src/features/workflow/components/*` |
| Pages | `src/pages/*` |