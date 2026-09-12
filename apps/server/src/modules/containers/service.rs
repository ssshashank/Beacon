use crate::global::{docker::DockerEndpoints, utils};
use serde_json::Value;
use std::error::Error;

pub struct ContainerService {
    client: reqwest::Client,
}

impl ContainerService {
    pub fn new(client: reqwest::Client) -> Self {
        Self { client }
    }

    pub async fn get_all_containers(&self) -> Result<Value, Box<dyn Error>> {
        utils::call_end_points(&self.client, DockerEndpoints::LIST_CONTAINERS, None).await
    }

    pub async fn inspect_container(&self, id: &str) -> Result<Value, Box<dyn Error>> {
        utils::call_end_points(&self.client, DockerEndpoints::INSPECT_A_CONTAINER, Some(id)).await
    }

    pub async fn list_containers_process(&self, id: &str) -> Result<Value, Box<dyn Error>> {
        utils::call_end_points(
            &self.client,
            DockerEndpoints::LIST_PROCESS_RUNNING_IN_A_CONTAINER,
            Some(id),
        )
        .await
    }

    pub async fn get_container_logs(&self, id: &str) -> Result<Value, Box<dyn Error>> {
        utils::call_end_points(&self.client, DockerEndpoints::GET_CONTAINER_LOGS, Some(id)).await
    }

    pub async fn get_changes_on_container_file_system(
        &self,
        id: &str,
    ) -> Result<Value, Box<dyn Error>> {
        utils::call_end_points(
            &self.client,
            DockerEndpoints::GET_CHANGES_ON_CONTAINER_FILE_SYSYTEM,
            Some(id),
        )
        .await
    }

    pub async fn export_a_container(&self, id: &str) -> Result<Value, Box<dyn Error>> {
        utils::call_end_points(&self.client, DockerEndpoints::EXPORT_A_CONTAINER, Some(id)).await
    }

    pub async fn get_containers_resource_usage(&self, id: &str) -> Result<Value, Box<dyn Error>> {
        utils::call_end_points(
            &self.client,
            DockerEndpoints::GET_CONTAINERS_RESOURSE_USAGE_STATS,
            Some(id),
        )
        .await
    }
}
