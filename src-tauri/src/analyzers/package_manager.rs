use std::path::Path;

pub fn analyze_package_manager(project_path: &Path) -> Option<String> {
    let package_managers = [
        ("pnpm-lock.yaml", "pnpm"),
        ("yarn.lock", "yarn"),
        ("bun.lockb", "bun"),
        ("bun.lock", "bun"),
        ("package-lock.json", "npm"),
    ];

    for (lock_file, manager) in package_managers {
        if project_path.join(lock_file).exists() {
            return Some(manager.to_string());
        }
    }

    None
}