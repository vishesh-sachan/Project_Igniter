// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod models;
mod analyzers;
mod services;
mod commands;

use tauri_plugin_dialog;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::analyze::analyze,
            commands::workflow_commands::save_workflow_command,
            commands::workflow_commands::load_workflow_command,
            commands::workflow_commands::workflow_exists_command,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
