use std::fs;
use std::path::PathBuf;

use crate::models::workflow::Workflow;

fn project_installer_dir(
    project_root: &str,
) -> PathBuf {
    PathBuf::from(project_root)
        .join(".project-installer")
}

fn workflow_path(
    project_root: &str,
) -> PathBuf {
    project_installer_dir(project_root)
        .join("workflow.json")
}

pub fn save_workflow(
    project_root: &str,
    workflow: &Workflow,
) -> Result<(), String> {

    let installer_dir =
        project_installer_dir(project_root);

    fs::create_dir_all(&installer_dir)
        .map_err(|e| e.to_string())?;

    let json =
        serde_json::to_string_pretty(workflow)
            .map_err(|e| e.to_string())?;

    fs::write(
        workflow_path(project_root),
        json,
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

pub fn load_workflow(
    project_root: &str,
) -> Result<Workflow, String> {

    let contents =
        fs::read_to_string(
            workflow_path(project_root)
        )
        .map_err(|e| e.to_string())?;

    let workflow: Workflow =
        serde_json::from_str(&contents)
            .map_err(|e| e.to_string())?;

    Ok(workflow)
}

pub fn workflow_exists(
    project_root: &str,
) -> bool {

    workflow_path(project_root)
        .exists()
}

