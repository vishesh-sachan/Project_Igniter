import { FileStep } from "../../features/workflow/types/workflow";
import { escapeBashValue, escapePwshSingleQuoted, escapeSedPattern, escapeSedReplace } from "../utils";

export function toBash(step: FileStep): string {
  const { operation } = step;

  switch (operation.type) {
    case "createOrOverwrite":
      return `cat > "${step.filePath}" << 'EOF'\n${operation.content}\nEOF`;

    case "append":
      return `cat >> "${step.filePath}" << 'EOF'\n${operation.content}\nEOF`;

    case "replaceText":
      return `sed -i 's|${escapeSedPattern(operation.search)}|${escapeSedReplace(operation.replace)}|g' "${step.filePath}"`;
  }
}

export function toPowerShell(step: FileStep): string {
  const { operation } = step;

  switch (operation.type) {
    case "createOrOverwrite":
      return `Set-Content -Path "${step.filePath}" -Value @"\n${operation.content}\n"@`;

    case "append":
      return `Add-Content -Path "${step.filePath}" -Value "${escapeBashValue(operation.content)}"`;

    case "replaceText":
      return `(Get-Content "${step.filePath}") -replace '${escapePwshSingleQuoted(operation.search)}', '${escapePwshSingleQuoted(operation.replace)}' | Set-Content "${step.filePath}"`;
  }
}
