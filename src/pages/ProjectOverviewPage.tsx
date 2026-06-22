import {
  useEffect,
  useState,
} from "react";

import {
  listWorkflows,
  saveWorkflow,
  deleteWorkflow,
  updateWorkflowMetadata,
} from "../services/workflowService";

import { WorkflowSummary } from "../features/workflow/types/workflow";
import { createWorkflow } from "../features/workflow/factory/workflowFactory";

type Props = {
  projectPath: string;

  onBack: () => void;

  onOpenEditor: (
    workflowId: string
  ) => void;
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
}: Props) {
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  function openCreateModal() {
    setCreateName("");
    setCreateDescription("");
    setShowCreateModal(true);
  }

  async function handleCreate() {
    if (!createName.trim()) return;

    const workflow = createWorkflow();
    workflow.name = createName.trim();
    workflow.description = createDescription.trim() || undefined;

    await saveWorkflow(projectPath, workflow);
    setShowCreateModal(false);
    onOpenEditor(workflow.id);
  }

  async function handleDelete() {
    if (!selectedWorkflow) return;
    await deleteWorkflow(projectPath, selectedWorkflow.id);
    setShowDeleteConfirm(false);

    const updated = workflows.filter((w) => w.id !== selectedWorkflow.id);
    setWorkflows(updated);
    setSelectedWorkflow(updated.length > 0 ? updated[0] : null);
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
            IGNITER
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
                onClick={openCreateModal}
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
                    <div className="flex items-center gap-2">
                      <div className="font-medium">
                        {
                          workflow.name
                        }
                      </div>

                      {workflow.environment && (
                        <span className="text-xs uppercase tracking-wide text-[var(--accent)] border border-[var(--accent)] rounded px-1.5 py-0.5 leading-none">
                          {workflow.environment}
                        </span>
                      )}
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
                      onClick={openCreateModal}
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

                      <button
                        className="workflow-button ml-auto"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDeleteConfirm && selectedWorkflow && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="panel w-96 p-6 flex flex-col gap-4">
            <h2 className="text-lg font-bold">Delete Workflow</h2>
            <p className="text-sm text-[var(--muted)]">
              Are you sure you want to delete <strong>{selectedWorkflow.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end mt-2">
              <button
                className="workflow-button"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="workflow-button"
                style={{ borderColor: "var(--danger, #ef4444)", color: "var(--danger, #ef4444)" }}
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="panel w-96 p-6 flex flex-col gap-4">
            <h2 className="text-lg font-bold">New Workflow</h2>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase text-[var(--muted)] tracking-wide">
                Name
              </label>
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="My Workflow"
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase text-[var(--muted)] tracking-wide">
                Description
              </label>
              <textarea
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                placeholder="Optional description"
                rows={3}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded px-3 py-2 text-sm outline-none focus:border-[var(--accent)] resize-none"
              />
            </div>

            <div className="flex gap-2 justify-end mt-2">
              <button
                className="workflow-button"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>

              <button
                className="workflow-button primary"
                onClick={handleCreate}
                disabled={!createName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}