import TopBar from "../components/layout/TopBar";
import WorkflowTree from "../components/workflow/WorkflowTree";
import PropertiesPanel from "../components/properties/PropertiesPanel";
import { collectContextVariables } from "../models/contextVariables";
import { useWorkflow } from "../hooks/useWorkflow";
import { collectWorkflowSteps } from "../models/workflowUtils";
import ContextVariablesPanel from "../components/context/ContextVariablesPanel";

export default function WorkflowBuilder() {
    const workflowState = useWorkflow();

    const variables = collectContextVariables(
        workflowState.workflow
    );

    const stepReferences = collectWorkflowSteps(
        workflowState.workflow
    );

    return (
        <div className="h-screen flex flex-col">
            <TopBar />

            <div className="flex flex-1 overflow-hidden">
                {variables.length > 0 && (
                    <aside className="w-72 border-r">
                        <ContextVariablesPanel
                            variables={variables}
                        />
                    </aside>
                )}

                <main className="grid-background flex-1 overflow-auto">
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

                <aside className="panel w-96 border-l">
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
    );
}