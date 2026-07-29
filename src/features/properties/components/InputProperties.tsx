import { InputStep } from "../../workflow/types/workflow";
import { sanitizeVarName } from "../../../converter/utils";

type Props = {
    step: InputStep;
    updateStep: (step: InputStep) => void;
};

export default function InputProperties({
    step,
    updateStep,
}: Props) {
    return (
        <div className="flex flex-col gap-4">
            <h3 className="property-section-title">
                Required
            </h3>
            <div>
                <label className="property-label">NAME</label>

                <input
                    className="workflow-input mt-1"
                    value={step.name}
                    onChange={(e) =>
                        updateStep({
                            ...step,
                            name: e.target.value,
                        })
                    }
                />
            </div>

            <div>
                <label className="property-label">VARIABLE NAME</label>

                <input
                    className="workflow-input mt-1"
                    value={step.variableName}
                    onChange={(e) =>
                        updateStep({
                            ...step,
                            variableName:
                                sanitizeVarName(e.target.value),
                        })
                    }
                />
            </div>

            <div>
                <label className="property-label">PROMPT</label>

                <input
                    className="workflow-input mt-1"
                    value={step.prompt}
                    onChange={(e) =>
                        updateStep({
                            ...step,
                            prompt:
                                e.target.value,
                        })
                    }
                />
            </div>
            <h3 className="property-section-title mt-6">
                Optional
            </h3>
            <div>
                <label className="property-label">DESCRIPTION</label>

                <textarea
                    className="workflow-textarea mt-1"
                    value={
                        step.description ?? ""
                    }
                    onChange={(e) =>
                        updateStep({
                            ...step,
                            description:
                                e.target.value,
                        })
                    }
                />
            </div>

            <div>
                <label className="property-label">
                    DEFAULT VALUE
                </label>

                <input
                    className="workflow-input mt-1"
                    value={
                        step.defaultValue ?? ""
                    }
                    onChange={(e) =>
                        updateStep({
                            ...step,
                            defaultValue:
                                e.target.value,
                        })
                    }
                />
            </div>

            <div>
                <label className="property-label">PLACEHOLDER</label>

                <input
                    className="workflow-input mt-1"
                    value={
                        step.placeholder ?? ""
                    }
                    onChange={(e) =>
                        updateStep({
                            ...step,
                            placeholder:
                                e.target.value,
                        })
                    }
                />
            </div>

            <div>
                <label className="property-label">
                    VALIDATION REGEX
                </label>

                <input
                    className="workflow-input mt-1"
                    value={
                        step.validationRegex ??
                        ""
                    }
                    onChange={(e) =>
                        updateStep({
                            ...step,
                            validationRegex:
                                e.target.value,
                        })
                    }
                />
            </div>

            <label className="flex gap-2 items-center">
                <input
                    type="checkbox"
                    checked={step.required}
                    onChange={(e) =>
                        updateStep({
                            ...step,
                            required:
                                e.target.checked,
                        })
                    }
                />

                Required
            </label>

            <label className="flex gap-2 items-center">
                <input
                    type="checkbox"
                    checked={step.secret}
                    onChange={(e) =>
                        updateStep({
                            ...step,
                            secret:
                                e.target.checked,
                        })
                    }
                />

                Secret
            </label>
        </div>
    );
}
