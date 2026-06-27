import { Workflow, Step } from "../features/workflow/types/workflow";
import { toBash as infoStep } from "./steps/information";
import { toBash as inputStep } from "./steps/input";
import { toBash as checkStep } from "./steps/check";
import { toBash as conditionStep } from "./steps/condition";
import { toBash as commandStep } from "./steps/command";
import { toBash as choiceStep } from "./steps/choice";
import { toBash as fileStep } from "./steps/file";
import { toBash as osBranchStep } from "./steps/osBranch";

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
      entries.push({ id: step.id, body: `${body}\nNEXT="${nextId || ""}"` });
      break;
    }

    case "input": {
      const body = inputStep(step);
      entries.push({ id: step.id, body: `${body}\nNEXT="${nextId || ""}"` });
      break;
    }

    case "choice": {
      const body = choiceStep(step);
      entries.push({ id: step.id, body: `${body}\nNEXT="${nextId || ""}"` });
      break;
    }

    case "flow": {
      if (step.flowType.type === "jump") {
        entries.push({ id: step.id, body: `NEXT="${step.flowType.targetStepId}"` });
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
        `if ${checkBody}; then`,
        `  NEXT="${onSuccId || nextId || ""}"`,
        "else",
        `  NEXT="${onFailId || nextId || ""}"`,
        "fi",
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
        `if ${condBody}; then`,
        `  NEXT="${onTrueId || nextId || ""}"`,
        "else",
        `  NEXT="${onFalseId || nextId || ""}"`,
        "fi",
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
        `if [ $? -eq 0 ]; then`,
        `  NEXT="${onSuccId || nextId || ""}"`,
        "else",
        `  NEXT="${onFailId || nextId || ""}"`,
        "fi",
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
        `if [ $? -eq 0 ]; then`,
        `  NEXT="${onSuccId || nextId || ""}"`,
        "else",
        `  NEXT="${onFailId || nextId || ""}"`,
        "fi",
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
      return `    ${entry.id})\n      ${body}\n      ;;`;
    })
    .join("\n");
}

export function convertToBash(workflow: Workflow): string {
  const firstId = getFirstStepId(workflow);
  const entries = generateWorkflow(workflow, null);
  const dispatch = buildDispatch(entries);

  return [
    "#! /usr/bin/env bash",
    "# Generated by Project Igniter",
    "",
    'set -o pipefail',
    "",
    'STATE_BASE="${HOME}/.local/share/project-igniter"',
    'SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"',
    'PROJECT_KEY="$(basename "$(dirname "$SCRIPT_DIR")")"',
    'ENV_NAME="$(basename "$SCRIPT_DIR")"',
    'SAFE_PROJECT="$(echo "$PROJECT_KEY" | sed "s/[^a-zA-Z0-9]/_/g")"',
    'SAFE_ENV="$(echo "$ENV_NAME" | sed "s/[^a-zA-Z0-9]/_/g")"',
    'PROJECT_STATE="${STATE_BASE}/${SAFE_PROJECT}/${SAFE_ENV}"',
    "",
    'mkdir -p "${PROJECT_STATE}" 2>/dev/null',
    "",
    'load_state() { local v="$1"; local f="${PROJECT_STATE}/${v}"; [ -f "$f" ] && eval "${v}=\"$(cat "$f")\""; }',
    'save_state() { local v="$1"; shift; echo "$*" > "${PROJECT_STATE}/${v}"; }',
    "",
    `NEXT="${firstId || ""}"`,
    "",
    'while [ -n "$NEXT" ]; do',
    '  case "$NEXT" in',
    dispatch,
    '  esac',
    'done',
    "",
  ].join("\n");
}
