import {
    Workflow,
    Step,
} from "../../workflow/types/workflow";

function addVariable(
    variables: Set<string>,
    value?: string
) {
    if (!value?.trim()) {
        return;
    }
    variables.add(value.trim());
}

function collectFromStep(
    step: Step,
    variables: Set<string>
) {
    switch (step.type) {
        case "input":
            addVariable(variables, step.variableName);
            break;

        case "choice":
            addVariable(variables, step.variableName);
            break;

        case "command":
            addVariable(variables, step.captureStdoutTo);
            addVariable(variables, step.captureStderrTo);
            addVariable(variables, step.captureExitCodeTo);
            collectFromWorkflow(step.onSuccess, variables);
            collectFromWorkflow(step.onFailure, variables);
            break;

        case "check":
            collectFromWorkflow(step.onSuccess, variables);
            collectFromWorkflow(step.onFailure, variables);
            break;

        case "condition":
            collectFromWorkflow(step.onTrue, variables);
            collectFromWorkflow(step.onFalse, variables);
            break;

        case "file":
            collectFromWorkflow(step.onSuccess, variables);
            collectFromWorkflow(step.onFailure, variables);
            break;

        case "osBranch":
            collectFromWorkflow(step.macos, variables);
            collectFromWorkflow(step.linux, variables);
            collectFromWorkflow(step.windows, variables);
            break;

        default:
            break;
    }
}

function collectFromWorkflow(
    workflow: Workflow,
    variables: Set<string>
) {
    for (const step of workflow.steps) {
        collectFromStep(step, variables);
    }
}

export function collectContextVariables(
    workflow: Workflow
): string[] {
    const variables = new Set<string>();
    collectFromWorkflow(workflow, variables);
    return Array.from(variables).sort();
}
