use std::path::Path;

use crate::analyzers::env::analyze_env;
use crate::analyzers::package_manager::analyze_package_manager;
use crate::analyzers::repository::repository;
use crate::analyzers::scripts::analyze_scripts;

use crate::models::analysis_result::AnalysisResult;
use crate::models::project::ProjectProfile;

pub fn analysis_service(
    root_path: String,
) -> Result<AnalysisResult, String> {

    let root = Path::new(&root_path);

    let repository_info = repository(root)?;

    let mut projects = Vec::new();

    for project_path in &repository_info.project_paths {

        let full_path = root.join(project_path);

        let profile = ProjectProfile {
            name: full_path
                .file_name()
                .unwrap_or_default()
                .to_string_lossy()
                .to_string(),

            path: project_path.clone(),

            env_variables: analyze_env(&full_path)
                .unwrap_or_default(),

            package_manager: analyze_package_manager(&full_path),

            scripts: analyze_scripts(&full_path)
                .unwrap_or_default(),
        };

        projects.push(profile);
    }

    Ok(AnalysisResult {
        repository: repository_info,
        projects,
    })
}