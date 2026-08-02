# Working with the Composer

The Composer is the visual editor where you model a project's setup as a series of steps.

## First run

1. Build and launch the desktop app (see [the setup guide](05-contribution-workflow.md)).
2. On the **Project Selection** screen, click **Open Project** and pick your repository directory.
3. You land on the **Project Overview**. Click **New Workflow** to open the editor.

> The desktop window remembers its size and position between runs (`tauri-plugin-window-state`), and file picking uses the native OS dialog (`@tauri-apps/plugin-dialog`).

## The three-panel editor

The workflow editor (`WorkflowBuilder.tsx`) is a three-panel layout:

| Panel | Purpose |
|-------|---------|
| **Context Variables** (left) | Lists every variable your workflow declares or captures. Hidden until you add at least one. |
| **Workflow Tree** (center) | The visual tree. Drag to reorder, hover a step for controls, add steps. |
| **Properties** (right) | Edit the selected step's fields. Changes apply live as you type. |

To add a step: in the tree, open the canvas's **Add Step** picker, choose a type (hover for a one-line description), and it is inserted at the end of the current branch (or before the remaining steps). Its properties open immediately.

## Project Overview

The overview page has two panels:

- **Left** — the *Projects* list. The `+ Add` button registers a sub-project (see [Monorepo & projects](04-monorepo-projects.md)). Selecting a project scopes the workflow list to it.
- **Right** — the *Workflows* list, with actions to **Open**, **Duplicate** (copies with a fresh id and cleared environment), and **Delete** the selected workflow.

## Reordering

- Drag a step by its grip handle within the *same* branch. You cannot drag across branches.
- The `flow` sentinel step is always anchored at the bottom and is excluded from reordering.

## Saving

- Every structural edit marks the workflow **dirty**. A save writes JSON to `.project-igniter/workflows.json` and `.project-igniter/workflows/<id>.json`.
- Opening a different workflow replaces the current one in memory; unsaved changes are lost.

See [Authoring a workflow](02-authoring-a-workflow.md) for how to design a useful flow.