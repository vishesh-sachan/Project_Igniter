import {
  Workflow,
} from "../../models/workflow";

export function workflowContainsStep(
  workflow: Workflow,
  stepId: string | null
): boolean {
  if (!stepId) {
    return false;
  }

  for (const step of workflow.steps) {
    if (step.id === stepId) {
      return true;
    }

    switch (step.type) {
      case "check":
        if (
          workflowContainsStep(
            step.onSuccess,
            stepId
          ) ||
          workflowContainsStep(
            step.onFailure,
            stepId
          )
        ) {
          return true;
        }
        break;

      case "condition":
        if (
          workflowContainsStep(
            step.onTrue,
            stepId
          ) ||
          workflowContainsStep(
            step.onFalse,
            stepId
          )
        ) {
          return true;
        }
        break;

      case "command":
        if (
          workflowContainsStep(
            step.onSuccess,
            stepId
          ) ||
          workflowContainsStep(
            step.onFailure,
            stepId
          )
        ) {
          return true;
        }
        break;

      case "file":
        if (
          workflowContainsStep(
            step.onSuccess,
            stepId
          ) ||
          workflowContainsStep(
            step.onFailure,
            stepId
          )
        ) {
          return true;
        }
        break;
    }
  }

  return false;
}