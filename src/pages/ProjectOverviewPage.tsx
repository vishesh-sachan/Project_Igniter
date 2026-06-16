import {
  useEffect,
  useState,
} from "react";

import {
  listWorkflows,
  updateWorkflowMetadata,
} from "../services/workflowService";

import { WorkflowSummary } from "../features/workflow/types/workflow";

type Props = {
  projectPath: string;

  onBack: () => void;

  onOpenEditor: (
    workflowId: string
  ) => void;

  onCreateWorkflow: () => void;
};

function formatDate(
  value: string
) {
  return new Date(
    value
  ).toLocaleString();
}

export default function ProjectOverviewPage({
  projectPath,
  onBack,
  onOpenEditor,
  onCreateWorkflow
}: Props) {
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const result =
          await listWorkflows(
            projectPath
          );

        setWorkflows(result);

        if (
          result.length > 0
        ) {
          setSelectedWorkflow(
            result[0]
          );
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [projectPath]);

  function startEditing() {
    if (!selectedWorkflow) return;
    setEditName(selectedWorkflow.name);
    setEditDescription(selectedWorkflow.description ?? "");
    setEditing(true);
  }

  async function saveEditing() {
    if (!selectedWorkflow) return;

    await updateWorkflowMetadata(
      projectPath,
      selectedWorkflow.id,
      { name: editName, description: editDescription }
    );

    const updated: WorkflowSummary = {
      ...selectedWorkflow,
      name: editName,
      description: editDescription,
      updatedAt: new Date().toISOString(),
    };

    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === updated.id ? updated : w
      )
    );
    setSelectedWorkflow(updated);
    setEditing(false);
  }

  function cancelEditing() {
    setEditing(false);
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="panel h-14 flex items-center justify-between px-4 border-b">
        <div className="flex items-center gap-4">
          <div className="text-lg sm:text-2xl font-bold uppercase tracking-tight">
            PROJECT
            <span className="text-[#7CFF6B]">
              _
            </span>
            INSTALLER
          </div>

          <div className="h-4 w-px bg-[var(--border)]" />

          <span className="text-[var(--muted)] text-sm">
            Project Overview
          </span>
        </div>

        <button
          className="workflow-button"
          onClick={onBack}
        >
          Change Project
        </button>
      </header>

      <div className="flex-1 p-6">
        <div className="grid grid-cols-[320px_1fr] gap-6 h-full">
          {/* Left */}
          <div className="panel overflow-hidden">
            <div className="border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
              <div className="text-sm uppercase tracking-wide text-[var(--muted)]">
                Workflows
              </div>

              <button
                className="workflow-button"
                onClick={onCreateWorkflow}
              >
                New
              </button>
            </div>

            <div className="p-3 flex flex-col gap-2">
              {loading && (
                <div className="text-sm text-[var(--muted)]">
                  Loading...
                </div>
              )}

              {!loading &&
                workflows.length ===
                0 && (
                  <div className="text-sm text-[var(--muted)]">
                    No workflows found
                  </div>
                )}

              {workflows.map(
                (workflow) => (
                  <button
                    key={
                      workflow.id
                    }
                    onClick={() =>
                      setSelectedWorkflow(
                        workflow
                      )
                    }
                    className={`text-left p-3 rounded border transition-all ${selectedWorkflow?.id ===
                      workflow.id
                      ? "border-white"
                      : "border-[var(--border)]"
                      }`}
                  >
                    <div className="font-medium">
                      {
                        workflow.name
                      }
                    </div>

                    <div className="text-xs text-[var(--muted)] mt-1">
                      Updated{" "}
                      {
                        formatDate(
                          workflow.updatedAt
                        )
                      }
                    </div>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Right */}
          <div className="panel">
            {!loading &&
              workflows.length ===
              0 && (
                <div className="h-full flex flex-col items-center justify-center gap-4">
                  <div className="text-xl">
                    No Workflows
                  </div>

                  <div className="text-[var(--muted)] text-sm">
                    Create one from
                    analysis or start
                    blank
                  </div>

                  <div className="flex gap-2">
                    <button className="workflow-button primary">
                      Analyze
                      Project
                    </button>

                    <button
                      className="workflow-button"
                      onClick={onCreateWorkflow}
                    >
                      New Workflow
                    </button>
                  </div>
                </div>
              )}

            {selectedWorkflow && (
              <div className="h-full flex flex-col">
                <div className="border-b border-[var(--border)] px-6 py-4">
                  {editing ? (
                    <input
                      className="workflow-input text-2xl font-bold"
                      value={editName}
                      onChange={(e) =>
                        setEditName(e.target.value)
                      }
                    />
                  ) : (
                    <h1 className="text-2xl font-bold">
                      {selectedWorkflow.name}
                    </h1>
                  )}

                  <div className="text-sm text-[var(--muted)] mt-2">
                    {projectPath}
                  </div>
                </div>

                <div className="p-6 flex-1">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="property-section-title">
                        ID
                      </div>

                      <div className="mt-2 text-sm break-all">
                        {selectedWorkflow.id}
                      </div>
                    </div>

                    <div>
                      <div className="property-section-title">
                        DESCRIPTION
                      </div>

                      <div className="mt-2 text-sm">
                        {editing ? (
                          <textarea
                            className="workflow-textarea"
                            value={editDescription}
                            onChange={(e) =>
                              setEditDescription(e.target.value)
                            }
                            rows={3}
                          />
                        ) : (
                          selectedWorkflow.description ?? "-"
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="property-section-title">
                        CREATED
                      </div>

                      <div className="mt-2 text-sm">
                        {formatDate(selectedWorkflow.createdAt)}
                      </div>
                    </div>

                    <div>
                      <div className="property-section-title">
                        UPDATED
                      </div>

                      <div className="mt-2 text-sm">
                        {formatDate(selectedWorkflow.updatedAt)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[var(--border)] p-4 flex gap-2">
                  {editing ? (
                    <>
                      <button
                        className="workflow-button primary"
                        onClick={saveEditing}
                      >
                        Save
                      </button>

                      <button
                        className="workflow-button"
                        onClick={cancelEditing}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="workflow-button primary"
                        onClick={() =>
                          onOpenEditor(selectedWorkflow.id)
                        }
                      >
                        Open Editor
                      </button>

                      <button
                        className="workflow-button"
                        onClick={startEditing}
                      >
                        Edit
                      </button>

                      <button className="workflow-button">
                        Re-analyze
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}