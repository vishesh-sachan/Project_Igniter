# Pattern: State-machine dispatch

Generated setup scripts are **flat**, so the recursive workflow must be made linear. `bash.ts` / `powershell.ts` do this by compiling every step into a **state machine** driven by a single `NEXT` variable.

## The shape

```bash
# preamble: state dir, load_state/save_state helpers
NEXT="<first-step-id>"

while [ -n "$NEXT" ]; do
  case "$NEXT" in
    <step-id-1>)
      # step body...
      NEXT="<step-id-2>"
      ;;
    <step-id-2>)
      ...
      ;;
  esac
done
```

Each step's body is a case arm that ends by assigning the next `NEXT`. Control flow is just "which step id do I point at next?"

## Why this shape

- **Ordering** maps 1:1 to `NEXT` chain (steps execute in array order).
- **Branching** is trivial: an `if` sets `NEXT` on success/failure.
- **Jump** (future `flow`/`jump`) is just `NEXT="<target-id>"`.
- **osBranch** selects `NEXT` from `uname -s`.

## Two-phase generation

`bash.ts` walks the tree in two layers:

1. `generateWorkflow(workflow, followUpId)` — linear walk of a branch's steps; the last step's `NEXT` is the caller-provided `followUpId` (what runs after the whole sub-branch).
2. For branching steps (`check`, `condition`, `command`, `file`, `osBranch`), `generateWorkflow` recurses into each sub-branch, passing `followUpId = nextId` (the step after the enclosing node).

`getFirstStepId(branch)` scans a sub-workflow and returns the id of its first non-sentinel step — the node the *parent* must point to first when it descends into that branch. Empty branches return `null`, and the code simply points to the follow-up instead.

## Step count = case count

Every emitted step becomes one `case` arm keyed by UUID. `indentBody()` guards heredocs (`cat << EOF`) so their delimiters aren't corrupted by indentation when it embeds multi-line step bodies.

## PowerShell version

The same compiler in `powershell.ts` emits a `switch`/loop drive using `$NEXT`.

> See `generateWorkflow` / `generateBranchingStep` in `src/converter/bash.ts` / `powershell.ts` for the live implementation.