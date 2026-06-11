import { useEffect } from "react";
import TopBar from "../components/layout/TopBar";
import WorkflowTree from "../components/workflow/WorkflowTree";
import PropertiesPanel from "../components/properties/PropertiesPanel";
import { collectContextVariables } from "../models/contextVariables";
import { useWorkflow } from "../hooks/useWorkflow";
import { collectWorkflowSteps } from "../models/workflowUtils";
import ContextVariablesPanel from "../components/context/ContextVariablesPanel";
import { loadWorkflow } from "../services/workflowService";
import { createWorkflow } from "../models/workflowFactory";

type Props = {
    projectPath: string;
    workflowId?: string;
};

export default function WorkflowBuilder({
    projectPath,
    workflowId,
}: Props) {
    const workflowState = useWorkflow();
    const variables = collectContextVariables(
        workflowState.workflow
    );
    const stepReferences = collectWorkflowSteps(
        workflowState.workflow
    );

    useEffect(() => {
        async function load() {
            if (!workflowId) {
                workflowState.setWorkflowState(
                    createWorkflow()
                );

                return;
            }

            const workflow =
                await loadWorkflow(
                    projectPath,
                    workflowId
                );

            workflowState.setWorkflowState(
                workflow
            );
        }

        load();
    }, [projectPath, workflowId]);

    return (
        <div className="h-screen flex flex-col">
            <TopBar
                workflowName={
                    workflowState.workflow.name
                }
            />

            <div className="flex-1 p-6 overflow-hidden">
                <div className="h-full flex gap-6">
                    {variables.length > 0 && (
                        <aside className="panel w-72 overflow-auto">
                            <ContextVariablesPanel
                                variables={variables}
                            />
                        </aside>
                    )}

                    <main className="panel grid-background flex-1 overflow-auto">
                        <WorkflowTree
                            workflow={workflowState.workflow}
                            selectedStepId={
                                workflowState.selectedStepId
                            }
                            selectStep={
                                workflowState.selectStep
                            }
                            addStep={workflowState.addStep}
                        />
                    </main>

                    <aside className="panel w-96 overflow-auto">
                        <div className="panel-header">
                            Properties
                        </div>

                        <PropertiesPanel
                            selectedStep={
                                workflowState.selectedStep
                            }
                            updateStep={
                                workflowState.updateStep
                            }
                            variables={variables}
                            stepReferences={
                                stepReferences
                            }
                            deleteStep={
                                workflowState.deleteStep
                            }
                        />
                    </aside>
                </div>
            </div>
        </div>
    );
}