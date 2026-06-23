import { InformationStep } from "../../features/workflow/types/workflow";
import { escapeBashValue, escapePwshSingleQuoted } from "../utils";

export function toBash(step: InformationStep): string {
  const lines: string[] = [];

  if (step.title) {
    lines.push(`echo ""`);
    lines.push(`echo "========================================"`);
    lines.push(`echo "  ${escapeBashValue(step.title)}"`);
    lines.push(`echo "========================================"`);
    lines.push(`echo ""`);
  }

  if (step.content) {
    lines.push(`echo "${escapeBashValue(step.content)}"`);
  }

  return lines.join("\n");
}

export function toPowerShell(step: InformationStep): string {
  const lines: string[] = [];

  if (step.title) {
    lines.push('Write-Host ""');
    lines.push('Write-Host ("=" * 40)');
    lines.push(`Write-Host "  ${escapePwshSingleQuoted(step.title)}"`);
    lines.push('Write-Host ("=" * 40)');
    lines.push('Write-Host ""');
  }

  if (step.content) {
    lines.push(`Write-Host "${escapePwshSingleQuoted(step.content)}"`);
  }

  return lines.join("\n");
}
