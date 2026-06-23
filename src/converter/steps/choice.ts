import { ChoiceStep } from "../../features/workflow/types/workflow";
import { sanitizeVarName, escapeBashValue, escapePwshSingleQuoted } from "../utils";

export function toBash(step: ChoiceStep): string {
  const varName = sanitizeVarName(step.variableName);
  const lines: string[] = [];

  lines.push(`load_state "${varName}"`);

  lines.push(`if [ -z "\$${varName}" ]; then`);

  if (step.allowCustomValue) {
    lines.push(`  echo "${escapeBashValue(step.prompt)} (or type a custom value)"`);
  } else {
    lines.push(`  echo "${escapeBashValue(step.prompt)}"`);
  }

  lines.push(`  select ${varName} in "${step.options.join('" "')}"; do`);

  if (step.allowCustomValue) {
    lines.push(`    if [ -z "\$${varName}" ]; then`);
    lines.push(`      read -p "Custom value: " ${varName}`);
    lines.push("    fi");
    lines.push("    break");
  } else {
    lines.push(`    if [ -n "\$${varName}" ]; then`);
    lines.push("      break");
    lines.push("    fi");
  }

  lines.push("  done");

  if (step.defaultValue && !step.options.includes(step.defaultValue) && step.allowCustomValue) {
    lines.push(`  ${varName}="\${${varName}:-${escapeBashValue(step.defaultValue)}}"`);
  }

  lines.push(`  save_state "${varName}" "\$${varName}"`);
  lines.push("fi");

  return lines.join("\n");
}

export function toPowerShell(step: ChoiceStep): string {
  const varName = sanitizeVarName(step.variableName);
  const lines: string[] = [];

  lines.push(`Load-State "${varName}"`);

  lines.push(`if ([string]::IsNullOrEmpty(${varName})) {`);

  const escapedOptions = step.options.map((o) => `'${escapePwshSingleQuoted(o)}'`);
  lines.push(`  $options = @(${escapedOptions.join(", ")})`);

  step.options.forEach((opt, i) => {
    const escapedOpt = escapePwshSingleQuoted(opt);
    lines.push(`  Write-Host "${i + 1}. ${escapedOpt}"`);
  });

  lines.push(`  Write-Host "${escapePwshSingleQuoted(step.prompt)}"`);

  if (step.allowCustomValue) {
    lines.push('  $selection = Read-Host "Enter number or custom value"');
    lines.push("  $index = [int]::TryParse($selection, [ref]$$null) ? [int]$selection - 1 : -1");
    lines.push("  if ($index -ge 0 -and $index -lt $options.Length) {");
    lines.push(`    ${varName} = $options[$index]`);
    lines.push("  } else {");
    lines.push(`    ${varName} = $selection`);
    lines.push("  }");
  } else {
    lines.push('  $selection = Read-Host "Enter number"');
    lines.push("  $index = [int]::TryParse($selection, [ref]$$null) ? [int]$selection - 1 : -1");
    lines.push("  if ($index -ge 0 -and $index -lt $options.Length) {");
    lines.push(`    ${varName} = $options[$index]`);
    lines.push("  }");
  }

  if (step.defaultValue) {
    const escapedDefault = escapePwshSingleQuoted(step.defaultValue);
    lines.push(`  if ([string]::IsNullOrEmpty(${varName})) { ${varName} = '${escapedDefault}' }`);
  }

  lines.push(`  Save-State "${varName}" $$varName`);
  lines.push("}");

  return lines.join("\n");
}
