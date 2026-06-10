import WorkflowBranch from "./WorkflowBranch";
import {
  workflowContainsStep,
} from "./workflowTreeUtils";
import {
  Step,
  WorkflowPath,
} from "../../models/workflow";

type Props = {
  step: Step;

  path: WorkflowPath;

  selected: boolean;
  selectedStepId: string | null;

  selectStep: (
    stepId: string | null
  ) => void;

  addStep: (
    path: WorkflowPath,
    step: Step
  ) => void;
};

export default function WorkflowNode({
  step,
  path,

  selected,
  selectedStepId,

  selectStep,
  addStep,
}: Props) {

  let isExpanded = selected;

  if (step.type === "check") {
    isExpanded =
      isExpanded ||
      workflowContainsStep(
        step.onSuccess,
        selectedStepId
      ) ||
      workflowContainsStep(
        step.onFailure,
        selectedStepId
      );
  }

  if (step.type === "condition") {
    isExpanded =
      isExpanded ||
      workflowContainsStep(
        step.onTrue,
        selectedStepId
      ) ||
      workflowContainsStep(
        step.onFalse,
        selectedStepId
      );
  }

  if (step.type === "command") {
    isExpanded =
      isExpanded ||
      workflowContainsStep(
        step.onSuccess,
        selectedStepId
      ) ||
      workflowContainsStep(
        step.onFailure,
        selectedStepId
      );
  }

  if (step.type === "file") {
    isExpanded =
      isExpanded ||
      workflowContainsStep(
        step.onSuccess,
        selectedStepId
      ) ||
      workflowContainsStep(
        step.onFailure,
        selectedStepId
      );
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        onClick={() =>
          selectStep(step.id)
        }
        className={`workflow-node cursor-pointer ${selected ? "selected" : ""
          }`}
      >
        <div className="font-medium">
          {step.name}
        </div>

        <div className="text-xs text-[var(--muted)]">
          {step.type}
        </div>
      </div>

      {step.type === "check" &&
        isExpanded && (
          <div className="ml-6 border-l border-[var(--border)] pl-4 flex flex-col gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="h-px w-4 bg-[var(--tree-path)]" />

                <span className="text-xs uppercase text-[var(--muted)] tracking-wide">
                  Success
                </span>
              </div>

              <WorkflowBranch
                workflow={step.onSuccess}
                path={[
                  ...path,
                  step.id,
                  "onSuccess",
                ]}
                selectedStepId={selectedStepId}
                selectStep={selectStep}
                addStep={addStep}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="h-px w-4 bg-[var(--tree-path)]" />

                <span className="text-xs uppercase text-[var(--muted)] tracking-wide">
                  Failure
                </span>
              </div>

              <WorkflowBranch
                workflow={step.onFailure}
                path={[
                  ...path,
                  step.id,
                  "onFailure",
                ]}
                selectedStepId={selectedStepId}
                selectStep={selectStep}
                addStep={addStep}
              />
            </div>
          </div>
        )}

      {step.type === "condition" &&
        isExpanded && (
          <div className="ml-6 border-l border-[var(--border)] pl-4 flex flex-col gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="h-px w-4 bg-[var(--tree-path)]" />

                <span className="text-xs uppercase text-[var(--muted)] tracking-wide">
                  True
                </span>
              </div>

              <WorkflowBranch
                workflow={step.onTrue}
                path={[
                  ...path,
                  step.id,
                  "onTrue",
                ]}
                selectedStepId={selectedStepId}
                selectStep={selectStep}
                addStep={addStep}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="h-px w-4 bg-[var(--tree-path)]" />

                <span className="text-xs uppercase text-[var(--muted)] tracking-wide">
                  False
                </span>
              </div>

              <WorkflowBranch
                workflow={step.onFalse}
                path={[
                  ...path,
                  step.id,
                  "onFalse",
                ]}
                selectedStepId={selectedStepId}
                selectStep={selectStep}
                addStep={addStep}
              />
            </div>
          </div>
        )}

      {step.type === "command" &&
        isExpanded && (
          <div className="ml-6 border-l border-[var(--border)] pl-4 flex flex-col gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="h-px w-4 bg-[var(--tree-path)]" />

                <span className="text-xs uppercase text-[var(--muted)] tracking-wide">
                  Success
                </span>
              </div>

              <WorkflowBranch
                workflow={step.onSuccess}
                path={[
                  ...path,
                  step.id,
                  "onSuccess",
                ]}
                selectedStepId={selectedStepId}
                selectStep={selectStep}
                addStep={addStep}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="h-px w-4 bg-[var(--tree-path)]" />

                <span className="text-xs uppercase text-[var(--muted)] tracking-wide">
                  Failure
                </span>
              </div>

              <WorkflowBranch
                workflow={step.onFailure}
                path={[
                  ...path,
                  step.id,
                  "onFailure",
                ]}
                selectedStepId={selectedStepId}
                selectStep={selectStep}
                addStep={addStep}
              />
            </div>
          </div>
        )}

      {step.type === "file" &&
        isExpanded && (
          <div className="ml-6 border-l border-[var(--border)] pl-4 flex flex-col gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="h-px w-4 bg-[var(--tree-path)]" />

                <span className="text-xs uppercase text-[var(--muted)] tracking-wide">
                  Success
                </span>
              </div>

              <WorkflowBranch
                workflow={step.onSuccess}
                path={[
                  ...path,
                  step.id,
                  "onSuccess",
                ]}
                selectedStepId={selectedStepId}
                selectStep={selectStep}
                addStep={addStep}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="h-px w-4 bg-[var(--tree-path)]" />

                <span className="text-xs uppercase text-[var(--muted)] tracking-wide">
                  Failure
                </span>
              </div>

              <WorkflowBranch
                workflow={step.onFailure}
                path={[
                  ...path,
                  step.id,
                  "onFailure",
                ]}
                selectedStepId={selectedStepId}
                selectStep={selectStep}
                addStep={addStep}
              />
            </div>
          </div>
        )}
    </div>
  );
}