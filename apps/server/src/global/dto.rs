use crate::global::types;
use reqwest::StatusCode;
use serde::Serialize;
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

pub struct Group {
    pub id: String,
    pub name: String,
    pub r#type: String,
}

#[derive(Serialize, Debug)]
pub struct ApiError {
    pub code: String,
    pub message: String,
}

#[derive(Serialize, Debug)]
pub struct ResponseBody<T> {
    pub status: u16,
    pub success: bool,
    pub body: Option<T>,
    pub error: Option<ApiError>,
}

impl<T> ResponseBody<T>
where
    T: Serialize,
{
    pub fn success(status: StatusCode, body: T) -> Self {
        ResponseBody {
            status: status.as_u16(),
            success: true,
            body: Some(body),
            error: None,
        }
    }

    pub fn error(status: StatusCode, code: impl Into<String>, message: impl Into<String>) -> Self {
        ResponseBody {
            status: status.as_u16(),
            success: false,
            body: None,
            error: Some(ApiError {
                code: code.into(),
                message: message.into(),
            }),
        }
    }
}
