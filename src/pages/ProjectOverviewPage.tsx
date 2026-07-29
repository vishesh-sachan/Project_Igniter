import {
  useEffect,
  useState,
} from "react";

import { open } from "@tauri-apps/plugin-dialog";

import {
  listWorkflows,
  saveWorkflow,
  loadWorkflow,
  deleteWorkflow,
  updateWorkflowMetadata,
  addProjectEntry,
  loadWorkflowIndexRaw,
} from "../services/workflowService";

import { generateScripts } from "../services/generateScriptsService";

import {
  WorkflowSummary,
  WorkflowIndex,
} from "../features/workflow/types/workflow";
import { createWorkflow } from "../features/workflow/factory/workflowFactory";
import { deepCloneWorkflow } from "../features/workflow/utils/workflowUtils";

type Props = {
  projectPath: string;

  onBack: () => void;

  onOpenEditor: (
    workflowId: string,
    projectKey?: string
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
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [projectIndex, setProjectIndex] = useState<WorkflowIndex | null>(null);
  const [activeProject, setActiveProject] = useState("root");
  const [showAddProject, setShowAddProject] = useState(false);
  const [addProjectPath, setAddProjectPath] = useState("");
  const [addProjectName, setAddProjectName] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [result, index] =
          await Promise.all([
            listWorkflows(projectPath, activeProject),
            loadWorkflowIndexRaw(projectPath),
          ]);

        setWorkflows(result);
        setProjectIndex(index);

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
  }, [projectPath, activeProject]);

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

    await saveWorkflow(projectPath, workflow, activeProject);
    setShowCreateModal(false);
    setWorkflows(await listWorkflows(projectPath, activeProject));
    onOpenEditor(workflow.id, activeProject);
  }

  async function handleDelete() {
    if (!selectedWorkflow) return;
    await deleteWorkflow(projectPath, selectedWorkflow.id);
    setShowDeleteConfirm(false);

    const result = await listWorkflows(projectPath, activeProject);
    setWorkflows(result);
    setSelectedWorkflow(result.length > 0 ? result[0] : null);
  }

  async function handleDuplicate(workflow?: WorkflowSummary) {
    const target = workflow ?? selectedWorkflow;
    if (!target) return;
    const full = await loadWorkflow(projectPath, target.id);
    const copy = deepCloneWorkflow(full);
    await saveWorkflow(projectPath, copy, activeProject);
    setWorkflows(await listWorkflows(projectPath, activeProject));
  }

  async function handleAddProject() {
    const selected = await open({
      directory: true,
      multiple: false,
    });
    if (typeof selected !== "string") return;
    if (!selected.startsWith(projectPath)) {
      setToast("Selected directory is not inside the project root");
      setTimeout(() => setToast(null), 4000);
      return;
    }
    const relative = selected.slice(projectPath.length).replace(/^\//, "");
    if (!relative) {
      setToast("Select a subdirectory, not the root");
      setTimeout(() => setToast(null), 4000);
      return;
    }
    const autoName = relative.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase() || "project";
    setAddProjectPath(relative);
    setAddProjectName(autoName);
    setShowAddProject(true);
  }

  async function handleConfirmAddProject() {
    if (!addProjectName.trim() || !addProjectPath) return;
    try {
      await addProjectEntry(projectPath, addProjectName.trim(), addProjectPath);
      const index = await loadWorkflowIndexRaw(projectPath);
      setProjectIndex(index);
      setActiveProject(addProjectName.trim());
      setToast(`Added project "${addProjectName.trim()}"`);
    } catch (e) {
      setToast(`Failed: ${e}`);
    }
    setShowAddProject(false);
    setTimeout(() => setToast(null), 4000);
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const count = await generateScripts(projectPath);
      setToast(`Generated ${count} script files`);
    } catch (e) {
      setToast(`Failed: ${e}`);
    } finally {
      setGenerating(false);
      setTimeout(() => setToast(null), 4000);
    }
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

        <div className="flex items-center gap-2">
          <button
            className="workflow-button"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? "Generating..." : "Generate Scripts"}
          </button>

          <button
            className="workflow-button"
            onClick={onBack}
          >
            Change Project
          </button>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="grid grid-cols-[320px_1fr] gap-6 h-full">
          {/* Left */}
          <div className="panel overflow-hidden flex flex-col">
            <div className="border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
              <div className="text-sm uppercase tracking-wide text-[var(--muted)]">
                Projects
              </div>

              <button
                className="workflow-button text-xs px-2 py-1"
                onClick={handleAddProject}
              >
                + Add
              </button>
            </div>

            <div className="p-3 flex flex-wrap gap-2 border-b border-[var(--border)]">
              {projectIndex && Object.keys(projectIndex.projects).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveProject(key)}
                  className={`text-xs px-2.5 py-1 rounded border transition-all ${
                    activeProject === key
                      ? "border-[var(--accent)] text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>

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

            <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto">
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
                  <div
                    key={
                      workflow.id
                    }
                    onClick={() =>
                      setSelectedWorkflow(
                        workflow
                      )
                    }
                    className={`flex items-center gap-2 p-3 rounded border transition-all cursor-pointer ${selectedWorkflow?.id ===
                      workflow.id
                      ? "border-white"
                      : "border-[var(--border)]"
                      }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium truncate">
                          {
                            workflow.name
                          }
                        </div>

                        {workflow.environment && (
                          <span className="text-xs uppercase tracking-wide text-[var(--accent)] border border-[var(--accent)] rounded px-1.5 py-0.5 leading-none shrink-0">
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
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleDuplicate(workflow); }}
                      className="text-[var(--muted)] hover:text-[var(--text)] transition-colors p-1 shrink-0"
                      title="Duplicate workflow"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>
                  </div>
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
                    {/* <button className="workflow-button primary">
                      Analyze
                      Project
                    </button> */}

                    <button
                      className="workflow-button primary"
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
                          onOpenEditor(selectedWorkflow.id, activeProject)
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

                      {/* <button className="workflow-button">
                        Re-analyze
                      </button> */}

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

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white text-black text-sm px-4 py-2 rounded shadow-lg">
          {toast}
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

      {showAddProject && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="panel w-96 p-6 flex flex-col gap-4">
            <h2 className="text-lg font-bold">Add Project</h2>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase text-[var(--muted)] tracking-wide">
                Relative Path
              </label>
              <div className="w-full bg-[var(--background)] border border-[var(--border)] rounded px-3 py-2 text-sm text-[var(--muted)]">
                {addProjectPath}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase text-[var(--muted)] tracking-wide">
                Project Name
              </label>
              <input
                type="text"
                value={addProjectName}
                onChange={(e) => setAddProjectName(e.target.value)}
                placeholder="my-project"
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                autoFocus
              />
              <p className="text-xs text-[var(--muted)]">
                Used with <code className="text-[var(--text)]">--proj</code> flag when running setup scripts
              </p>
            </div>

            <div className="flex gap-2 justify-end mt-2">
              <button
                className="workflow-button"
                onClick={() => setShowAddProject(false)}
              >
                Cancel
              </button>

              <button
                className="workflow-button primary"
                onClick={handleConfirmAddProject}
                disabled={!addProjectName.trim()}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}