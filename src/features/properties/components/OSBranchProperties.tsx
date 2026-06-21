import { OSBranchStep } from "../../workflow/types/workflow";

type Props = {
  step: OSBranchStep;
  updateStep: (step: OSBranchStep) => void;
};

export default function OSBranchProperties({
  step,
  updateStep,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-xs uppercase text-[var(--muted)] tracking-wide">
          Name
        </label>
        <input
          type="text"
          value={step.name}
          onChange={(e) =>
            updateStep({ ...step, name: e.target.value })
          }
          className="w-full bg-[var(--surface)] border border-[var(--border)] rounded px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-[var(--muted)]">
          Define different workflows for each operating system.
          Click the tabs in the workflow tree to edit each platform's steps.
        </p>
      </div>

      <div className="border-t border-[var(--border)] pt-4 flex flex-col gap-2">
        <h3 className="text-xs uppercase text-[var(--muted)] tracking-wide font-medium">
          Platforms
        </h3>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center gap-3">
            <span className="w-20 text-xs uppercase text-[var(--muted)]">macOS</span>
            <span className="text-xs text-[var(--muted)]">{step.macos.steps.length - 1} steps</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-20 text-xs uppercase text-[var(--muted)]">Linux</span>
            <span className="text-xs text-[var(--muted)]">{step.linux.steps.length - 1} steps</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-20 text-xs uppercase text-[var(--muted)]">Windows</span>
            <span className="text-xs text-[var(--muted)]">{step.windows.steps.length - 1} steps</span>
          </div>
        </div>
      </div>
    </div>
  );
}
