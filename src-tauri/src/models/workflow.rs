use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Default)]
pub struct WorkflowContext {
    pub variables: HashMap<String, String>,
}

impl WorkflowContext {
    pub fn get(&self, key: &str) -> Option<&String> {
        self.variables.get(key)
    }
    
    pub fn set(&mut self, key: String, value: String) {
        self.variables.insert(key, value);
    }
}

//
// Flow
//

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FlowType {
    Continue,
    Jump {
        target_step_id: String,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FlowStep {
    pub flow_type: FlowType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Workflow {
    pub steps: Vec<Step>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Step {
    Input(InputStep),
    Information(InformationStep),
    Check(CheckStep),
    Condition(ConditionStep),
    Command(CommandStep),
    Choice(ChoiceStep),
    File(FileStep),
    Flow(FlowStep)
}

//
// INPUT
//

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InputStep {
    pub id: String,
    pub name: String,
    pub variable_name: String,
    pub prompt: String,

    pub description: Option<String>,
    pub default_value: Option<String>,
    pub required: bool,
    pub secret: bool,
    pub validation_regex: Option<String>,
}

//
// INFORMATION
//

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InformationStep {
    pub id: String,
    pub name: String,
    pub title: String,
    pub content: String,
}

//
// CHECK
//

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CheckStep {
    pub id: String,
    pub name: String,
    pub check_type: CheckType,

    pub on_success: Option<Workflow>,
    pub on_failure: Option<Workflow>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum CheckType {
    Command(CommandCheck),
    FileExists(FileExistsCheck),
    DirectoryExists(DirectoryExistsCheck),
    EnvironmentVariable(EnvironmentVariableCheck),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommandCheck {
    pub id: String,
    pub command: String,
    pub expected_exit_code: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileExistsCheck {
    pub id: String,
    pub path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DirectoryExistsCheck {
    pub id: String,
    pub path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvironmentVariableCheck {
    pub id: String,
    pub variable_name: String,
}

//
// CONDITION
//

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConditionStep {
    pub id: String,
    pub name: String,

    pub variable_name: String,
    pub operator: ConditionOperator,
    pub value: String,

    pub on_true: Option<Workflow>,
    pub on_false: Option<Workflow>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConditionOperator {
    Equals,
    NotEquals,
    GreaterThan,
    GreaterThanOrEqual,
    LessThan,
    LessThanOrEqual,
    Contains,
}

//
// COMMAND
//

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommandStep {
    pub id: String,
    pub name: String,
    pub command: String,

    pub working_directory: Option<String>,

    pub capture_stdout_to: Option<String>,
    pub capture_stderr_to: Option<String>,
    pub capture_exit_code_to: Option<String>,

    pub on_success: Option<Workflow>,
    pub on_failure: Option<Workflow>,
}

//
// CHOICE
//

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChoiceStep {
    pub id: String,
    pub name: String,

    pub variable_name: String,
    pub prompt: String,

    pub options: Vec<String>,

    pub default_value: Option<String>,
    pub allow_custom_value: bool,
}

//
// FILE
//

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileStep {
    pub id: String,
    pub name: String,

    pub operation: FileOperation,
    pub file_path: String,

    pub on_success: Option<Workflow>,
    pub on_failure: Option<Workflow>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum FileOperation {
    CreateOrOverwrite {
        content: String,
    },

    Append {
        content: String,
    },

    ReplaceText {
        search: String,
        replace: String,
    },
}
