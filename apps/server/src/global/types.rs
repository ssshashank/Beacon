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
