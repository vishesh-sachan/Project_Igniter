import { create } from "zustand";
import { Step, Workflow, WorkflowPath } from "../types/workflow";
import {
  findStepRecursive,
  updateStepRecursive,
  deleteStepRecursive,
  addStepToWorkflow,
  touchWorkflow,
} from "../utils/workflowUtils";

function createDefaultWorkflow(): Workflow {
  return {
    id: crypto.randomUUID(),
    name: "New Workflow",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    steps: [],
  };
}

interface WorkflowStore {
  workflow: Workflow;
  selectedStepId: string | null;
  dirty: boolean;

  selectStep: (stepId: string | null) => void;
  setWorkflow: (workflow: Workflow) => void;
  addStep: (path: WorkflowPath, step: Step) => void;
  updateStep: (step: Step) => void;
  deleteStep: (stepId: string) => void;
  updateWorkflowMeta: (meta: { name?: string; environment?: string }) => void;
  markClean: () => void;
}

export const useWorkflowStore = create<WorkflowStore>()((set, get) => ({
  workflow: createDefaultWorkflow(),
  selectedStepId: null,
  dirty: false,

  selectStep: (stepId) => set({ selectedStepId: stepId }),

  setWorkflow: (workflow) => set({ workflow, selectedStepId: null, dirty: false }),

  addStep: (path, step) => {
    set((state) => ({
      workflow: touchWorkflow(addStepToWorkflow(state.workflow, path, step)),
      selectedStepId: step.id,
      dirty: true,
    }));
  },

  updateStep: (updatedStep) => {
    set((state) => ({
      workflow: touchWorkflow(updateStepRecursive(state.workflow, updatedStep)),
      dirty: true,
    }));
  },

  deleteStep: (stepId) => {
    const { workflow, selectedStepId } = get();
    const updatedWorkflow = deleteStepRecursive(workflow, stepId);
    set({
      workflow: touchWorkflow(updatedWorkflow),
      dirty: true,
      selectedStepId:
        selectedStepId && !findStepRecursive(updatedWorkflow, selectedStepId)
          ? null
          : selectedStepId,
    });
  },

  updateWorkflowMeta: (meta) => {
    set((state) => ({
      workflow: touchWorkflow({
        ...state.workflow,
        ...meta,
      }),
      dirty: true,
    }));
  },

  markClean: () => set({ dirty: false }),
}));
