import {
  Step,
  CheckStep,
  ConditionStep,
  CommandStep,
  FileStep,
  OSBranchStep,
  Workflow,
  WorkflowPath,
} from "../types/workflow";

export function deepCloneStep(step: Step): Step {
  const newId = crypto.randomUUID();

  function cloneWorkflow(wf: Workflow): Workflow {
    return {
      ...wf,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: wf.steps.map((s) => deepCloneStep(s)),
    };
  }

  const base = { ...step, id: newId, name: step.name + " (copy)" };

  switch (step.type) {
    case "check":
      return {
        ...base,
        onSuccess: cloneWorkflow(step.onSuccess),
        onFailure: cloneWorkflow(step.onFailure),
      } as CheckStep;
    case "condition":
      return {
        ...base,
        onTrue: cloneWorkflow(step.onTrue),
        onFalse: cloneWorkflow(step.onFalse),
      } as ConditionStep;
    case "command":
      return {
        ...base,
        onSuccess: cloneWorkflow(step.onSuccess),
        onFailure: cloneWorkflow(step.onFailure),
      } as CommandStep;
    case "file":
      return {
        ...base,
        onSuccess: cloneWorkflow(step.onSuccess),
        onFailure: cloneWorkflow(step.onFailure),
      } as FileStep;
    case "osBranch":
      return {
        ...base,
        macos: cloneWorkflow(step.macos),
        linux: cloneWorkflow(step.linux),
        windows: cloneWorkflow(step.windows),
      } as OSBranchStep;
    default:
      return base as Step;
  }
}

export function deepCloneWorkflow(workflow: Workflow): Workflow {
  return {
    ...workflow,
    id: crypto.randomUUID(),
    name: workflow.name + " (copy)",
    environment: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    steps: workflow.steps.map((s) => deepCloneStep(s)),
  };
}

export function resolveOSMerges(workflow: Workflow): Workflow {
  return {
    ...workflow,
    steps: workflow.steps.map((step) => {
      if (step.type !== "osBranch") {
        if (!hasNestedWorkflows(step)) return step;
        return resolveOSMergesInStep(step);
      }

      const osStep = step as OSBranchStep;
      let macos = osStep.macos;
      let linux = osStep.linux;
      let windows = osStep.windows;

      if (osStep.macosMergeFrom === "linux") macos = deepCloneWorkflow(linux);
      else if (osStep.macosMergeFrom === "windows") macos = deepCloneWorkflow(windows);

      if (osStep.linuxMergeFrom === "macos") linux = deepCloneWorkflow(macos);
      else if (osStep.linuxMergeFrom === "windows") linux = deepCloneWorkflow(windows);

      if (osStep.windowsMergeFrom === "macos") windows = deepCloneWorkflow(macos);
      else if (osStep.windowsMergeFrom === "linux") windows = deepCloneWorkflow(linux);

      return {
        ...osStep,
        macos: resolveOSMerges(macos),
        linux: resolveOSMerges(linux),
        windows: resolveOSMerges(windows),
      };
    }),
  };
}

function resolveOSMergesInStep(step: Step): Step {
  switch (step.type) {
    case "check":
      return {
        ...step,
        onSuccess: resolveOSMerges(step.onSuccess),
        onFailure: resolveOSMerges(step.onFailure),
      } as CheckStep;
    case "condition":
      return {
        ...step,
        onTrue: resolveOSMerges(step.onTrue),
        onFalse: resolveOSMerges(step.onFalse),
      } as ConditionStep;
    case "command":
      return {
        ...step,
        onSuccess: resolveOSMerges(step.onSuccess),
        onFailure: resolveOSMerges(step.onFailure),
      } as CommandStep;
    case "file":
      return {
        ...step,
        onSuccess: resolveOSMerges(step.onSuccess),
        onFailure: resolveOSMerges(step.onFailure),
      } as FileStep;
    default:
      return step;
  }
}

type NestedWorkflowStep =
  | CheckStep
  | ConditionStep
  | CommandStep
  | FileStep
  | OSBranchStep;

function hasNestedWorkflows(step: Step): step is NestedWorkflowStep {
  return (
    step.type === "check" ||
    step.type === "condition" ||
    step.type === "command" ||
    step.type === "file" ||
    step.type === "osBranch"
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
        const result = findStepRecursive(step.onSuccess, stepId);
        if (result) return result;
        const failureResult = findStepRecursive(step.onFailure, stepId);
        if (failureResult) return failureResult;
        break;
      }
      case "condition": {
        const result = findStepRecursive(step.onTrue, stepId);
        if (result) return result;
        const falseResult = findStepRecursive(step.onFalse, stepId);
        if (falseResult) return falseResult;
        break;
      }
      case "command": {
        const result = findStepRecursive(step.onSuccess, stepId);
        if (result) return result;
        const failureResult = findStepRecursive(step.onFailure, stepId);
        if (failureResult) return failureResult;
        break;
      }
      case "file": {
        const result = findStepRecursive(step.onSuccess, stepId);
        if (result) return result;
        const failureResult = findStepRecursive(step.onFailure, stepId);
        if (failureResult) return failureResult;
        break;
      }
      case "osBranch": {
        let result = findStepRecursive(step.macos, stepId);
        if (result) return result;
        result = findStepRecursive(step.linux, stepId);
        if (result) return result;
        result = findStepRecursive(step.windows, stepId);
        if (result) return result;
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
            onSuccess: updateStepRecursive(step.onSuccess, updatedStep),
            onFailure: updateStepRecursive(step.onFailure, updatedStep),
          };
        case "condition":
          return {
            ...step,
            onTrue: updateStepRecursive(step.onTrue, updatedStep),
            onFalse: updateStepRecursive(step.onFalse, updatedStep),
          };
        case "command":
          return {
            ...step,
            onSuccess: updateStepRecursive(step.onSuccess, updatedStep),
            onFailure: updateStepRecursive(step.onFailure, updatedStep),
          };
        case "file":
          return {
            ...step,
            onSuccess: updateStepRecursive(step.onSuccess, updatedStep),
            onFailure: updateStepRecursive(step.onFailure, updatedStep),
          };
        case "osBranch":
          return {
            ...step,
            macos: updateStepRecursive(step.macos, updatedStep),
            linux: updateStepRecursive(step.linux, updatedStep),
            windows: updateStepRecursive(step.windows, updatedStep),
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
              onSuccess: deleteStepRecursive(step.onSuccess, stepId),
              onFailure: deleteStepRecursive(step.onFailure, stepId),
            };
          case "condition":
            return {
              ...step,
              onTrue: deleteStepRecursive(step.onTrue, stepId),
              onFalse: deleteStepRecursive(step.onFalse, stepId),
            };
          case "command":
            return {
              ...step,
              onSuccess: deleteStepRecursive(step.onSuccess, stepId),
              onFailure: deleteStepRecursive(step.onFailure, stepId),
            };
          case "file":
            return {
              ...step,
              onSuccess: deleteStepRecursive(step.onSuccess, stepId),
              onFailure: deleteStepRecursive(step.onFailure, stepId),
            };
          case "osBranch":
            return {
              ...step,
              macos: deleteStepRecursive(step.macos, stepId),
              linux: deleteStepRecursive(step.linux, stepId),
              windows: deleteStepRecursive(step.windows, stepId),
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
  if (path.length === 0) {
    const flowIndex = workflow.steps.findIndex(
      (step) => step.type === "flow"
    );

    if (flowIndex === -1) {
      return {
        ...workflow,
        steps: [...workflow.steps, newStep],
      };
    }

    return {
      ...workflow,
      steps: [
        ...workflow.steps.slice(0, flowIndex),
        newStep,
        ...workflow.steps.slice(flowIndex),
      ],
    };
  }

  return {
    ...workflow,
    steps: workflow.steps.map((step) => {
      if (step.id !== path[0]) {
        return step;
      }

      if (!hasNestedWorkflows(step)) {
        return step;
      }

      const branch = path[1];
      const remainingPath = path.slice(2);

      switch (step.type) {
        case "check":
          if (branch === "onSuccess") {
            return { ...step, onSuccess: addStepToWorkflow(step.onSuccess, remainingPath, newStep) };
          }
          if (branch === "onFailure") {
            return { ...step, onFailure: addStepToWorkflow(step.onFailure, remainingPath, newStep) };
          }
          return step;

        case "condition":
          if (branch === "onTrue") {
            return { ...step, onTrue: addStepToWorkflow(step.onTrue, remainingPath, newStep) };
          }
          if (branch === "onFalse") {
            return { ...step, onFalse: addStepToWorkflow(step.onFalse, remainingPath, newStep) };
          }
          return step;

        case "command":
          if (branch === "onSuccess") {
            return { ...step, onSuccess: addStepToWorkflow(step.onSuccess, remainingPath, newStep) };
          }
          if (branch === "onFailure") {
            return { ...step, onFailure: addStepToWorkflow(step.onFailure, remainingPath, newStep) };
          }
          return step;

        case "file":
          if (branch === "onSuccess") {
            return { ...step, onSuccess: addStepToWorkflow(step.onSuccess, remainingPath, newStep) };
          }
          if (branch === "onFailure") {
            return { ...step, onFailure: addStepToWorkflow(step.onFailure, remainingPath, newStep) };
          }
          return step;

        case "osBranch":
          if (branch === "macos") {
            return { ...step, macos: addStepToWorkflow(step.macos, remainingPath, newStep) };
          }
          if (branch === "linux") {
            return { ...step, linux: addStepToWorkflow(step.linux, remainingPath, newStep) };
          }
          if (branch === "windows") {
            return { ...step, windows: addStepToWorkflow(step.windows, remainingPath, newStep) };
          }
          return step;
      }
    }),
  };
}

export function moveStepInWorkflow(
  workflow: Workflow,
  path: WorkflowPath,
  fromIndex: number,
  toIndex: number
): Workflow {
  if (path.length === 0) {
    const steps = [...workflow.steps];
    const [moved] = steps.splice(fromIndex, 1);
    steps.splice(toIndex, 0, moved);
    return { ...workflow, steps };
  }

  return {
    ...workflow,
    steps: workflow.steps.map((step) => {
      if (step.id !== path[0]) return step;
      if (!hasNestedWorkflows(step)) return step;

      const branch = path[1];
      const remainingPath = path.slice(2);

      switch (step.type) {
        case "check":
          if (branch === "onSuccess") {
            return { ...step, onSuccess: moveStepInWorkflow(step.onSuccess, remainingPath, fromIndex, toIndex) };
          }
          if (branch === "onFailure") {
            return { ...step, onFailure: moveStepInWorkflow(step.onFailure, remainingPath, fromIndex, toIndex) };
          }
          return step;

        case "condition":
          if (branch === "onTrue") {
            return { ...step, onTrue: moveStepInWorkflow(step.onTrue, remainingPath, fromIndex, toIndex) };
          }
          if (branch === "onFalse") {
            return { ...step, onFalse: moveStepInWorkflow(step.onFalse, remainingPath, fromIndex, toIndex) };
          }
          return step;

        case "command":
          if (branch === "onSuccess") {
            return { ...step, onSuccess: moveStepInWorkflow(step.onSuccess, remainingPath, fromIndex, toIndex) };
          }
          if (branch === "onFailure") {
            return { ...step, onFailure: moveStepInWorkflow(step.onFailure, remainingPath, fromIndex, toIndex) };
          }
          return step;

        case "file":
          if (branch === "onSuccess") {
            return { ...step, onSuccess: moveStepInWorkflow(step.onSuccess, remainingPath, fromIndex, toIndex) };
          }
          if (branch === "onFailure") {
            return { ...step, onFailure: moveStepInWorkflow(step.onFailure, remainingPath, fromIndex, toIndex) };
          }
          return step;

        case "osBranch":
          if (branch === "macos") {
            return { ...step, macos: moveStepInWorkflow(step.macos, remainingPath, fromIndex, toIndex) };
          }
          if (branch === "linux") {
            return { ...step, linux: moveStepInWorkflow(step.linux, remainingPath, fromIndex, toIndex) };
          }
          if (branch === "windows") {
            return { ...step, windows: moveStepInWorkflow(step.windows, remainingPath, fromIndex, toIndex) };
          }
          return step;
      }
    }),
  };
}

export function touchWorkflow(workflow: Workflow): Workflow {
  return {
    ...workflow,
    updatedAt: new Date().toISOString(),
  };
}

export function duplicateStepInWorkflow(
  workflow: Workflow,
  stepId: string
): Workflow {
  const result = duplicateStepInBranch(workflow, stepId);
  return result.found ? result.workflow : workflow;
}

function duplicateStepInBranch(
  workflow: Workflow,
  stepId: string
): { workflow: Workflow; found: boolean } {
  const index = workflow.steps.findIndex(
    (s) => s.id === stepId
  );

  if (index !== -1) {
    const clone = deepCloneStep(workflow.steps[index]);
    const steps = [...workflow.steps];
    steps.splice(index + 1, 0, clone);
    return { workflow: { ...workflow, steps }, found: true };
  }

  let updatedSteps = [...workflow.steps];
  let found = false;

  updatedSteps = updatedSteps.map((step) => {
    if (found) return step;

    switch (step.type) {
      case "check": {
        const r1 = duplicateStepInBranch(step.onSuccess, stepId);
        if (r1.found) { found = true; return { ...step, onSuccess: r1.workflow }; }
        const r2 = duplicateStepInBranch(step.onFailure, stepId);
        if (r2.found) { found = true; return { ...step, onFailure: r2.workflow }; }
        return step;
      }
      case "condition": {
        const r1 = duplicateStepInBranch(step.onTrue, stepId);
        if (r1.found) { found = true; return { ...step, onTrue: r1.workflow }; }
        const r2 = duplicateStepInBranch(step.onFalse, stepId);
        if (r2.found) { found = true; return { ...step, onFalse: r2.workflow }; }
        return step;
      }
      case "command": {
        const r1 = duplicateStepInBranch(step.onSuccess, stepId);
        if (r1.found) { found = true; return { ...step, onSuccess: r1.workflow }; }
        const r2 = duplicateStepInBranch(step.onFailure, stepId);
        if (r2.found) { found = true; return { ...step, onFailure: r2.workflow }; }
        return step;
      }
      case "file": {
        const r1 = duplicateStepInBranch(step.onSuccess, stepId);
        if (r1.found) { found = true; return { ...step, onSuccess: r1.workflow }; }
        const r2 = duplicateStepInBranch(step.onFailure, stepId);
        if (r2.found) { found = true; return { ...step, onFailure: r2.workflow }; }
        return step;
      }
      case "osBranch": {
        const r1 = duplicateStepInBranch(step.macos, stepId);
        if (r1.found) { found = true; return { ...step, macos: r1.workflow }; }
        const r2 = duplicateStepInBranch(step.linux, stepId);
        if (r2.found) { found = true; return { ...step, linux: r2.workflow }; }
        const r3 = duplicateStepInBranch(step.windows, stepId);
        if (r3.found) { found = true; return { ...step, windows: r3.workflow }; }
        return step;
      }
      default:
        return step;
    }
  });

  return { workflow: { ...workflow, steps: updatedSteps }, found };
}
