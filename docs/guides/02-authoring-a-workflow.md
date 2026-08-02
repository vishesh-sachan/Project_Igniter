# Authoring a workflow

This guide walks through designing a realistic setup flow in the Composer. We'll build a small example that asks for a project name, checks for a toolchain, and runs install commands — including OS-specific handling.

Reference the [step-type reference](../reference/step-types.md) for every field.

## 1. Capture inputs first

People enter data once; reuse it everywhere. Add an **Input** step:

- `variableName` — e.g. `PROJECT_NAME` (alphanumeric/underscore; sanitised automatically).
- `prompt` — "What is the project name?"
- `required` — on.
- `defaultValue` — optional fallback shown as `[default]`.
- `secret` — on for passwords (typed invisibly in the generated script).
- `validationRegex` — e.g. `^[a-z0-9-]+$` to enforce typos; the script re-prompts until valid.

Everything the contributor types is persisted under `~/.local/share/project-igniter/<project>/<env>/` and restored on re-run, so setup is idempotent.

## 2. Reference variables anywhere

Inside any text field, use `{{PROJECT_NAME}}`. At generation time it is replaced with the shell reference — e.g. `${PROJECT_NAME}` (Bash) or `$PROJECT_NAME` (PowerShell). This applies to commands, file content, prompts, and conditions.

Referenced-but-never-declared variables appear in the **Context Variables** panel as warnings; declare an `input`/`choice` for each.

## 3. Branch on conditions

- **check** — verify a thing: command exit code, file exists, directory exists, or an env var is set. Branch with `onSuccess` / `onFailure`.
- **condition** — compare a variable (equals / notEquals / greaterThan / … / contains). Branch `onTrue` / `onFalse`.
- **command** — run a shell command. Optionally `captureStdoutTo`, `captureStderrTo`, or `captureExitCodeTo` into variables; then branch `onSuccess` / `onFailure` based on exit state.

Example structure:

```
[Input] APP_NAME
[Command] git clone {{APP_NAME}}
    onSuccess -> [Information] "Cloned"
    onFailure -> [Check] directory exists -> ...
[Command] npm install
```

> `captureStdoutTo` and `captureExitCodeTo` are mutually exclusive — if both are set, the converter keeps `captureStdoutTo` and warns.

## 4. Prototype OS branches

Use **osBranch** when a step differs per OS. It has three branches: `macos`, `linux`, `windows`. Edit each branch inline; empty branches are skipped at run time.

To avoid duplicating the same steps across all three, use the **Same as** dropdown on each branch (`macosMergeFrom`, et al.) to point at another branch (e.g. Windows "Same as Linux"). The copy is applied *at generation time* (`resolveOSMerges`), so the three branches never drift.

## 5. Create files

**file** writes to disk with one of three operations:

- `createOrOverwrite` / `append` — content may reference variables (`{{VAR}}`).
- `replaceText` — `search` / `replace`, applied with line-level semantics.

Tip: for multi-line content (e.g. a config file), use `createOrOverwrite` and paste the template; variable references in the content are interpolated at generation too.

## 6. Keep read-only branches clean

Any branch of a branching step can be empty; converter simply routes to the follow-up. Empty branches that are never used produce no code. Use `information` steps to report and guide rather than to avoid.

## Common patterns

- **First run check-flag**: an env-var check → `onFailure` creates `.env`, `onSuccess` skips.
- **Re-entrancy**: because state is restored, an `input` step with a saved value never re-prompts. Use `--reset` on the scripts to force.
- **Nested OS + condition**: osBranch inside a condition is fine — branch steps nest arbitrarily deep.

When you're done, [generate the scripts](03-generated-scripts.md).