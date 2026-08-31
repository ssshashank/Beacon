pub struct ImageRoutesName;

impl ImageRoutesName {
    pub const GET_ALL_CONTAINERS: &'static str = r"/getAllContainers";
    pub const INSPECT_CONTAINER_BY_ID: &'static str = r"/inspectContainer/{id}";
    pub const GET_ALL_PROCESS_RUNNING_IN_CONTAINER: &'static str =
        r"/allProcessRunningInContainer/{id}";
    pub const GET_CONTAINER_LOGS: &'static str = r"/getContainerLogs/{id}";
    pub const GET_CHANGES_ON_CONTAINER_FILE_SYSTEM_BY_ID: &'static str =
        r"/getChangesOnContainerFileSystemById/{id}";
    pub const EXPORT_CONTAINER_BY_ID: &'static str = r"/exportContainerById/{id}";
    pub const GET_CONTAINER_RESOURCE_USAGE_STATS_BY_ID: &'static str =
        r"/getContainerResourceUsageStatsById/{id}";
}
