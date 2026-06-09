import {
  Step,
  CheckStep,
  ConditionStep,
  CommandStep,
  FileStep,
  Workflow,
  WorkflowPath,
} from "../models/workflow";


type NestedWorkflowStep =
  | CheckStep
  | ConditionStep
  | CommandStep
  | FileStep;

function hasNestedWorkflows(
  step: Step
): step is NestedWorkflowStep {
  return (
    step.type === "check" ||
    step.type === "condition" ||
    step.type === "command" ||
    step.type === "file"
  );
}

export function findStepRecursive(
  workflow: Workflow,
  stepId: string
): Step | null {
  for (const step of workflow.steps) {
    if (step.id === stepId) {
      return step;
    }

    switch (step.type) {
      case "check": {
        const successResult = findStepRecursive(
          step.onSuccess,
          stepId
        );

        if (successResult) {
          return successResult;
        }

        const failureResult = findStepRecursive(
          step.onFailure,
          stepId
        );

        if (failureResult) {
          return failureResult;
        }

        break;
      }

      case "condition": {
        const trueResult = findStepRecursive(
          step.onTrue,
          stepId
        );

        if (trueResult) {
          return trueResult;
        }

        const falseResult = findStepRecursive(
          step.onFalse,
          stepId
        );

        if (falseResult) {
          return falseResult;
        }

        break;
      }

      case "command": {
        const successResult = findStepRecursive(
          step.onSuccess,
          stepId
        );

        if (successResult) {
          return successResult;
        }

        const failureResult = findStepRecursive(
          step.onFailure,
          stepId
        );

        if (failureResult) {
          return failureResult;
        }

        break;
      }

      case "file": {
        const successResult = findStepRecursive(
          step.onSuccess,
          stepId
        );

        if (successResult) {
          return successResult;
        }

        const failureResult = findStepRecursive(
          step.onFailure,
          stepId
        );

        if (failureResult) {
          return failureResult;
        }

        break;
      }
    }
  }

  return null;
}

export function updateStepRecursive(
  workflow: Workflow,
  updatedStep: Step
): Workflow {
  return {
    ...workflow,
    steps: workflow.steps.map((step) => {
      if (step.id === updatedStep.id) {
        return updatedStep;
      }

      if (!hasNestedWorkflows(step)) {
        return step;
      }

      switch (step.type) {
        case "check":
          return {
            ...step,
            onSuccess: updateStepRecursive(
              step.onSuccess,
              updatedStep
            ),
            onFailure: updateStepRecursive(
              step.onFailure,
              updatedStep
            ),
          };

        case "condition":
          return {
            ...step,
            onTrue: updateStepRecursive(
              step.onTrue,
              updatedStep
            ),
            onFalse: updateStepRecursive(
              step.onFalse,
              updatedStep
            ),
          };

        case "command":
          return {
            ...step,
            onSuccess: updateStepRecursive(
              step.onSuccess,
              updatedStep
            ),
            onFailure: updateStepRecursive(
              step.onFailure,
              updatedStep
            ),
          };

        case "file":
          return {
            ...step,
            onSuccess: updateStepRecursive(
              step.onSuccess,
              updatedStep
            ),
            onFailure: updateStepRecursive(
              step.onFailure,
              updatedStep
            ),
          };
      }
    }),
  };
}

export function deleteStepRecursive(
  workflow: Workflow,
  stepId: string
): Workflow {
  return {
    ...workflow,
    steps: workflow.steps
      .filter((step) => step.id !== stepId)
      .map((step) => {
        if (!hasNestedWorkflows(step)) {
          return step;
        }

        switch (step.type) {
          case "check":
            return {
              ...step,
              onSuccess: deleteStepRecursive(
                step.onSuccess,
                stepId
              ),
              onFailure: deleteStepRecursive(
                step.onFailure,
                stepId
              ),
            };

          case "condition":
            return {
              ...step,
              onTrue: deleteStepRecursive(
                step.onTrue,
                stepId
              ),
              onFalse: deleteStepRecursive(
                step.onFalse,
                stepId
              ),
            };

          case "command":
            return {
              ...step,
              onSuccess: deleteStepRecursive(
                step.onSuccess,
                stepId
              ),
              onFailure: deleteStepRecursive(
                step.onFailure,
                stepId
              ),
            };

          case "file":
            return {
              ...step,
              onSuccess: deleteStepRecursive(
                step.onSuccess,
                stepId
              ),
              onFailure: deleteStepRecursive(
                step.onFailure,
                stepId
              ),
            };
        }
      }),
  };
}


export function addStepToWorkflow(
  workflow: Workflow,
  path: WorkflowPath,
  newStep: Step
): Workflow {
  // Root workflow
  if (path.length === 0) {
    return {
      ...workflow,
      steps: [...workflow.steps, newStep],
    };
  }

  return {
    ...workflow,
    steps: workflow.steps.map((step) => {
      // Not the target step
      if (step.id !== path[0]) {
        return step;
      }

      // Must have nested workflows
      if (!hasNestedWorkflows(step)) {
        return step;
      }

      const branch = path[1];
      const remainingPath = path.slice(2);

      switch (step.type) {
        case "check":
          if (branch === "onSuccess") {
            return {
              ...step,
              onSuccess: addStepToWorkflow(
                step.onSuccess,
                remainingPath,
                newStep
              ),
            };
          }

          if (branch === "onFailure") {
            return {
              ...step,
              onFailure: addStepToWorkflow(
                step.onFailure,
                remainingPath,
                newStep
              ),
            };
          }

          return step;

        case "condition":
          if (branch === "onTrue") {
            return {
              ...step,
              onTrue: addStepToWorkflow(
                step.onTrue,
                remainingPath,
                newStep
              ),
            };
          }

          if (branch === "onFalse") {
            return {
              ...step,
              onFalse: addStepToWorkflow(
                step.onFalse,
                remainingPath,
                newStep
              ),
            };
          }

          return step;

        case "command":
          if (branch === "onSuccess") {
            return {
              ...step,
              onSuccess: addStepToWorkflow(
                step.onSuccess,
                remainingPath,
                newStep
              ),
            };
          }

          if (branch === "onFailure") {
            return {
              ...step,
              onFailure: addStepToWorkflow(
                step.onFailure,
                remainingPath,
                newStep
              ),
            };
          }

          return step;

        case "file":
          if (branch === "onSuccess") {
            return {
              ...step,
              onSuccess: addStepToWorkflow(
                step.onSuccess,
                remainingPath,
                newStep
              ),
            };
          }

          if (branch === "onFailure") {
            return {
              ...step,
              onFailure: addStepToWorkflow(
                step.onFailure,
                remainingPath,
                newStep
              ),
            };
          }

          return step;
      }
    }),
  };
}