type Props = {
  onClick: () => void;
};

export default function AddStepButton({
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className="workflow-button"
    >
      + Add Step
    </button>
  );
}