use tauri_plugin_dialog;
mod persistence;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            persistence::persistence::read_file,
            persistence::persistence::write_file,
            persistence::persistence::delete_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
