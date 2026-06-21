import {
  Workflow,
  Step,
} from "../../workflow/types/workflow";

export type StepReference = {
  id: string;
  name: string;
  type: Step["type"];
};

function collectRecursive(
  workflow: Workflow,
  result: StepReference[]
) {
  for (const step of workflow.steps) {
    if (step.type !== "flow") {
      result.push({
        id: step.id,
        name: step.name,
        type: step.type,
      });
    }

    switch (step.type) {
      case "check":
        collectRecursive(step.onSuccess, result);
        collectRecursive(step.onFailure, result);
        break;

      case "condition":
        collectRecursive(step.onTrue, result);
        collectRecursive(step.onFalse, result);
        break;

      case "command":
        collectRecursive(step.onSuccess, result);
        collectRecursive(step.onFailure, result);
        break;

      case "file":
        collectRecursive(step.onSuccess, result);
        collectRecursive(step.onFailure, result);
        break;

      case "osBranch":
        collectRecursive(step.macos, result);
        collectRecursive(step.linux, result);
        collectRecursive(step.windows, result);
        break;
    }
  }
}

export function collectWorkflowSteps(
  workflow: Workflow
): StepReference[] {
  const result: StepReference[] = [];
  collectRecursive(workflow, result);
  return result;
}
