use std::fs;
use std::path::Path;

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
pub fn delete_file(
    path: String,
) -> Result<(), String> {

    fs::remove_file(path)
        .map_err(|e| e.to_string())
}