import { ConditionStep } from "../../features/workflow/types/workflow";
import { sanitizeVarName, escapeBashValue, escapePwshSingleQuoted } from "../utils";

function bashOp(operator: string): string {
  switch (operator) {
    case "equals": return "=";
    case "notEquals": return "!=";
    case "greaterThan": return "-gt";
    case "greaterThanOrEqual": return "-ge";
    case "lessThan": return "-lt";
    case "lessThanOrEqual": return "-le";
    default: return "=";
  }
}

function pwshOp(operator: string): string {
  switch (operator) {
    case "equals": return "-eq";
    case "notEquals": return "-ne";
    case "greaterThan": return "-gt";
    case "greaterThanOrEqual": return "-ge";
    case "lessThan": return "-lt";
    case "lessThanOrEqual": return "-le";
    case "contains": return "-match";
    default: return "-eq";
  }
}

export function toBash(step: ConditionStep): string {
  const varName = sanitizeVarName(step.variableName);
  const escapedValue = escapeBashValue(step.value);

  if (step.operator === "contains") {
    return `case "\$${varName}" in *"${escapedValue}"*) ;; *) false ;; esac`;
  }

  return `[ "\${${varName}}" ${bashOp(step.operator)} "${escapedValue}" ]`;
}

export function toPowerShell(step: ConditionStep): string {
  const varName = sanitizeVarName(step.variableName);
  const escapedValue = escapePwshSingleQuoted(step.value);
  return `$${varName} ${pwshOp(step.operator)} '${escapedValue}'`;
}
