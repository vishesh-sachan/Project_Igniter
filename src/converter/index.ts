import { Workflow, WorkflowIndex } from "../features/workflow/types/workflow";
import { convertToBash } from "./bash";
import { convertToPowerShell } from "./powershell";
import { generateBashOrchestrator, generatePowerShellOrchestrator, extractProjects } from "./orchestrator";

export interface ConverterFile {
  path: string;
  content: string;
}

export function convertAll(
  workflowsPath: string,
  index: WorkflowIndex,
  workflows: Record<string, Record<string, Workflow>>
): ConverterFile[] {
  const files: ConverterFile[] = [];
  const projects = extractProjects(index);
  const scriptsDir = workflowsPath.replace(/\/workflows\.json$/, "/scripts");

  for (const proj of projects) {
    const envEntries = index.projects[proj.key]?.environments ?? {};
    const envKeys = Object.keys(envEntries);

    if (envKeys.length === 0) {
      const wf = workflows[proj.key]?.[proj.defaultEnv];
      if (wf) {
        const basePath = `${scriptsDir}/${proj.key}/${proj.defaultEnv}`;
        files.push({ path: `${basePath}/setup.sh`, content: convertToBash(wf) });
        files.push({ path: `${basePath}/setup.ps1`, content: convertToPowerShell(wf) });
      }
      continue;
    }

    for (const env of envKeys) {
      const wf = workflows[proj.key]?.[env];
      if (!wf) continue;

      const basePath = `${scriptsDir}/${proj.key}/${env}`;
      files.push({ path: `${basePath}/setup.sh`, content: convertToBash(wf) });
      files.push({ path: `${basePath}/setup.ps1`, content: convertToPowerShell(wf) });
    }
  }

  const orchestratorRoot = workflowsPath.replace(/\/workflows\.json$/, "");
  files.push({
    path: `${orchestratorRoot}/setup.sh`,
    content: generateBashOrchestrator(projects),
  });
  files.push({
    path: `${orchestratorRoot}/setup.ps1`,
    content: generatePowerShellOrchestrator(projects),
  });

  return files;
}
