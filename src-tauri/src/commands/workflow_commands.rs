use crate::models::workflow::Workflow;
use crate::services::workflow_service::{
    save_workflow,
    load_workflow,
    workflow_exists,
};

#[tauri::command]
pub fn save_workflow_command(
    project_path: String,
    workflow: Workflow,
) -> Result<(), String> {

    save_workflow(
        &project_path,
        &workflow,
    )
}

#[tauri::command]
pub fn load_workflow_command(
    project_path: String,
    workflow_id: String,
) -> Result<Workflow, String> {

    load_workflow(
    &project_path,
    &workflow_id,
)
}

#[tauri::command]
pub fn workflow_exists_command(
    project_path: String,
) -> bool {

    workflow_exists(&project_path)
}

