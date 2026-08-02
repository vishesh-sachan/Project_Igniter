# Pattern: Recursive tree utilities

The editor treats a workflow as a tree: the top-level `steps` plus nested `Workflow` objects in branches. Every mutation — add, update, remove, move, duplicate, find — is implemented as a small **recursive transform** in `src/features/workflow/utils/workflowUtils.ts`. They never mutate the tree; they return a new tree.

## The problem

A workflow can nest branches arbitrarily deep (an OS branch inside a condition inside a check). Editing "step X anywhere in the tree" means either carrying a heavy modification path everywhere, or writing near-identical recursion for each branch kind. The old approach repeated the `switch (step.type)` five times per helper.

## The pattern

Each helper is a function `workflow → workflow` that, for every step, either **matches the target** (return the replacement) or **recurse into its branches**. The only differing part is which branch keys each step owns — `onSuccess`/`onFailure`, `onTrue`/`onFalse`, `macos`/`linux`/`windows`.

A central guard keeps non-branching steps cheap:

```ts
function hasNestedWorkflows(step: Step): step is NestedWorkflowStep {
  return (
    step.type === "check" || step.type === "condition" ||
    step.type === "command" || step.type === "file" || step.type === "osBranch"
  );
}
```

Example — `updateStepRecursive`:

```ts
export function updateStepRecursive(workflow, updatedStep): Workflow {
  return {
    ...workflow,
    steps: workflow.steps.map((step) => {
      if (step.id === updatedStep.id) return updatedStep;
      if (!hasNestedWorkflows(step)) return step;
      switch (step.type) {
        case "check":   return { ...step, onSuccess: updateStepRecursive(step.onSuccess, updatedStep),
                                        onFailure: updateStepRecursive(step.onFailure, updatedStep) };
        case "osBranch":return { ...step, macos:   updateStepRecursive(step.macos, updatedStep),
                                        linux:    updateStepRecursive(step.linux, updatedStep),
                                        windows:  updateStepRecursive(step.windows, updatedStep) };
        // ...condition, command, file...
      }
    }),
  };
}
```

`findStepRecursive`, `deleteStepRecursive`, and `moveStepInWorkflow` (with a `fromIndex`/`toIndex` pair) follow the same shape.

## Sentinels

`addStepToWorkflow` and the cursor handling were written to respect the trailing `flow`/`continue` sentinel. When inserting at the top level of a branch, the new step is placed **before** the sentinel so it stays last.

## The `WorkflowPath`

Operators that target a *specific* branch (e.g. `addStepToWorkflow`, `moveStepInWorkflow`) take a `WorkflowPath`: an array alternation of step ids and branch keys. The path encodes how to descend:

```
Indexer: [ <rootStepId>, <branch>, <childStepId>, <branch>, ... ]
```