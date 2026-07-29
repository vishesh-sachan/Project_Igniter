import { invoke } from "@tauri-apps/api/core";
import {
  Workflow,
  WorkflowSummary,
  WorkflowIndex,
} from "../features/workflow/types/workflow";

function projectIgniterPath(projectPath: string): string {
  return `${projectPath}/.project-igniter`;
}

function workflowsIndexPath(projectPath: string): string {
  return `${projectIgniterPath(projectPath)}/workflows.json`;
}

function workflowPath(projectPath: string, workflowId: string): string {
  return `${projectIgniterPath(projectPath)}/workflows/${workflowId}.json`;
}

function createDefaultIndex(): WorkflowIndex {
  return {
    schema: 1,
    defaultProject: "root",
    standalone: [],
    projects: {
      root: {
        path: ".",
        defaultEnv: "dev",
        environments: {},
        standalone: [],
      },
    },
  };
}

async function readFile(path: string): Promise<string> {
  return invoke("read_file", { path });
}

async function writeFile(path: string, contents: string): Promise<void> {
  await invoke("write_file", { path, contents });
}

async function deleteFile(path: string): Promise<void> {
  await invoke("delete_file", { path });
}

function workflowToSummary(workflow: Workflow): WorkflowSummary {
  return {
    id: workflow.id,
    name: workflow.name,
    description: workflow.description,
    environment: workflow.environment,
    createdAt: workflow.createdAt,
    updatedAt: workflow.updatedAt,
  };
}

async function loadWorkflowIndex(projectPath: string): Promise<WorkflowIndex> {
  try {
    const contents = await readFile(workflowsIndexPath(projectPath));
    return JSON.parse(contents) as WorkflowIndex;
  } catch {
    return createDefaultIndex();
  }
}

async function saveWorkflowIndex(projectPath: string, index: WorkflowIndex): Promise<void> {
  await writeFile(workflowsIndexPath(projectPath), JSON.stringify(index, null, 2));
}

function removeFromIndex(index: WorkflowIndex, workflowId: string): void {
  index.standalone = index.standalone.filter((s) => s.id !== workflowId);

  for (const project of Object.values(index.projects)) {
    if (project.standalone) {
      project.standalone = project.standalone.filter((s) => s.id !== workflowId);
    }
    for (const envName of Object.keys(project.environments)) {
      if (project.environments[envName].id === workflowId) {
        delete project.environments[envName];
      }
    }
  }
}

async function releaseEnvironment(
  projectPath: string,
  index: WorkflowIndex,
  envName: string,
  exceptWorkflowId: string,
  projectKey: string,
): Promise<void> {
  const project = index.projects[projectKey];
  if (!project) return;
  const existing = project.environments[envName];
  if (!existing || existing.id === exceptWorkflowId) return;

  const other = await loadWorkflow(projectPath, existing.id);
  other.environment = undefined;
  other.updatedAt = new Date().toISOString();
  await writeFile(workflowPath(projectPath, existing.id), JSON.stringify(other, null, 2));

  delete project.environments[envName];
  project.standalone.push(workflowToSummary(other));
}

export async function saveWorkflow(projectPath: string, workflow: Workflow, projectKey?: string): Promise<void> {
  try {
    const index = await loadWorkflowIndex(projectPath);
    const summary = workflowToSummary(workflow);

    removeFromIndex(index, workflow.id);

    if (workflow.environment) {
      const key = projectKey ?? index.defaultProject;
      await releaseEnvironment(projectPath, index, workflow.environment, workflow.id, key);
      const project = index.projects[key];
      if (project) project.environments[workflow.environment] = summary;
    } else {
      if (projectKey && projectKey !== "root") {
        const project = index.projects[projectKey];
        if (project) project.standalone.push(summary);
      } else {
        index.standalone.push(summary);
      }
    }

    await saveWorkflowIndex(projectPath, index);
    await writeFile(workflowPath(projectPath, workflow.id), JSON.stringify(workflow, null, 2));
  } catch (error) {
    throw new Error(`Failed to save workflow: ${error}`);
  }
}

export async function loadWorkflow(projectPath: string, workflowId: string): Promise<Workflow> {
  try {
    const contents = await readFile(workflowPath(projectPath, workflowId));
    return JSON.parse(contents);
  } catch (error) {
    throw new Error(`Failed to load workflow: ${error}`);
  }
}

export async function listWorkflows(projectPath: string, projectKey?: string): Promise<WorkflowSummary[]> {
  const index = await loadWorkflowIndex(projectPath);

  if (projectKey && projectKey !== "root") {
    const project = index.projects[projectKey];
    if (!project) return [];
    const summaries: WorkflowSummary[] = [...(project.standalone ?? [])];
    for (const [envName, entry] of Object.entries(project.environments)) {
      summaries.push({ ...entry, environment: envName });
    }
    return summaries;
  }

  const root = index.projects.root;
  const summaries: WorkflowSummary[] = [...index.standalone];
  if (root) {
    for (const [envName, entry] of Object.entries(root.environments)) {
      summaries.push({ ...entry, environment: envName });
    }
  }
  return summaries;
}

export async function workflowExists(projectPath: string): Promise<boolean> {
  const workflows = await listWorkflows(projectPath);
  return workflows.length > 0;
}

export async function deleteWorkflow(projectPath: string, workflowId: string): Promise<void> {
  try {
    const index = await loadWorkflowIndex(projectPath);
    removeFromIndex(index, workflowId);
    await saveWorkflowIndex(projectPath, index);
    await deleteFile(workflowPath(projectPath, workflowId));
  } catch (error) {
    throw new Error(`Failed to delete workflow: ${error}`);
  }
}

export async function updateWorkflowMetadata(
  projectPath: string,
  workflowId: string,
  updates: { name?: string; description?: string },
  projectKey?: string,
): Promise<void> {
  try {
    const workflow = await loadWorkflow(projectPath, workflowId);
    workflow.name = updates.name ?? workflow.name;
    workflow.description = updates.description ?? workflow.description;
    workflow.updatedAt = new Date().toISOString();

    await writeFile(workflowPath(projectPath, workflowId), JSON.stringify(workflow, null, 2));

    const index = await loadWorkflowIndex(projectPath);
    const summary = workflowToSummary(workflow);

    removeFromIndex(index, workflowId);

    if (workflow.environment) {
      const key = projectKey ?? index.defaultProject;
      await releaseEnvironment(projectPath, index, workflow.environment, workflow.id, key);
      const project = index.projects[key];
      if (project) project.environments[workflow.environment] = summary;
    } else {
      if (projectKey && projectKey !== "root") {
        const project = index.projects[projectKey];
        if (project) project.standalone.push(summary);
      } else {
        index.standalone.push(summary);
      }
    }

    await saveWorkflowIndex(projectPath, index);
  } catch (error) {
    throw new Error(`Failed to update workflow metadata: ${error}`);
  }
}

export async function addProjectEntry(
  projectPath: string,
  projectKey: string,
  relativePath: string,
): Promise<void> {
  const index = await loadWorkflowIndex(projectPath);

  if (index.projects[projectKey]) {
    throw new Error(`Project "${projectKey}" already exists`);
  }

  index.projects[projectKey] = {
    path: relativePath,
    defaultEnv: "dev",
    environments: {},
    standalone: [],
  };

  await saveWorkflowIndex(projectPath, index);
}

export async function loadWorkflowIndexRaw(
  projectPath: string,
): Promise<import("../features/workflow/types/workflow").WorkflowIndex> {
  return loadWorkflowIndex(projectPath);
}
