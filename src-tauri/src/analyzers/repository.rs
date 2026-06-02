use std::fs;
use std::path::Path;

use crate::models::repository::{RepositoryInfo, RepositoryType};

fn is_project(path: &Path) -> bool {
    path.join("package.json").exists()
        || path.join("Cargo.toml").exists()
        || path.join("go.mod").exists()
        || path.join("requirements.txt").exists()
}

fn is_monorepo(path: &Path) -> bool {
    path.join("pnpm-workspace.yaml").exists()
        || path.join("turbo.json").exists()
        || path.join("nx.json").exists()
        || path.join("lerna.json").exists()
}

fn discover_project_paths(root: &Path) -> Vec<String> {
    let mut project_paths = Vec::new();

    // root project
    if is_project(root) {
        project_paths.push(".".to_string());
    }

    if let Ok(entries) = fs::read_dir(root) {
        for entry in entries.flatten() {
            let child = entry.path();

            if child.is_dir() && is_project(&child) {
                let relative_path = child
                    .strip_prefix(root)
                    .unwrap()
                    .to_string_lossy()
                    .to_string();

                project_paths.push(relative_path);
            }
        }
    }

    project_paths
}

pub fn repository(path: String) -> Result<RepositoryInfo, String> {
    let path = Path::new(&path);

    if !path.exists() {
        return Err("Directory does not exist".to_string());
    }

    let entries = fs::read_dir(path).map_err(|_| "Failed to read directory")?;

    if entries.count() == 0 {
        return Err("Selected directory is empty".to_string());
    }

    let project_paths = discover_project_paths(path);

    let repo_type = if is_monorepo(path) {
        RepositoryType::Monorepo
    } else if project_paths.len() <= 1 {
        RepositoryType::SingleProject
    } else {
        RepositoryType::MultiProject
    };

    Ok(RepositoryInfo {
        repo_type,
        project_paths,
    })
}
