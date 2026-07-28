import { Step } from "../types/workflow";

type Props = {
  onSelect: (type: Step["type"]) => void;
};

const STEP_TYPES: Step["type"][] = [
  "input",
  "information",
  "check",
  "condition",
  "command",
  "choice",
  "file",
  "osBranch",
];

const DESCRIPTIONS: Record<Step["type"], string> = {
  input: "Prompts user for input",
  information: "Shows information to the user",
  check: "Verifies a system condition",
  condition: "Compares against a context variable",
  command: "Executes a shell command",
  choice: "Presents selectable options",
  file: "Creates or modifies a file",
  osBranch: "Branches based on operating system",
  flow: "",
};

export default function StepPicker({
  onSelect,
}: Props) {
  return (
    <div className="panel p-2 flex flex-col gap-2 w-56">
      {STEP_TYPES.map((type) => (
        <button
          key={type}
          className="workflow-button text-left group relative"
          onClick={() => onSelect(type)}
        >
          {type}
          <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded text-xs text-[var(--text)] bg-[var(--panel)] border border-[var(--border)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 group-hover:delay-500 pointer-events-none z-50 shadow-lg">
            {DESCRIPTIONS[type]}
          </span>
        </button>
      ))}
    </div>
  );
}
