use serde::Serialize;

pub enum Environment {
    Development,
    Production,
    Staging,
}

pub enum HostType {
    Local,
    Remote,
    SwarmMode,
}

pub enum NodeRole {
    Manager,
    Worker,
}

pub enum NodeStatus {
    Ready,
    Down,
    Disconnected,
    Unknown,
}

pub enum NodeAvailability {
    Active,
    Pause,
    Drain,
}

pub enum ManagerReachability {
    Reachable,
    Unreachable,
    Unknown,
}

#[derive(Debug, Serialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum ContainerStatus {
    Running,
    Created,
    Restarting,
    Removing,
    Paused,
    Exited,
    Dead,
    #[serde(other)]
    Unknown,
}

pub enum ContainerIsolation {
    Default,
    Process,
    Hyperv,
}

pub enum ContainerHealth {
    Starting,
    Healthy,
    Unhealthy,
    None,
}

pub enum ImageStatus {
    Unspecified,
    Pending,
    WaitingForPush,
    Preparing,
    Completed,
    Failed,
    Deleted,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ContainerAction {
    Create,
    Start,
    Stop,
    Die,
    Destroy,
    ExecCreate,
    ExecStart,
    ExecDie,
    Other(String),
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ImageAction {
    Pull,
    Push,
    Tag,
    Untag,
    Delete,
    Other(String),
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum NetworkAction {
    Create,
    Connect,
    Disconnect,
    Destroy,
    Other(String),
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum VolumeAction {
    Create,
    Mount,
    Unmount,
    Destroy,
    Other(String),
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum DockerEventFilter {
    Container(ContainerAction),
    Image(ImageAction),
    Network(NetworkAction),
    Volume(VolumeAction),
    Unknown,
}

// Helper to convert from Raw string event
impl DockerEventFilter {
    pub fn from_raw(resource_type: &str, action: &str) -> Self {
        // Sometimes, docker append : in action
        let base_action = action.split(':').next().unwrap_or(action).trim();

        match resource_type {
            "container" => DockerEventFilter::Container(match base_action {
                "create" => ContainerAction::Create,
                "start" => ContainerAction::Start,
                "stop" => ContainerAction::Stop,
                "die" => ContainerAction::Die,
                "destroy" => ContainerAction::Destroy,
                "exec_create" => ContainerAction::ExecCreate,
                "exec_start" => ContainerAction::ExecStart,
                "exec_die" => ContainerAction::ExecDie,
                other => ContainerAction::Other(other.to_string()),
            }),
            "image" => DockerEventFilter::Image(match base_action {
                "pull" => ImageAction::Pull,
                "push" => ImageAction::Push,
                "tag" => ImageAction::Tag,
                "untag" => ImageAction::Untag,
                "delete" => ImageAction::Delete,
                other => ImageAction::Other(other.to_string()),
            }),
            "network" => DockerEventFilter::Network(match base_action {
                "create" => NetworkAction::Create,
                "connect" => NetworkAction::Connect,
                "disconnect" => NetworkAction::Disconnect,
                "destroy" => NetworkAction::Destroy,
                other => NetworkAction::Other(other.to_string()),
            }),
            "volume" => DockerEventFilter::Volume(match base_action {
                "create" => VolumeAction::Create,
                "mount" => VolumeAction::Mount,
                "unmount" => VolumeAction::Unmount,
                "destroy" => VolumeAction::Destroy,
                other => VolumeAction::Other(other.to_string()),
            }),
            _ => DockerEventFilter::Unknown,
        }
    }
}
