import { CheckStep } from "../../features/workflow/types/workflow";

export function toBash(step: CheckStep): string {
  const { checkType } = step;

  switch (checkType.type) {
    case "command":
      return `${checkType.command}\n[ $? -eq ${checkType.expectedExitCode} ]`;

    case "fileExists":
      return `[ -f "${checkType.path}" ]`;

    case "directoryExists":
      return `[ -d "${checkType.path}" ]`;

    case "environmentVariable":
      return `[ -n "\${${checkType.variableName}+x}" ]`;
  }
}

export function toPowerShell(step: CheckStep): string {
  const { checkType } = step;

  switch (checkType.type) {
    case "command":
      return `${checkType.command}\n($LASTEXITCODE -eq ${checkType.expectedExitCode})`;

    case "fileExists":
      return `Test-Path "${checkType.path}"`;

    case "directoryExists":
      return `Test-Path "${checkType.path}" -PathType Container`;

    case "environmentVariable":
      return `$null -ne (Get-Item "Env:${checkType.variableName}" -ErrorAction SilentlyContinue)`;
  }
}
