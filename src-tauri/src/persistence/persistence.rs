use std::fs;
use std::path::Path;
#[cfg(unix)]
use std::os::unix::fs::PermissionsExt;

#[tauri::command]
pub fn read_file(
    path: String,
) -> Result<String, String> {
    fs::read_to_string(path)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn write_file(
    path: String,
    contents: String,
) -> Result<(), String> {

    if let Some(parent) =
        Path::new(&path).parent()
    {
        fs::create_dir_all(parent)
            .map_err(|e| e.to_string())?;
    }

    fs::write(path, contents)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn make_executable(
    path: String,
) -> Result<(), String> {
    #[cfg(unix)]
    {
        let metadata = fs::metadata(&path).map_err(|e| e.to_string())?;
        let mut perms = metadata.permissions();
        let mode = perms.mode();
        perms.set_mode(mode | 0o111);
        fs::set_permissions(&path, perms).map_err(|e| e.to_string())?;
    }
    #[cfg(not(unix))]
    {
        let _ = path;
    }
    Ok(())
}

#[tauri::command]
pub fn delete_file(
    path: String,
) -> Result<(), String> {

    fs::remove_file(path)
        .map_err(|e| e.to_string())
}
