import { useMemo } from "react";
import { findStepRecursive } from "../../workflow/utils/workflowUtils";
import { useWorkflowStore } from "../../workflow/store/useWorkflowStore";
import { StepReference } from "../../workflow-list/utils/collectWorkflowSteps";
import CheckProperties from "./CheckProperties";
import ChoiceProperties from "./ChoiceProperties";
import CommandProperties from "./CommandProperties";
import ConditionProperties from "./ConditionProperties";
import FileProperties from "./FileProperties";
import FlowProperties from "./FlowProperties";
import InputProperties from "./InputProperties";
import InformationProperties from "./InformationProperties";
import OSBranchProperties from "./OSBranchProperties";

type Props = {
  variables: string[];
  stepReferences: StepReference[];
};

export default function PropertiesPanel({
  variables,
  stepReferences,
}: Props) {
  const workflow = useWorkflowStore((s) => s.workflow);
  const selectedStepId = useWorkflowStore((s) => s.selectedStepId);
  const updateStep = useWorkflowStore((s) => s.updateStep);
  const deleteStep = useWorkflowStore((s) => s.deleteStep);

  const selectedStep = useMemo(
    () => (selectedStepId ? findStepRecursive(workflow, selectedStepId) : null),
    [workflow, selectedStepId]
  );

  if (!selectedStep) {
    return (
      <div className="p-4">
        No step selected
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4">

      {selectedStep.type === "input" && (
        <InputProperties step={selectedStep} updateStep={updateStep} />
      )}

      {selectedStep.type === "information" && (
        <InformationProperties step={selectedStep} updateStep={updateStep} />
      )}

      {selectedStep.type === "choice" && (
        <ChoiceProperties step={selectedStep} updateStep={updateStep} />
      )}

      {selectedStep.type === "command" && (
        <CommandProperties step={selectedStep} updateStep={updateStep} />
      )}

      {selectedStep.type === "condition" && (
        <ConditionProperties step={selectedStep} updateStep={updateStep} variables={variables} />
      )}

      {selectedStep.type === "check" && (
        <CheckProperties step={selectedStep} updateStep={updateStep} />
      )}

      {selectedStep.type === "file" && (
        <FileProperties step={selectedStep} updateStep={updateStep} />
      )}

      {selectedStep.type === "flow" && (
        <FlowProperties step={selectedStep} updateStep={updateStep} stepReferences={stepReferences} />
      )}

      {selectedStep.type === "osBranch" && (
        <OSBranchProperties step={selectedStep} updateStep={updateStep} />
      )}

      <div className="p-4 border-t border-[var(--border)]">
        {selectedStep.type !== "flow" && (
          <button
            className="workflow-button"
            onClick={() =>
              deleteStep(selectedStep.id)
            }
          >
            Delete Step
          </button>
        )}
      </div>
    </div>
  );
}
