export type WorkflowBranch =
  | "onSuccess"
  | "onFailure"
  | "onTrue"
  | "onFalse"
  | "macos"
  | "linux"
  | "windows";

export type WorkflowPath = Array<
  string | WorkflowBranch
>;

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

export interface OSBranchStep extends BaseStep {
  type: "osBranch";
  macos: Workflow;
  linux: Workflow;
  windows: Workflow;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  environment?: string;
  createdAt: string;
  updatedAt: string;
  steps: Step[];
}

export interface BaseStep {
  id: string;
  name: string;
}

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

export interface InformationStep extends BaseStep {
  type: "information";
  title: string;
  content: string;
}

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

export interface ChoiceStep extends BaseStep {
  type: "choice";
  variableName: string;
  prompt: string;
  options: string[];
  defaultValue?: string;
  allowCustomValue: boolean;
}

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

export type Step =
  | InputStep
  | InformationStep
  | CheckStep
  | ConditionStep
  | CommandStep
  | ChoiceStep
  | FileStep
  | FlowStep
  | OSBranchStep;

export interface WorkflowSummary {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnvEntry {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectIndex {
  path: string;
  defaultEnv: string;
  environments: Record<string, EnvEntry>;
}

export interface WorkflowIndex {
  schema: number;
  defaultProject: string;
  standalone: WorkflowSummary[];
  projects: Record<string, ProjectIndex>;
}
