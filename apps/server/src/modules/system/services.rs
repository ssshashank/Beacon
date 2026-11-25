use crate::{
    config::app::AppConfig,
    global::{
        config::{DOCKER_API_VERSION, HOST},
        docker::DockerEndpoints,
    },
};
use serde_json::Value;
use std::error::Error;

pub struct SystemService {
    app_config: AppConfig,
}

impl SystemService {
    pub fn new(app_config: AppConfig) -> Self {
        Self { app_config }
    }

    pub async fn get_system_df(&self) -> Result<Value, Box<dyn Error>> {
        let url = format!(
            "http://{}/{}{}",
            *HOST,
            *DOCKER_API_VERSION,
            DockerEndpoints::GET_SYSTEM_DF
        );
        let res = self.app_config.client.get(url).send().await?;
        let json: Value = res.json().await?;
        Ok(json)
    }

    pub async fn get_system_info(&self) -> Result<Value, Box<dyn Error>> {
        let url = format!(
            "http://{}/{}{}",
            *HOST,
            *DOCKER_API_VERSION,
            DockerEndpoints::GET_SYSTEM_INFO
        );
        let res = self.app_config.client.get(url).send().await?;
        let json: Value = res.json().await?;
        Ok(json)
    }

    pub async fn get_system_version(&self) -> Result<Value, Box<dyn Error>> {
        let url = format!(
            "http://{}/{}{}",
            *HOST,
            *DOCKER_API_VERSION,
            DockerEndpoints::GET_SYSTEM_VERSION
        );
        let res = self.app_config.client.get(url).send().await?;
        let json: Value = res.json().await?;
        Ok(json)
    }

    pub async fn ping(&self) -> Result<String, Box<dyn Error>> {
        let url = format!(
            "http://{}/{}{}",
            *HOST,
            *DOCKER_API_VERSION,
            DockerEndpoints::PING_SYSTEM
        );
        let res = self.app_config.client.get(url).send().await?;
        let text = res.text().await?;
        Ok(text)
    }
}
