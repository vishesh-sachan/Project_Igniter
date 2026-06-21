import { invoke } from "@tauri-apps/api/core";
import {
  Workflow,
  WorkflowSummary,
  WorkflowIndex,
} from "../features/workflow/types/workflow";

function projectInstallerPath(projectPath: string): string {
  return `${projectPath}/.project-installer`;
}

function workflowsIndexPath(projectPath: string): string {
  return `${projectInstallerPath(projectPath)}/workflows.json`;
}

function workflowPath(projectPath: string, workflowId: string): string {
  return `${projectInstallerPath(projectPath)}/workflows/${workflowId}.json`;
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
    for (const [envName, entry] of Object.entries(project.environments)) {
      if (entry.id === workflowId) {
        delete project.environments[envName];
      }
    }
  }
}

export async function saveWorkflow(projectPath: string, workflow: Workflow): Promise<void> {
  try {
    const index = await loadWorkflowIndex(projectPath);
    const summary = workflowToSummary(workflow);

    removeFromIndex(index, workflow.id);

    if (workflow.environment) {
      const project = index.projects[index.defaultProject] || index.projects.root;
      project.environments[workflow.environment] = summary;
    } else {
      index.standalone.push(summary);
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

export async function listWorkflows(projectPath: string): Promise<WorkflowSummary[]> {
  const index = await loadWorkflowIndex(projectPath);
  const summaries: WorkflowSummary[] = [...index.standalone];

  for (const project of Object.values(index.projects)) {
    for (const entry of Object.values(project.environments)) {
      summaries.push(entry);
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
      const project = index.projects[index.defaultProject] || index.projects.root;
      project.environments[workflow.environment] = summary;
    } else {
      index.standalone.push(summary);
    }

    await saveWorkflowIndex(projectPath, index);
  } catch (error) {
    throw new Error(`Failed to update workflow metadata: ${error}`);
  }
}
