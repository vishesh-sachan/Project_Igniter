use std::collections::HashMap;
use std::fs;
use std::path::Path;

use serde::Deserialize;

use crate::models::script::ProjectScript;

#[derive(Deserialize)]
struct PackageJson {
    #[serde(default)]
    scripts: HashMap<String, String>,
}

pub fn analyze_scripts(project_path: &Path) -> Result<Vec<ProjectScript>, String> {
    let package_json_path = project_path.join("package.json");

    if !package_json_path.exists() {
        return Ok(Vec::new());
    }

    let content = fs::read_to_string(&package_json_path)
        .map_err(|e| format!("Failed to read package.json: {}", e))?;

    let package_json: PackageJson = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse package.json: {}", e))?;

    let mut scripts = Vec::new();

    for (name, command) in package_json.scripts {
        scripts.push(ProjectScript {
            name,
            command,
        });
    }

    Ok(scripts)
}