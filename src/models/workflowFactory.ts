import {
    Step,
    FlowStep,
    Workflow,
} from "./workflow";

export function createContinueFlowStep(): FlowStep {
    return {
        id: crypto.randomUUID(),
        type: "flow",
        name: "Continue",
        flowType: {
            type: "continue",
        },
    };
}

export function createEmptyWorkflow(): Workflow {
    return {
        steps: [
            createContinueFlowStep(),
        ],
    };
}

export function createStep(
    type: Step["type"]
): Step {
    const id = crypto.randomUUID();

    switch (type) {
        case "input":
            return {
                id,
                type: "input",
                name: "Input",

                variableName: "",
                prompt: "",

                required: true,
                secret: false,
            };

        case "information":
            return {
                id,
                type: "information",
                name: "Information",

                title: "",
                content: "",
            };

        case "check":
            return {
                id,
                type: "check",
                name: "Check",

                checkType: {
                    type: "command",
                    command: "",
                    expectedExitCode: 0,
                },

                onSuccess: createEmptyWorkflow(),
                onFailure: createEmptyWorkflow(),
            };

        case "condition":
            return {
                id,
                type: "condition",
                name: "Condition",

                variableName: "",
                operator: "equals",
                value: "",

                onTrue: createEmptyWorkflow(),
                onFalse: createEmptyWorkflow(),
            };

        case "command":
            return {
                id,
                type: "command",
                name: "Command",

                command: "",

                onSuccess: createEmptyWorkflow(),
                onFailure: createEmptyWorkflow(),
            };

        case "choice":
            return {
                id,
                type: "choice",
                name: "Choice",

                variableName: "",
                prompt: "",

                options: [],

                allowCustomValue: false,
            };

        case "file":
            return {
                id,
                type: "file",
                name: "File",

                filePath: "",

                operation: {
                    type: "createOrOverwrite",
                    content: "",
                },

                onSuccess: createEmptyWorkflow(),
                onFailure: createEmptyWorkflow(),
            };

        case "flow":
            return {
                id,
                type: "flow",
                name: "Continue",

                flowType: {
                    type: "continue",
                },
            };

        default:
            throw new Error(
                `Unsupported step type: ${type}`
            );

    }
}