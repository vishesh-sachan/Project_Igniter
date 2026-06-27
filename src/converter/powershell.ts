import { Workflow, Step } from "../features/workflow/types/workflow";
import { toPowerShell as infoStep } from "./steps/information";
import { toPowerShell as inputStep } from "./steps/input";
import { toPowerShell as checkStep } from "./steps/check";
import { toPowerShell as conditionStep } from "./steps/condition";
import { toPowerShell as commandStep } from "./steps/command";
import { toPowerShell as choiceStep } from "./steps/choice";
import { toPowerShell as fileStep } from "./steps/file";
import { toPowerShell as osBranchStep } from "./steps/osBranch";

type Entry = { id: string; body: string };

function getFirstStepId(workflow: Workflow): string | null {
  const first = workflow.steps.find((s) => s.type !== "flow" || s.flowType.type !== "continue");
  return first ? first.id : null;
}

function generateWorkflow(
  workflow: Workflow,
  followUpId: string | null
): Entry[] {
  const entries: Entry[] = [];
  const steps = workflow.steps.filter((s) => s.type !== "flow" || s.flowType.type !== "continue");

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const nextStep = i + 1 < steps.length ? steps[i + 1] : null;
    const nextId = nextStep ? nextStep.id : followUpId;

    generateStep(step, nextId, entries);
  }

  return entries;
}

function generateStep(
  step: Step,
  nextId: string | null,
  entries: Entry[]
): void {
  switch (step.type) {
    case "information": {
      const body = infoStep(step);
      entries.push({ id: step.id, body: `${body}\n$NEXT = '${nextId || ""}'` });
      break;
    }

    case "input": {
      const body = inputStep(step);
      entries.push({ id: step.id, body: `${body}\n$NEXT = '${nextId || ""}'` });
      break;
    }

    case "choice": {
      const body = choiceStep(step);
      entries.push({ id: step.id, body: `${body}\n$NEXT = '${nextId || ""}'` });
      break;
    }

    case "flow": {
      if (step.flowType.type === "jump") {
        entries.push({ id: step.id, body: `$NEXT = '${step.flowType.targetStepId}'` });
      }
      break;
    }

    case "check":
    case "condition":
    case "command":
    case "file":
    case "osBranch":
      generateBranchingStep(step, nextId, entries);
      break;
  }
}

function generateBranchingStep(
  step: Step,
  nextId: string | null,
  entries: Entry[]
): void {
  switch (step.type) {
    case "check": {
      const checkBody = checkStep(step);
      const onSuccId = getFirstStepId(step.onSuccess);
      const onFailId = getFirstStepId(step.onFailure);
      const body = [
        `if (${checkBody}) {`,
        `  $NEXT = '${onSuccId || nextId || ""}'`,
        "} else {",
        `  $NEXT = '${onFailId || nextId || ""}'`,
        "}",
      ].join("\n");
      entries.push({ id: step.id, body });
      if (onSuccId) entries.push(...generateWorkflow(step.onSuccess, nextId));
      if (onFailId) entries.push(...generateWorkflow(step.onFailure, nextId));
      break;
    }

    case "condition": {
      const condBody = conditionStep(step);
      const onTrueId = getFirstStepId(step.onTrue);
      const onFalseId = getFirstStepId(step.onFalse);
      const body = [
        `if (${condBody}) {`,
        `  $NEXT = '${onTrueId || nextId || ""}'`,
        "} else {",
        `  $NEXT = '${onFalseId || nextId || ""}'`,
        "}",
      ].join("\n");
      entries.push({ id: step.id, body });
      if (onTrueId) entries.push(...generateWorkflow(step.onTrue, nextId));
      if (onFalseId) entries.push(...generateWorkflow(step.onFalse, nextId));
      break;
    }

    case "command": {
      const cmdBody = commandStep(step);
      const onSuccId = getFirstStepId(step.onSuccess);
      const onFailId = getFirstStepId(step.onFailure);
      const body = [
        cmdBody,
        `if ($LASTEXITCODE -eq 0) {`,
        `  $NEXT = '${onSuccId || nextId || ""}'`,
        "} else {",
        `  $NEXT = '${onFailId || nextId || ""}'`,
        "}",
      ].join("\n");
      entries.push({ id: step.id, body });
      if (onSuccId) entries.push(...generateWorkflow(step.onSuccess, nextId));
      if (onFailId) entries.push(...generateWorkflow(step.onFailure, nextId));
      break;
    }

    case "file": {
      const fileBody = fileStep(step);
      const onSuccId = getFirstStepId(step.onSuccess);
      const onFailId = getFirstStepId(step.onFailure);
      const body = [
        fileBody,
        `if ($?) {`,
        `  $NEXT = '${onSuccId || nextId || ""}'`,
        "} else {",
        `  $NEXT = '${onFailId || nextId || ""}'`,
        "}",
      ].join("\n");
      entries.push({ id: step.id, body });
      if (onSuccId) entries.push(...generateWorkflow(step.onSuccess, nextId));
      if (onFailId) entries.push(...generateWorkflow(step.onFailure, nextId));
      break;
    }

    case "osBranch": {
      const firstIds = {
        macos: getFirstStepId(step.macos),
        linux: getFirstStepId(step.linux),
        windows: getFirstStepId(step.windows),
      };
      const body = osBranchStep(firstIds);
      entries.push({ id: step.id, body });
      if (firstIds.macos) entries.push(...generateWorkflow(step.macos, nextId));
      if (firstIds.linux) entries.push(...generateWorkflow(step.linux, nextId));
      if (firstIds.windows) entries.push(...generateWorkflow(step.windows, nextId));
      break;
    }
  }
}

function buildDispatch(entries: Entry[]): string {
  return entries
    .map((entry) => {
      const body = entry.body.replace(/\n/g, "\n      ");
      return `    '${entry.id}') {\n      ${body}\n    }`;
    })
    .join("\n");
}

export function convertToPowerShell(workflow: Workflow): string {
  const firstId = getFirstStepId(workflow);
  const entries = generateWorkflow(workflow, null);
  const dispatch = buildDispatch(entries);

  return [
    "# Generated by Project Igniter",
    "",
    '$ErrorActionPreference = "Stop"',
    "",
    '$STATE_BASE = "$env:HOME/.local/share/project-igniter"',
    '$SCRIPT_DIR = Split-Path $PSScriptRoot -Parent',
    '$PROJECT_KEY = Split-Path (Split-Path $SCRIPT_DIR -Parent) -Leaf',
    '$ENV_NAME = Split-Path $SCRIPT_DIR -Leaf',
    '$SAFE_PROJECT = [regex]::Replace($PROJECT_KEY, "[^a-zA-Z0-9]", "_")',
    '$SAFE_ENV = [regex]::Replace($ENV_NAME, "[^a-zA-Z0-9]", "_")',
    '$PROJECT_STATE = Join-Path $STATE_BASE "$SAFE_PROJECT/$SAFE_ENV"',
    "",
    'New-Item -ItemType Directory -Path $PROJECT_STATE -Force | Out-Null',
    "",
    'function Load-State($v) {',
    '  $f = Join-Path $PROJECT_STATE $v',
    '  if (Test-Path $f) { Set-Variable -Name $v -Value (Get-Content $f) -Scope 1 }',
    '}',
    '',
    'function Save-State($v, $val) {',
    '  $val | Out-File -FilePath (Join-Path $PROJECT_STATE $v) -Encoding UTF8',
    '}',
    "",
    `$NEXT = '${firstId || ""}'`,
    "",
    'while ($NEXT) {',
    '  switch ($NEXT) {',
    dispatch,
    '  }',
    '}',
    "",
  ].join("\n");
}
