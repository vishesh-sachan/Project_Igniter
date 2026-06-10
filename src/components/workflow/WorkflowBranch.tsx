import { useEffect, useRef, useState } from "react";
import WorkflowNode from "./WorkflowNode";
import {
    Workflow,
    WorkflowPath,
    Step,
} from "../../models/workflow";
import { createStep } from "../../models/workflowFactory";
import StepPicker from "./StepPicker";

type Props = {
    workflow: Workflow;
    path: WorkflowPath;

    selectedStepId: string | null;

    selectStep: (
        stepId: string | null
    ) => void;

    addStep: (
        path: WorkflowPath,
        step: Step
    ) => void;
};


export default function WorkflowBranch({
    workflow,
    path,
    selectedStepId,
    selectStep,
    addStep,
}: Props) {
    const [showPicker, setShowPicker] = useState(false);
    const branchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!showPicker) {
            return;
        }

        function handleClickOutside(
            event: MouseEvent
        ) {
            if (
                branchRef.current &&
                !branchRef.current.contains(
                    event.target as Node
                )
            ) {
                setShowPicker(false);
            }
        }

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, [showPicker]);

    function handleAddStep(
        type: Step["type"]
    ) {
        addStep(
            path,
            createStep(type)
        );

        setShowPicker(false);
    }

    return (
        <div ref={branchRef} className="flex flex-col gap-4">
            {workflow.steps.map((step) => (
                <WorkflowNode
                    key={step.id}
                    step={step}
                    path={path}
                    selected={selectedStepId === step.id}
                    selectedStepId={selectedStepId}
                    selectStep={selectStep}
                    addStep={addStep}
                />
            ))}

            {!showPicker && (
                <button
                    className="workflow-button w-fit"
                    onClick={() =>
                        setShowPicker(true)
                    }
                >
                    + Add Step
                </button>
            )}

            {showPicker && (
                <div className="inline-block">
                    <StepPicker
                        onSelect={handleAddStep}
                    />
                </div>
            )}
        </div>
    );
}