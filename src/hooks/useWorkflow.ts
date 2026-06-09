import { useMemo, useState } from "react";
import {
  Step,
  Workflow,
  WorkflowPath,
} from "../models/workflow";
import {
    findStepRecursive,
    updateStepRecursive,
    deleteStepRecursive,
    addStepToWorkflow
}from "./workflowUtils"

export function useWorkflow() {
  const [workflow, setWorkflow] =
    useState<Workflow>({
      steps: [],
    });

  const [
    selectedStepId,
    setSelectedStepId,
  ] = useState<string | null>(null);

  const selectedStep = useMemo(
  () =>
    selectedStepId === null
      ? null
      : findStepRecursive(
          workflow,
          selectedStepId
        ),
  [workflow, selectedStepId]
);

  function selectStep(
    stepId: string | null
  ) {
    setSelectedStepId(stepId);
  }

  function addStep(
    path: WorkflowPath,
    step: Step
  ) {
    setWorkflow((currentWorkflow) =>
      addStepToWorkflow(
        currentWorkflow,
        path,
        step
      )
    );

    setSelectedStepId(step.id);
  }

  function updateStep(
    updatedStep: Step
  ) {
    setWorkflow((currentWorkflow) =>
      updateStepRecursive(
        currentWorkflow,
        updatedStep
      )
    );
  }

  function deleteStep(
  stepId: string
) {
  const updatedWorkflow =
    deleteStepRecursive(
      workflow,
      stepId
    );

  setWorkflow(updatedWorkflow);

  if (
    selectedStepId &&
    !findStepRecursive(
      updatedWorkflow,
      selectedStepId
    )
  ) {
    setSelectedStepId(null);
  }
}

  return {
    workflow,

    selectedStepId,
    selectedStep,

    selectStep,

    addStep,
    updateStep,
    deleteStep,
  };
}