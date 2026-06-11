use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectScript {
    pub name: String,
    pub command: String,
    // pub script_type: ScriptType,
}