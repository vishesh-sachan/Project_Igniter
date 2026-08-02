# Step types (reference)

The authoritative definitions live in `src/features/workflow/types/workflow.ts`. What follows is the field-by-field guide for every step type, including how each is converted to Bash and PowerShell.

Base fields on **every** step:

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` (UUID) | Stable identity, used in the `NEXT` dispatch. |
| `name` | `string` | The node label shown in the editor. |
| `type` | one of the types below | |

---

## 1. `input` — prompt for text

| Field | Type | Notes |
|-------|------|-------|
| `variableName` | `string` | Stored variable; sanitised on save. |
| `prompt` | `string` | Prompt text. |
| `description?` | `string` | Metadata only. |
| `defaultValue?` | `string` | Shown as `[default]`; used if empty. |
| `required` | `boolean` | Re-prompts until non-empty. |
| `secret` | `boolean` | Bash uses `read -s` (no echo). |
| `validationRegex?` | `string` | Re-prompts until matches. |

Converter: loads saved state; if **empty**, prompts (with validation loop), then persists via `save-state`. If a value is already saved, later rotations skip the prompt entirely.

---

## 2. `information` — `InformationStep`

| Field | Type |
|-------|------|
| `title` | `string` |
| `content` | `string` |

Converter: prints a message (title + content) and passes on.

---

## 3. `choice` — selectable options

| Field | Type | Notes |
|-------|------|-------|
| `variableName` | `string` | Stored variable. |
| `prompt` | `string` | Prompt shown. |
| `options` | `string[]` | Choices presented. |
| `defaultValue?` | `string` | Used when nothing valid chosen. |
| `allowCustomValue` | `boolean` | Lets the user type a value outside the list. |

Converter: builds `$options` (PowerShell) or a `select` (Bash) and lets the user choose by number; optionally allows a typed custom value.

---

## 4. `check` — verify a condition

| Field | Type | Notes |
|-------|------|-------|
| `checkType` | one of the four below | |
| `onSuccess`, `onFailure` | `Workflow` | Sub-branches. |

`checkType` variants:

| Type | Fields | Converted to (Bash) |
|------|--------|---------------------|
| `command` | `command`, `expectedExitCode` | run command; `[ $? -eq N ]` |
| `fileExists` | `path` | `[ -f "…" ]` |
| `directoryExists` | `path` | `[ -d "…" ]` |
| `environmentVariable` | `variableName` | `[ -n "${VAR+x}" ]` |

---

## 5. `condition` — compare a variable

| Field | Type | Notes |
|-------|------|-------|
| `variableName` | `string` | Compared. |
| `operator` | one of: `equals · notEquals · greaterThan · greaterThanOrEqual · lessThan · lessThanOrEqual · contains` | |
| `value` | `string` | Compared against (may use `{{var}}`). |
| `onTrue`, `onFalse` | `Workflow` | Sub-branches. |

`contains` uses a Bash `case` glob on the value; comparisons use `[ "$VAR" OP "value" ]`. PowerShell uses `-match` for `contains` and `-eq/-ne/-gt/…` otherwise.

---

## 6. `command` — run a shell command

| Field | Type | Notes |
|-------|------|-------|
| `command` | `string` | May reference variables. |
| `workingDirectory?` | `string` | `cd` into it first. |
| `captureStdoutTo?` | `string` | Mutually exclusive with `captureExitCodeTo` — if both are set, `captureStdoutTo` wins and a warning is logged. |
| `captureStderrTo?` | `string` | |
| `captureExitCodeTo?` | `string` | Saves `$?` / `$LASTEXITCODE`. |
| `onSuccess`, `onFailure` | `Workflow` | Branches on exit status. |

Converter: interpolate, optionally wrap in `cd`, capture into a variable if requested, then branch on exit code.

---

## 7. `file` — write to a file

| Field | Type | Notes |
|-------|------|-------|
| `filePath` | `string` | Path (may contain `{{var}}`). |
| `operation` | one of | See below. |
| `onSuccess`, `onFailure` | `Workflow` | Branch on the operation's exit status. |

`operation` variants:

| variant | Fields | Bash output |
|---------|--------|-------------|
| `createOrOverwrite` | `content` | `cat > "…" << EOF\n…\nEOF` |
| `append` | `content` | `cat >> "…" << EOF\n…\nEOF` |
| `replaceText` | `search`, `replace` | `sed -i 's|…|…|g' "…"` |

---

## 8. `osBranch` — branch by OS

| Field | Type | Notes |
|-------|------|-------|
| `macos`, `linux`, `windows` | `Workflow` | Per-OS sub-branches. |
| `macosMergeFrom?` / `linuxMergeFrom?` / `windowsMergeFrom?` | other OS key | So as to reuse another branch at generation time. |

Converter (Bash) selects NEXT via `case "$(uname -s)"`. PowerShell branches on `$PSVersionTable.Platform` / `OS`. Empty branches produce no code; resolution of `mergeFrom` happens before conversion via `resolveOSMerges`.

---

## 9. `flow` — control marker (internal)

| Field | Type | Notes |
|-------|------|-------|
| `flowType` | `{ type: "continue" }` (or `jump`) | Editor only exposes `continue`. |

`continue` is the sentinel that terminates a sub-branch — the converter points it back to the enclosing step's successor. `jump` (with `targetStepId`) exists in the type but is not currently editable.