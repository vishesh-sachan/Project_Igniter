#[derive(Debug, Clone)]
pub enum ScriptType {
    Install,
    Build,
    Dev,
    Start,
    Test,
    Migration,
    Seed,
    Custom,
}

#[derive(Debug, Clone)]
pub struct ProjectScript {
    pub name: String,
    pub command: String,
    // pub script_type: ScriptType,
}