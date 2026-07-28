import { OSBranchStep } from "../../workflow/types/workflow";

const OSES = ["macos", "linux", "windows"] as const;

type OsName = (typeof OSES)[number];

const MERGE_OPTIONS: Record<OsName, { value: string; label: string }[]> = {
  macos: [
    { value: "", label: "Separate" },
    { value: "linux", label: "Same as Linux" },
    { value: "windows", label: "Same as Windows" },
  ],
  linux: [
    { value: "", label: "Separate" },
    { value: "macos", label: "Same as macOS" },
    { value: "windows", label: "Same as Windows" },
  ],
  windows: [
    { value: "", label: "Separate" },
    { value: "macos", label: "Same as macOS" },
    { value: "linux", label: "Same as Linux" },
  ],
};

type Props = {
  step: OSBranchStep;
  updateStep: (step: OSBranchStep) => void;
};

export default function OSBranchProperties({
  step,
  updateStep,
}: Props) {
  function setMergeFrom(os: OsName, value: string) {
    const key = `${os}MergeFrom` as const;
    updateStep({ ...step, [key]: value || undefined });
  }

  function getMergeFrom(os: OsName): string {
    const key = `${os}MergeFrom` as keyof OSBranchStep;
    return (step[key] as string | undefined) ?? "";
  }

  function stepCount(os: OsName): number {
    return step[os].steps.filter((s) => s.type !== "flow").length;
  }

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

      <div className="border-t border-[var(--border)] pt-4 flex flex-col gap-3">
        <h3 className="text-xs uppercase text-[var(--muted)] tracking-wide font-medium">
          Platforms
        </h3>
        {OSES.map((os) => (
          <div key={os} className="flex items-center gap-3">
            <span className="w-20 text-xs uppercase text-[var(--muted)] shrink-0">{os}</span>
            <span className="text-xs text-[var(--muted)] w-16 shrink-0">
              {getMergeFrom(os) ? "merged" : `${stepCount(os)} steps`}
            </span>
            <select
              value={getMergeFrom(os)}
              onChange={(e) => setMergeFrom(os, e.target.value)}
              className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded px-2 py-1 text-xs outline-none focus:border-[var(--accent)] cursor-pointer"
            >
              {MERGE_OPTIONS[os].map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
