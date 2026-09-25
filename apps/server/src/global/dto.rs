use crate::global::types;
use std::collections::HashMap;

pub struct HostServices {
    pub id: String,
    pub name: String,
}

pub struct SwarmCluster {
    pub id: String,
    pub name: String,
    pub started_at: tokio::time::Duration,
    pub updated_at: tokio::time::Duration,
}

pub struct ManagerStatus {
    pub leader: bool,
    pub reachability: types::ManagerReachability,
}
pub struct Nodes {
    pub id: String,
    pub hostname: String,
    pub role: types::NodeRole,
    pub ip_addr: String,
    pub status: types::NodeStatus,
    pub availability: types::NodeAvailability,
    pub manager_status: ManagerStatus,
    pub labels: HashMap<String, String>,
}

pub struct Host {
    pub id: String,
    pub name: String,
    pub r#type: types::HostType,
    pub host_service_id: String,
    pub client_service_id: String, // docker client, k8s client, agent client
    pub endpoint: String,
    pub docker_version: String,
    pub available: bool,
    pub environment: types::Environment,
    pub swarm_id: String,
}

pub struct Container {
    pub id: String,
    pub host_id: String,
    pub group_id: String,
    pub image_id: String,
    pub image: String,
    pub name: String,
    pub up_status: String,
    pub status: types::ContainerStatus,
    pub volume: Option<String>,
    pub label: HashMap<String, String>,
    pub isolation: types::ContainerIsolation,
    pub health: types::ContainerHealth,
    pub created_at: tokio::time::Duration,
    pub updated_at: tokio::time::Duration,
    pub deleted_at: Option<tokio::time::Duration>,
}
