import { Step } from "../../models/workflow";

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
  "flow",
];

export default function StepPicker({
  onSelect,
}: Props) {
  return (
    <div className="panel p-2 flex flex-col gap-2 w-56">
      {STEP_TYPES.map((type) => (
        <button
          key={type}
          className="workflow-button text-left"
          onClick={() => onSelect(type)}
        >
          {type}
        </button>
      ))}
    </div>
  );
}