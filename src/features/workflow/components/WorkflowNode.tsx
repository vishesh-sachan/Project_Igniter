import { useState } from "react";
import WorkflowBranch from "./WorkflowBranch";
import {
  workflowContainsStep,
} from "../utils/workflowTreeUtils";
import {
  Step,
  WorkflowPath,
} from "../types/workflow";
import { useWorkflowStore } from "../store/useWorkflowStore";

type Props = {
  step: Step;
  path: WorkflowPath;
  dragHandleProps?: Record<string, unknown>;
  isDragging?: boolean;
};

export default function WorkflowNode({
  step,
  path,
  dragHandleProps,
  isDragging,
}: Props) {
  const [osTab, setOsTab] = useState<"macos" | "linux" | "windows">("macos");
  const selectedStepId = useWorkflowStore((s) => s.selectedStepId);
  const selectStep = useWorkflowStore((s) => s.selectStep);
  const duplicateStep = useWorkflowStore((s) => s.duplicateStep);

  const selected = selectedStepId === step.id;

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

  if (step.type === "osBranch") {
    isExpanded =
      isExpanded ||
      workflowContainsStep(
        step.macos,
        selectedStepId
      ) ||
      workflowContainsStep(
        step.linux,
        selectedStepId
      ) ||
      workflowContainsStep(
        step.windows,
        selectedStepId
      );
  }

  return (
    <div className={`flex flex-col gap-4 ${isDragging ? "opacity-50" : ""}`}>
      <div
        onClick={() =>
          selectStep(step.id)
        }
        className={`workflow-node cursor-pointer ${selected ? "selected" : ""
          }`}
      >
        <div className="flex items-center gap-2">
          {dragHandleProps && (
            <button
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing touch-none px-1 text-[var(--muted)] hover:text-[var(--foreground)] shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="5" cy="4" r="1.5" />
                <circle cx="11" cy="4" r="1.5" />
                <circle cx="5" cy="8" r="1.5" />
                <circle cx="11" cy="8" r="1.5" />
                <circle cx="5" cy="12" r="1.5" />
                <circle cx="11" cy="12" r="1.5" />
              </svg>
            </button>
          )}

          <div className="font-medium">
            {step.name}
          </div>

          {step.type !== "flow" && (
            <button
              onClick={(e) => { e.stopPropagation(); duplicateStep(step.id); }}
              className="ml-auto text-[var(--muted)] hover:text-[var(--text)] transition-colors px-1"
              title="Duplicate step"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          )}
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
              />
            </div>
          </div>
        )}

      {step.type === "osBranch" &&
        isExpanded && (
          <div className="ml-6 border-l border-[var(--border)] pl-4 flex flex-col gap-4">
            <div className="flex gap-1 mb-2">
              {(["macos", "linux", "windows"] as const).map((os) => (
                <button
                  key={os}
                  onClick={(e) => { e.stopPropagation(); setOsTab(os); }}
                  className={`px-3 py-1 text-xs uppercase tracking-wide rounded ${
                    osTab === os
                      ? "bg-[var(--accent)] text-black font-medium"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {os}
                </button>
              ))}
            </div>

            {(() => {
              if (step.type !== "osBranch") return null;
              const mergeKey = `${osTab}MergeFrom` as const;
              const mergeFrom = step[mergeKey];
              if (mergeFrom) {
                return (
                  <div className="text-sm text-[var(--muted)] italic px-3 py-2 border border-dashed border-[var(--border)] rounded">
                    Same as {mergeFrom}
                  </div>
                );
              }
              return (
                <WorkflowBranch
                  workflow={step[osTab]}
                  path={[...path, step.id, osTab]}
                />
              );
            })()}
          </div>
        )}
    </div>
  );
}
