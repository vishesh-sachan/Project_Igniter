import { ChoiceStep } from "../../workflow/types/workflow";
import { sanitizeVarName } from "../../../converter/utils";

type Props = {
  step: ChoiceStep;
  updateStep: (step: ChoiceStep) => void;
};

export default function ChoiceProperties({
  step,
  updateStep,
}: Props) {
  function updateOption(
    index: number,
    value: string
  ) {
    const options = [...step.options];
    options[index] = value;
    updateStep({ ...step, options });
  }

  function addOption() {
    updateStep({
      ...step,
      options: [...step.options, ""],
    });
  }

  function removeOption(index: number) {
    updateStep({
      ...step,
      options: step.options.filter((_, i) => i !== index),
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="property-section-title">
        Required
      </h3>

      <div>
        <label className="property-label">
          NAME
        </label>

        <input
          className="workflow-input"
          value={step.name}
          onChange={(e) =>
            updateStep({
              ...step,
              name: e.target.value,
            })
          }
        />
      </div>

      <div>
        <label className="property-label">
          VARIABLE NAME
        </label>

        <input
          className="workflow-input"
          value={step.variableName}
          onChange={(e) =>
            updateStep({
              ...step,
              variableName:
                sanitizeVarName(e.target.value),
            })
          }
        />
      </div>

      <div>
        <label className="property-label">
          PROMPT
        </label>

        <input
          className="workflow-input"
          value={step.prompt}
          onChange={(e) =>
            updateStep({
              ...step,
              prompt:
                e.target.value,
            })
          }
        />
      </div>

      <h3 className="property-section-title mt-6">
        Options
      </h3>

      {step.options.map(
        (option, index) => (
          <div
            key={index}
            className="flex gap-2"
          >
            <input
              className="workflow-input"
              value={option}
              onChange={(e) =>
                updateOption(
                  index,
                  e.target.value
                )
              }
            />

            <button
              className="workflow-button"
              onClick={() =>
                removeOption(index)
              }
            >
              ×
            </button>
          </div>
        )
      )}

      <button
        className="workflow-button"
        onClick={addOption}
      >
        + Add Option
      </button>

      <h3 className="property-section-title mt-6">
        Behavior
      </h3>

      <label className="flex gap-2 items-center">
        <input
          type="checkbox"
          checked={step.allowCustomValue}
          onChange={(e) =>
            updateStep({
              ...step,
              allowCustomValue:
                e.target.checked,
            })
          }
        />

        Allow Custom Value
      </label>
    </div>
  );
}
