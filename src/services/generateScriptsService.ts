import { invoke } from "@tauri-apps/api/core";
import { Workflow } from "../features/workflow/types/workflow";
import { convertAll, ConverterFile } from "../converter/index";

function projectIgniterPath(projectPath: string): string {
  return `${projectPath}/.project-igniter`;
}

function workflowsIndexPath(projectPath: string): string {
  return `${projectIgniterPath(projectPath)}/workflows.json`;
}

function workflowFilePath(projectPath: string, workflowId: string): string {
  return `${projectIgniterPath(projectPath)}/workflows/${workflowId}.json`;
}

async function loadWorkflowIndex(projectPath: string): Promise<import("../features/workflow/types/workflow").WorkflowIndex> {
  try {
    const contents = await invoke("read_file", { path: workflowsIndexPath(projectPath) }) as string;
    return JSON.parse(contents);
  } catch {
    return {
      schema: 1,
      defaultProject: "root",
      standalone: [],
      projects: {
        root: { path: ".", defaultEnv: "dev", environments: {} },
      },
    };
  }
}

async function writeFile(path: string, contents: string): Promise<void> {
  await invoke("write_file", { path, contents });
}

async function loadWorkflow(projectPath: string, workflowId: string): Promise<Workflow> {
  const contents = await invoke("read_file", { path: workflowFilePath(projectPath, workflowId) }) as string;
  return JSON.parse(contents) as Workflow;
}

export async function generateScripts(projectPath: string): Promise<number> {
  const index = await loadWorkflowIndex(projectPath);

  const workflows: Record<string, Record<string, Workflow>> = {};

  for (const [projKey, proj] of Object.entries(index.projects)) {
    workflows[projKey] = {};

    for (const [envName, entry] of Object.entries(proj.environments)) {
      const wf = await loadWorkflow(projectPath, entry.id);
      workflows[projKey][envName] = wf;
    }
  }

  const wfPath = workflowsIndexPath(projectPath);
  const files: ConverterFile[] = convertAll(wfPath, index, workflows);

  for (const file of files) {
    await writeFile(file.path, file.content);
    if (file.path.endsWith(".sh")) {
      await invoke("make_executable", { path: file.path });
    }
  }

  if (index.schema <= 1) {
    index.schema = 2;
    await invoke("write_file", {
      path: wfPath,
      contents: JSON.stringify(index, null, 2),
    });
  }

  return files.length;
}
