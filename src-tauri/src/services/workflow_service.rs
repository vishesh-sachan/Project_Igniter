use std::fs;
use std::path::PathBuf;
use crate::models::workflow_summary::WorkflowSummary;
use crate::models::workflow::Workflow;

fn project_installer_dir(
    project_root: &str,
) -> PathBuf {
    PathBuf::from(project_root)
        .join(".project-installer")
}

fn workflows_dir(
    project_root: &str,
) -> PathBuf {
    project_installer_dir(project_root)
        .join("workflows")
}

fn workflow_path(
    project_root: &str,
    workflow_id: &str,
) -> PathBuf {
    workflows_dir(project_root)
        .join(format!(
            "{}.json",
            workflow_id
        ))
}

pub fn save_workflow(
    project_root: &str,
    workflow: &Workflow,
) -> Result<(), String> {

    let workflows_dir =
        workflows_dir(project_root);

    fs::create_dir_all(&workflows_dir)
        .map_err(|e| e.to_string())?;

    let json =
        serde_json::to_string_pretty(workflow)
            .map_err(|e| e.to_string())?;

    fs::write(
        workflow_path(
            project_root,
            &workflow.id,
        ),
        json,
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

pub fn load_workflow(
    project_root: &str,
    workflow_id: &str,
) -> Result<Workflow, String> {

    let contents =
        fs::read_to_string(
            workflow_path(
                project_root,
                workflow_id,
            ),
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

    let workflows_dir =
        workflows_dir(project_root);

    if !workflows_dir.exists() {
        return false;
    }

    match fs::read_dir(workflows_dir) {
        Ok(entries) => {
            entries.count() > 0
        }
        Err(_) => false,
    }
}

pub fn list_workflows(
    project_root: &str,
) -> Result<
    Vec<WorkflowSummary>,
    String,
> {
    let workflows_dir =
        workflows_dir(project_root);

    if !workflows_dir.exists() {
        return Ok(vec![]);
    }

    let mut workflows =
        Vec::new();

    for entry in fs::read_dir(
        workflows_dir,
    )
    .map_err(|e| e.to_string())?
    {
        let entry =
            entry.map_err(|e| e.to_string())?;

        let path = entry.path();

        if !path.is_file() {
            continue;
        }

        let contents =
            fs::read_to_string(&path)
                .map_err(|e| e.to_string())?;

        let workflow: Workflow =
            serde_json::from_str(
                &contents,
            )
            .map_err(|e| e.to_string())?;

        workflows.push(
            WorkflowSummary {
                id: workflow.id,
                name: workflow.name,
                created_at:
                    workflow.created_at,
                updated_at:
                    workflow.updated_at,
            },
        );
    }

    workflows.sort_by(|a, b| {
        b.updated_at
            .cmp(&a.updated_at)
    });

    Ok(workflows)
}