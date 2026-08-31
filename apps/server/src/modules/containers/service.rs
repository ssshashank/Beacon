use crate::global::{
    config::{self, HOST},
    docker::DockerEndpoints,
};
use serde_json::Value;
use std::error::Error;

pub struct ContainerService {
    client: reqwest::Client,
}

impl ContainerService {
    pub fn new(client: reqwest::Client) -> Self {
        Self { client }
    }

    async fn _call_end_points(&self, url: &str, id: Option<&str>) -> Result<Value, Box<dyn Error>> {
        let path = match id {
            Some(id) => url.replace("{id}", id),
            None => url.to_string(),
        };
        let _url = format!("http://{}/{}{}", *HOST, config::APP_VERSION, path);
        let response = self.client.get(_url).send().await?;
        let json: Value = response.json().await?;
        Ok(json)
    }

    pub async fn get_all_containers(&self) -> Result<Value, Box<dyn Error>> {
        let res = self
            ._call_end_points(DockerEndpoints::LIST_CONTAINERS, None)
            .await?;
        Ok(res)
    }

    pub async fn inspect_container(&self, id: &str) -> Result<Value, Box<dyn Error>> {
        let res = self
            ._call_end_points(DockerEndpoints::INSPECT_A_CONTAINER, Some(id))
            .await?;
        Ok(res)
    }

    pub async fn list_containers_process(&self, id: &str) -> Result<Value, Box<dyn Error>> {
        let res = self
            ._call_end_points(
                DockerEndpoints::LIST_PROCESS_RUNNING_IN_A_CONTAINER,
                Some(id),
            )
            .await?;
        Ok(res)
    }

    pub async fn get_container_logs(&self, id: &str) -> Result<Value, Box<dyn Error>> {
        let res = self
            ._call_end_points(DockerEndpoints::GET_CONTAINER_LOGS, Some(id))
            .await?;
        Ok(res)
    }

    pub async fn get_changes_on_container_file_system(
        &self,
        id: &str,
    ) -> Result<Value, Box<dyn Error>> {
        let res = self
            ._call_end_points(
                DockerEndpoints::GET_CHANGES_ON_CONTAINER_FILE_SYSYTEM,
                Some(id),
            )
            .await?;
        Ok(res)
    }

    pub async fn export_a_container(&self, id: &str) -> Result<Value, Box<dyn Error>> {
        let res = self
            ._call_end_points(DockerEndpoints::EXPORT_A_CONTAINER, Some(id))
            .await?;
        Ok(res)
    }

    pub async fn get_containers_resource_usage(&self, id: &str) -> Result<Value, Box<dyn Error>> {
        let res = self
            ._call_end_points(
                DockerEndpoints::GET_CONTAINERS_RESOURSE_USAGE_STATS,
                Some(id),
            )
            .await?;
        Ok(res)
    }
}
