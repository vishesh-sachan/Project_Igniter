import { CommandStep } from "../../features/workflow/types/workflow";
import { interpolateVars, interpolateVarsPwsh, sanitizeVarName } from "../utils";

export function toBash(step: CommandStep): string {
  const cmd = interpolateVars(step.command);
  let execLine = cmd;

  if (step.captureStdoutTo && step.captureExitCodeTo) {
    console.warn(`CommandStep "${step.id}": captureStdoutTo and captureExitCodeTo are mutually exclusive; captureExitCodeTo will be ignored.`);
  }

  if (step.workingDirectory) {
    execLine = `(cd "${step.workingDirectory}" && ${execLine})`;
  }

  const captures: string[] = [];
  if (step.captureStdoutTo) {
    const v = sanitizeVarName(step.captureStdoutTo);
    captures.push(`${v}="$(${execLine})"`);
  } else if (step.captureExitCodeTo) {
    const v = sanitizeVarName(step.captureExitCodeTo);
    captures.push(`${execLine}\n${v}=$?`);
  } else {
    captures.push(execLine);
  }

  return captures.join("\n");
}

export function toPowerShell(step: CommandStep): string {
  const cmd = interpolateVarsPwsh(step.command);
  let execLine = cmd;

  if (step.captureStdoutTo && step.captureExitCodeTo) {
    console.warn(`CommandStep "${step.id}": captureStdoutTo and captureExitCodeTo are mutually exclusive; captureExitCodeTo will be ignored.`);
  }

  if (step.workingDirectory) {
    execLine = `Push-Location "${step.workingDirectory}"\n${execLine}\nPop-Location`;
  }

  const captures: string[] = [];
  if (step.captureStdoutTo) {
    const v = sanitizeVarName(step.captureStdoutTo);
    captures.push(`$${v} = (${execLine})`);
  } else if (step.captureExitCodeTo) {
    const v = sanitizeVarName(step.captureExitCodeTo);
    captures.push(`${execLine}\n$${v} = $LASTEXITCODE`);
  } else {
    captures.push(execLine);
  }

  return captures.join("\n");
}
