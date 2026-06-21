import { useEffect, useMemo } from "react";
import TopBar from "../shared/components/TopBar";
import WorkflowTree from "../features/workflow/components/WorkflowTree";
import PropertiesPanel from "../features/properties/components/PropertiesPanel";
import ContextVariablesPanel from "../features/context-variables/components/ContextVariablesPanel";
import { useWorkflowStore } from "../features/workflow/store/useWorkflowStore";
import { collectContextVariables } from "../features/context-variables/utils/collectContextVariables";
import { collectWorkflowSteps } from "../features/workflow-list/utils/collectWorkflowSteps";
import { createWorkflow } from "../features/workflow/factory/workflowFactory";
import { loadWorkflow, saveWorkflow } from "../services/workflowService";

type Props = {
    projectPath: string;
    workflowId?: string;
    onBack: () => void;
};

export default function WorkflowBuilder({
    projectPath,
    workflowId,
    onBack,
}: Props) {
    const workflow = useWorkflowStore((s) => s.workflow);
    const setWorkflow = useWorkflowStore((s) => s.setWorkflow);

    const variables = useMemo(
        () => collectContextVariables(workflow),
        [workflow]
    );
    const stepReferences = useMemo(
        () => collectWorkflowSteps(workflow),
        [workflow]
    );

    const markClean = useWorkflowStore((s) => s.markClean);

    async function handleSave() {
        try {
            await saveWorkflow(projectPath, workflow);
            markClean();
        } catch (error) {
            console.error("Failed to save workflow", error);
        }
    }

    useEffect(() => {
        async function load() {
            if (workflowId) {
                const loaded = await loadWorkflow(projectPath, workflowId);
                setWorkflow(loaded);
            } else {
                setWorkflow(createWorkflow());
            }
        }

        load();
    }, [projectPath, workflowId]);

    return (
        <div className="h-screen flex flex-col">
            <TopBar onSave={handleSave} onBack={onBack} />

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
                        <WorkflowTree />
                    </main>

                    <aside className="panel w-96 overflow-auto">
                        <div className="panel-header">
                            Properties
                        </div>

                        <PropertiesPanel
                            variables={variables}
                            stepReferences={stepReferences}
                        />
                    </aside>
                </div>
            </div>
        </div>
    );
}
