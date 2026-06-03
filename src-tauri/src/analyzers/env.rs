use crate::models::env::EnvVariable;
use ::std::fs;
use std::path::Path;

fn find_env_file(project_path: &Path) -> Result<String, String> {
    let candidates = [".env.example", ".env.sample", ".env.template", ".env"];

    for candidate in candidates {
        let path = project_path.join(candidate);

        if path.exists() {
            return Ok(path.to_string_lossy().to_string());
        }
    }

    Err("No env file found".to_string())
}

fn extract_env_variables(content: String) -> Vec<EnvVariable> {
    let mut env_variables: Vec<EnvVariable> = Vec::new();

    for line in content.lines() {
        let trimmed = line.trim();

        if trimmed.is_empty() {
            continue;
        }

        if trimmed.starts_with("#") {
            continue;
        }

        let mut parts = trimmed.splitn(2, '=');

        let key = match parts.next() {
            Some(key) => key,
            None => continue,
        };

        let value = match parts.next() {
            Some(value) => {
                let value = value.trim();

                if value.is_empty() {
                    None
                } else {
                    Some(value.to_string())
                }
            }
            None => None,
        };

        let var = EnvVariable {
            name: key.to_string(),
            default_value: value,
            required: true,
        };

        env_variables.push(var)
    }

    env_variables
}

pub fn analyze_env(project_path: &Path) -> Result<Vec<EnvVariable>, String> {
    let env_file = find_env_file(project_path)?;

    let content =
        fs::read_to_string(&env_file).map_err(|e| format!("Failed to read env file: {}", e))?;

    Ok(extract_env_variables(content))
}
