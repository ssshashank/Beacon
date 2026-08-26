use crate::global::{config, docker::DockerEndpoints};
use serde_json::Value;

pub struct ContainerService {
    client: reqwest::Client,
}

impl ContainerService {
    pub fn new(client: reqwest::Client) -> Self {
        Self { client }
    }

    pub async fn get_all_containers(&self) -> Result<Value, Box<dyn std::error::Error>> {
        let url = format!(
            "http://localhost/{}{}",
            config::APP_VERSION,
            DockerEndpoints::GET_ALL_CONTAINERS
        );
        let response = self.client.get(url).send().await?;
        let json: Value = response.json().await?;
        Ok(json)
    }
}
