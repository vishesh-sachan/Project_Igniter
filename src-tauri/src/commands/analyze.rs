use crate::models::analysis_result::AnalysisResult;
use crate::services::analysis_service::analysis_service;

#[tauri::command]
pub fn analyze(
    project_path: String,
) -> Result<AnalysisResult, String> {
    analysis_service(project_path)
}