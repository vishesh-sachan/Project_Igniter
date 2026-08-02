# Pattern: OS merge (`Same as`)

An `osBranch` step stores three sub-workflows (`macos`, `linux`, `windows`). When the same steps are needed on two or more platforms, repeating all three wastes maintenance and drifts easily. The **merge** pattern lets you author one branch and reuse it in others.

## The fields

```ts
interface OSBranchStep {
  macos: Workflow;
  linux: Workflow;
  windows: Workflow;
  macosMergeFrom?: "linux" | "windows";
  linuxMergeFrom?: "macos" | "windows";
  windowsMergeFrom?: "macos" | "linux";
}
```

In the UI these come from the **Same as** dropdown on each branch.

## Resolution time (not storage time)

`resolveOSMerges(workflow)` runs at **generation time**, before the converter. For each branch that has a `…MergeFrom` set, it deep-clones the source branch into the target:

```ts
if (osStep.windowsMergeFrom === "linux") windows = deepCloneWorkflow(linux);
```

Because the copy happens at generate time:

- The stored workflow keeps each branch independent.
- Editing the canonical branch later gets re-copied on next generate — the three never silently diverge.
- The clone recursively resolves nested osBranches too (`resolveOSMerges` recurse into each).

## Where it's called

```ts
// generateScriptsService.ts
workflows[projKey][envName] = resolveOSMerges(wf);
```

The function is **pure** — it returns a new workflow and never mutates the source object in storage.

## Why pure + at generation

- **Dry storage**: the canonical content is stored exactly once.
- **Auditability**: converters don't need `mergeFrom` awareness.
- **Testing**: `resolveOSMerges` is a pure input→output transform you can unit test.

> Implementation: `resolveOSMerges` + `resolveOSMergesInStep` in `src/features/workflow/utils/workflowUtils.ts`.