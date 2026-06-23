import { FlowStep } from "../../features/workflow/types/workflow";

export function toBash(step: FlowStep): string | null {
  if (step.flowType.type === "continue") {
    return null;
  }

  return null;
}

export function toPowerShell(step: FlowStep): string | null {
  if (step.flowType.type === "continue") {
    return null;
  }

  return null;
}
