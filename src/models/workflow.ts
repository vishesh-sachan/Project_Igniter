export type WorkflowBranch =
  | "onSuccess"
  | "onFailure"
  | "onTrue"
  | "onFalse";

export type WorkflowPath = Array<
  string | WorkflowBranch
>;


//
// FLOW
//

export type FlowType =
  | {
      type: "continue";
    }
  | {
      type: "jump";
      targetStepId: string;
    };

export interface FlowStep extends BaseStep {
  type: "flow";

  flowType: FlowType;
}

//
// WORKFLOW
//

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  environment?: string;
  createdAt: string;
  updatedAt: string;

  steps: Step[];
}

//
// BASE STEP
//

export interface BaseStep {
  id: string;
  name: string;
}

//
// INPUT
//

export interface InputStep extends BaseStep {
  type: "input";

  variableName: string;
  prompt: string;

  description?: string;
  defaultValue?: string;
  placeholder?: string;

  required: boolean;
  secret: boolean;

  validationRegex?: string;
}

//
// INFORMATION
//

export interface InformationStep extends BaseStep {
  type: "information";

  title: string;
  content: string;
}

//
// CHECK
//

export interface CheckStep extends BaseStep {
  type: "check";

  checkType: CheckType;

  onSuccess: Workflow;
  onFailure: Workflow;
}

export type CheckType =
  | CommandCheck
  | FileExistsCheck
  | DirectoryExistsCheck
  | EnvironmentVariableCheck;

export interface CommandCheck {
  type: "command";

  command: string;
  expectedExitCode: number;
}

export interface FileExistsCheck {
  type: "fileExists";

  path: string;
}

export interface DirectoryExistsCheck {
  type: "directoryExists";

  path: string;
}

export interface EnvironmentVariableCheck {
  type: "environmentVariable";

  variableName: string;
}

//
// CONDITION
//

export interface ConditionStep extends BaseStep {
  type: "condition";

  variableName: string;
  operator: ConditionOperator;
  value: string;

  onTrue: Workflow;
  onFalse: Workflow;
}

export type ConditionOperator =
  | "equals"
  | "notEquals"
  | "greaterThan"
  | "greaterThanOrEqual"
  | "lessThan"
  | "lessThanOrEqual"
  | "contains";

//
// COMMAND
//

export interface CommandStep extends BaseStep {
  type: "command";

  command: string;

  workingDirectory?: string;

  captureStdoutTo?: string;
  captureStderrTo?: string;
  captureExitCodeTo?: string;

  onSuccess: Workflow;
  onFailure: Workflow;
}

//
// CHOICE
//

export interface ChoiceStep extends BaseStep {
  type: "choice";

  variableName: string;
  prompt: string;

  options: string[];

  defaultValue?: string;

  allowCustomValue: boolean;
}

//
// FILE
//

export interface FileStep extends BaseStep {
  type: "file";

  filePath: string;

  operation: FileOperation;

  onSuccess: Workflow;
  onFailure: Workflow;
}

export type FileOperation =
  | CreateOrOverwriteOperation
  | AppendOperation
  | ReplaceTextOperation;

export interface CreateOrOverwriteOperation {
  type: "createOrOverwrite";

  content: string;
}

export interface AppendOperation {
  type: "append";

  content: string;
}

export interface ReplaceTextOperation {
  type: "replaceText";

  search: string;
  replace: string;
}

//
// STEP UNION
//

export type Step =
  | InputStep
  | InformationStep
  | CheckStep
  | ConditionStep
  | CommandStep
  | ChoiceStep
  | FileStep
  | FlowStep;