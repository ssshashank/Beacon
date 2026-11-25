use crate::{
    config::app::AppConfig,
    global::{
        config::{DOCKER_API_VERSION, HOST},
        docker::DockerEndpoints,
    },
    modules::{
        system::services::SystemService,
        volumes::{dto::Volume, mapper::volume_mapper},
    },
};
use serde_json::Value;
use std::{error::Error, sync::Arc};

pub struct VolumeService {
    app_config: AppConfig,
    system_service: Arc<SystemService>,
}

impl VolumeService {
    pub fn new(app_config: AppConfig, system_service: Arc<SystemService>) -> Self {
        Self {
            app_config,
            system_service,
        }
    }

    pub async fn get_all_volumes(&self) -> Result<Vec<Volume>, Box<dyn Error>> {
        // Use dedicated SystemService to get complete UsageData (RefCount and Size)
        if let Ok(df_json) = self.system_service.get_system_df().await {
            if let Some(volumes_array) = df_json.get("Volumes").and_then(Value::as_array) {
                let volumes: Vec<Volume> = volumes_array
                    .iter()
                    .map(|item| {
                        let mapped = volume_mapper(item);
                        Volume::from_json(&mapped)
                    })
                    .collect();
                return Ok(volumes);
            }
        }

        // Fallback to standard /volumes endpoint
        let url = format!(
            "http://{}/{}{}",
            *HOST,
            *DOCKER_API_VERSION,
            DockerEndpoints::LIST_VOLUMES
        );
        let res = self.app_config.client.get(url).send().await?;
        let json: Value = res.json().await?;

        let volumes_array = json
            .get("Volumes")
            .and_then(Value::as_array)
            .ok_or_else(|| "Expected Docker response to have a Volumes array")?;

        let volumes: Vec<Volume> = volumes_array
            .iter()
            .map(|item| {
                let mapped = volume_mapper(item);
                Volume::from_json(&mapped)
            })
            .collect();

        Ok(volumes)
    }

    pub async fn inspect_volume(&self, name: &str) -> Result<Value, Box<dyn Error>> {
        let endpoint = DockerEndpoints::INSPECT_A_VOLUME.replace("{name}", name);
        let url = format!("http://{}/{}{}", *HOST, *DOCKER_API_VERSION, endpoint);
        let res = self.app_config.client.get(url).send().await?;
        let mut json: Value = res.json().await?;

        // Enrich with UsageData from SystemService if missing
        if json.get("UsageData").is_none() || json["UsageData"].is_null() {
            if let Ok(df_json) = self.system_service.get_system_df().await {
                if let Some(vols) = df_json.get("Volumes").and_then(Value::as_array) {
                    for v in vols {
                        if v.get("Name").and_then(Value::as_str) == Some(name) {
                            if let Some(usage) = v.get("UsageData") {
                                if let Some(obj) = json.as_object_mut() {
                                    obj.insert("UsageData".to_string(), usage.clone());
                                }
                            }
                            break;
                        }
                    }
                }
            }
        }

        Ok(json)
    }

    pub async fn delete_volume(&self, name: &str) -> Result<(), Box<dyn Error>> {
        let endpoint = DockerEndpoints::DELETE_A_VOLUME.replace("{name}", name);
        let url = format!("http://{}/{}{}", *HOST, *DOCKER_API_VERSION, endpoint);
        let res = self.app_config.client.delete(url).send().await?;
        if !res.status().is_success() {
            let err_text = res.text().await.unwrap_or_default();
            return Err(format!("Docker delete volume failed: {err_text}").into());
        }
        Ok(())
    }
}
