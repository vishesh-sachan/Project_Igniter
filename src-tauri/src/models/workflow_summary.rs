use serde::{
    Serialize,
    Deserialize,
};

#[derive(
    Debug,
    Clone,
    Serialize,
    Deserialize,
)]
pub struct WorkflowSummary {
    pub id: String,
    pub name: String,
    pub description: Option<String>,

    pub created_at: String,
    pub updated_at: String,
}