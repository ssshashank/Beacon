pub struct ExecRoutesName;

impl ExecRoutesName {
    pub const INSPECT_AN_EXEC_BY_ID: &'static str = r"/inspectExec/{id}";
    pub const CREATE_AN_EXEC: &'static str = r"/create/containers/{id}";
    pub const START_AN_EXEC: &'static str = r"/start/{id}";
    pub const RESIZE_AN_EXEC: &'static str = r"/{id}/resize";
}
