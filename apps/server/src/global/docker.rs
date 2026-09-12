pub struct DockerEndpoints;

impl DockerEndpoints {
    // Containers Endpoints
    pub const LIST_CONTAINERS: &'static str = r"/containers/json?all=true";
    pub const INSPECT_A_CONTAINER: &'static str = r"/containers/{id}/json";
    pub const LIST_PROCESS_RUNNING_IN_A_CONTAINER: &'static str = r"/containers/{id}/top";
    pub const GET_CONTAINER_LOGS: &'static str = r"/containers/{id}/logs?stdout=true&stderr=true";
    pub const GET_CHANGES_ON_CONTAINER_FILE_SYSYTEM: &'static str = r"/containers/{id}/changes";
    pub const EXPORT_A_CONTAINER: &'static str = r"/containers/{id}/export";
    pub const GET_CONTAINERS_RESOURSE_USAGE_STATS: &'static str = r"/containers/{id}/stats";

    // Events Endpoints
    pub const STREAM_EVENTS: &'static str = r"/events";

    // Images Endpoints
    pub const LIST_IMAGES: &'static str = r"/images/json";
    pub const INSPECT_AN_IMAGE: &'static str = r"/images/{id}/json";
    pub const GET_ATTESTATION_STATEMENT_OF_AN_IMAGE: &'static str = r"/images/{id}/attestations";
    pub const GET_HISTORY_OF_AN_IMAGE: &'static str = r"/images/{id}/history";
}
