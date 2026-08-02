# Monorepo & projects

Project Igniter can manage setup for **multiple projects (and environments)** in a single repository. This guide explains the model and the practical workflows.

## The two dimensions

A workflow is attached in exactly one of two ways:

1. **Standalone** — a plain workflow that runs without claiming an environment.
2. **Environment** — the workflow claims a named slot (e.g. `dev`, `prod`). Only one workflow can hold a given `(project, env)` slot at a time.

A `Workflow` has an optional `environment` field. When set, it **claims** that slot for its project. Claiming a slot that another workflow currently holds **releases** the incumbent back to *standalone* — no two workflows can ever share a `(project, env)`.

## Projects

A project is a relative path inside the repo, with a **key**, a **default environment**, its own set of environments, and its own standalone workflows:

```ts
interface ProjectIndex {
  path: string;                 // relative path
  defaultEnv: string;           // e.g. "dev"
  environments: Record<string, EnvEntry>;
  standalone: WorkflowSummary[];
}
```

The default project is `root` (path `.`, default env `dev`). You add others from the **Overview** page with `+ Add`.

The index lives in `.project-igniter/workflows.json`:

```ts
interface WorkflowIndex {
  schema: number;
  defaultProject: string;
  standalone: WorkflowSummary[];            // root-level standalone
  projects: Record<string, ProjectIndex>;
}
```

## Adding a project

1. From the **Project Overview**, click **`+ Add`** under *Projects*.
2. Pick the sub-directory inside your repo with the native folder dialog.
3. The dialog auto-suggests a project name (lowercased relative path); rename it if you want.
4. Confirm.

The new project appears as a pill in the **Projects** list and becomes scoped. You can then create workflows under it.

## Scoping workflows to a project

When you create workflows under a selected project, they are saved under that project's namespace. `saveWorkflow`, `listWorkflows`, and `updateWorkflowMetadata` all take an optional `projectKey`:

- with a `projectKey`, standalone go to `projects[key].standalone` and environment slots to `projects[key].environments`;
- without one (root), standalone go to the top-level `index.standalone`.

Importantly, **the root list shows only root-level workflows**. Sub-project workflows stay scoped to their own project — they do not leak into the root list.

## Generating scripts per project

`generateScriptsService` iterates every project and environment, converts each (project, env) workflow, and writes:

```
.project-igniter/scripts/<project>/<env>/setup.sh
.project-igniter/scripts/<project>/<env>/setup.ps1
```

The orchestrator then routes to the right one based on `--proj` and `--env` (or auto-detection from the current directory).

### Targeting a project when running

```bash
# from the repo root, generate + run a specific project's script
bash setup.sh --proj frontend --env dev
```

## Environments of a project

Each project defines its own environment set. A `defaultEnv` is used when no `--env` is given. When a workflow claims an env that is currently used by another workflow, the other workflow is moved to standalone (its `environment` is cleared). This keeps one active setup per `(project, env)`.

## Example

Repo `monorepo`:

| Project key | path | defaultEnv | environments |
|-------------|------|------------|--------------|
| `root` | `.` | `dev` | `dev` |
| `frontend` | `packages/frontend` | `dev` | `dev`, `prod` |
| `backend` | `packages/backend` | `dev` | `dev` |

After **Generate Scripts** you get `scripts/root/dev`, `scripts/frontend/dev`, `scripts/frontend/prod`, `scripts/backend/dev`, each with a `setup.sh` + `setup.ps1`, plus the two orchestrators and two root wrappers.