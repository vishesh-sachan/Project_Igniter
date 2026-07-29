import {
    CheckStep,
    CheckType,
    CommandCheck,
    FileExistsCheck,
    DirectoryExistsCheck,
    EnvironmentVariableCheck,
} from "../../workflow/types/workflow";
import { sanitizeVarName } from "../../../converter/utils";

type Props = {
    step: CheckStep;
    updateStep: (step: CheckStep) => void;
};

export default function CheckProperties({
    step,
    updateStep,
}: Props) {
    function updateCheckType(
        checkType: CheckType
    ) {
        updateStep({
            ...step,
            checkType,
        });
    }

    return (
        <div className="flex flex-col gap-3">
            <h3 className="property-section-title">
                Required
            </h3>

            <div>
                <label className="property-label">
                    NAME
                </label>

                <input
                    className="workflow-input"
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
                <label className="property-label">
                    CHECK TYPE
                </label>

                <select
                    className="workflow-select"
                    value={step.checkType.type}
                    onChange={(e) => {
                        switch (
                        e.target.value
                        ) {
                            case "command":
                                updateCheckType({
                                    type: "command",
                                    command: "",
                                    expectedExitCode: 0,
                                });
                                break;

                            case "fileExists":
                                updateCheckType({
                                    type: "fileExists",
                                    path: "",
                                });
                                break;

                            case "directoryExists":
                                updateCheckType({
                                    type:
                                        "directoryExists",
                                    path: "",
                                });
                                break;

                            case "environmentVariable":
                                updateCheckType({
                                    type:
                                        "environmentVariable",
                                    variableName:
                                        "",
                                });
                                break;
                        }
                    }}
                >
                    <option value="command">
                        Command
                    </option>

                    <option value="fileExists">
                        File Exists
                    </option>

                    <option value="directoryExists">
                        Directory Exists
                    </option>

                    <option value="environmentVariable">
                        Environment Variable Exists
                    </option>
                </select>
            </div>

            {step.checkType.type === "command" && (() => {
                const commandCheck = step.checkType as CommandCheck;

                return (
                    <div>
                        <div>
                            <label className="property-label">
                                COMMAND
                            </label>

                            <input
                                className="workflow-input"
                                value={ commandCheck.command }
                                onChange={(e) =>
                                    updateCheckType({
                                        type: "command",
                                        command:
                                            e.target.value,
                                        expectedExitCode:
                                            commandCheck.expectedExitCode,
                                    })
                                }
                            />
                        </div>

                        <div>
                            <label className="property-label">
                                EXPECTED EXIT CODE
                            </label>

                            <input
                                type="number"
                                className="workflow-input"
                                value={ commandCheck.expectedExitCode }
                                onChange={(e) =>
                                    updateCheckType({
                                        type: "command",
                                        command: commandCheck.command,
                                        expectedExitCode:
                                            Number(
                                                e.target.value
                                            ),
                                    })
                                }
                            />
                        </div>
                    </div>
                );
            })()}

            {step.checkType.type ===
                "fileExists" && (() => {
                    const fileCheck = step.checkType as FileExistsCheck;

                    return (
                        <div>
                            <label className="property-label">
                                FILE PATH
                            </label>

                            <input
                                className="workflow-input"
                                value={fileCheck.path}
                                onChange={(e) =>
                                    updateCheckType({
                                        type: "fileExists",
                                        path: e.target.value,
                                    })
                                }
                            />
                        </div>
                    );
                })()}

            {step.checkType.type ===
                "directoryExists" && (() => {
                    const directoryCheck = step.checkType as DirectoryExistsCheck;

                    return (
                        <div>
                            <label className="property-label">
                                DIRECTORY PATH
                            </label>

                            <input
                                className="workflow-input"
                                value={ directoryCheck.path }
                                onChange={(e) =>
                                    updateCheckType({
                                        type:
                                            "directoryExists",
                                        path:
                                            e.target.value,
                                    })
                                }
                            />
                        </div>
                    );
                })()}

            {step.checkType.type ===
                "environmentVariable" && (() => {
                    const environmentVariableCheck = step.checkType as EnvironmentVariableCheck;

                    return (
                    <div>
                        <label className="property-label">
                            VARIABLE NAME
                        </label>

                        <input
                            className="workflow-input"
                            value={ environmentVariableCheck.variableName }
                            onChange={(e) =>
                                updateCheckType({
                                    type:
                                        "environmentVariable",
                                    variableName:
                                        sanitizeVarName(e.target.value),
                                })
                            }
                        />
                    </div>
                );
                })()}
        </div>
    );
}
