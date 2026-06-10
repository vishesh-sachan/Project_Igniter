import WorkflowBranch from "./WorkflowBranch";

import {
  Workflow,
  WorkflowPath,
  Step,
} from "../../models/workflow";

type Props = {
  workflow: Workflow;

  selectedStepId: string | null;

  selectStep: (
    stepId: string | null
  ) => void;

  addStep: (
    path: WorkflowPath,
    step: Step
  ) => void;
};

export default function WorkflowTree({
  workflow,
  selectedStepId,
  selectStep,
  addStep,
}: Props) {
  return (
    <div className="p-8">
      <WorkflowBranch
        workflow={workflow}
        path={[]}
        selectedStepId={selectedStepId}
        selectStep={selectStep}
        addStep={addStep}
      />
    </div>
  );
}