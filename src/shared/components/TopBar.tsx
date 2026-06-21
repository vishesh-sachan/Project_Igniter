import { useWorkflowStore } from "../../features/workflow/store/useWorkflowStore";

type Props = {
  onSave: () => void;
  onBack: () => void;
};

export default function TopBar({
  onSave,
  onBack,
}: Props) {
  const workflowName = useWorkflowStore((s) => s.workflow.name);
  const workflowEnv = useWorkflowStore((s) => s.workflow.environment);
  const dirty = useWorkflowStore((s) => s.dirty);
  const updateWorkflowMeta = useWorkflowStore((s) => s.updateWorkflowMeta);

  return (
    <header className="panel h-14 flex items-center justify-between px-4 border-b">
      <div className="flex items-center gap-4">
        <button
          className="workflow-button flex items-center gap-1"
          onClick={onBack}
        >
          ← Back
        </button>

        <div className="h-4 w-px bg-[var(--border)]" />

        <div className="text-lg sm:text-2xl font-bold uppercase tracking-tight">
          PROJECT
          <span className="text-[#7CFF6B]">_</span>
          INSTALLER
        </div>

        <div className="h-4 w-px bg-[var(--border)]" />

        <span className="text-[var(--muted)] text-sm">
          {workflowName}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs uppercase text-[var(--muted)] tracking-wide">
            Env
          </label>
          <select
            value={workflowEnv ?? ""}
            onChange={(e) =>
              updateWorkflowMeta({ environment: e.target.value || undefined })
            }
            className="bg-[var(--surface)] border border-[var(--border)] rounded px-2 py-1 text-xs outline-none focus:border-[var(--accent)]"
          >
            <option value="">None</option>
            <option value="dev">dev</option>
            <option value="staging">staging</option>
            <option value="prod">prod</option>
          </select>
        </div>

        <button className="workflow-button">
          Validate
        </button>

        <button
          className="workflow-button primary"
          onClick={onSave}
          disabled={!dirty}
        >
          Save{dirty ? " *" : ""}
        </button>
      </div>
    </header>
  );
}
