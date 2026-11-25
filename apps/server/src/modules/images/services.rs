use crate::{
    config::app::AppConfig,
    global::{
        config::{DOCKER_API_VERSION, HOST},
        docker::DockerEndpoints,
    },
    modules::images::{dto::Image, mapper::image_mapper},
};
use serde_json::Value;
use std::error::Error;

pub struct ImageService {
    app_config: AppConfig,
}

impl ImageService {
    pub fn new(app_config: AppConfig) -> Self {
        Self { app_config }
    }

    // Get all images
    pub async fn get_all_images(&self) -> Result<Vec<Image>, Box<dyn Error>> {
        // format the docker api endpoints
        let url = format!(
            "http://{}/{}{}",
            *HOST,
            *DOCKER_API_VERSION,
            DockerEndpoints::LIST_IMAGES
        );
        let res = self.app_config.client.get(url).send().await?;
        let json: Value = res.json().await?;

        // check if json is array
        let json_as_array = json
            .as_array()
            .ok_or_else(|| "Expected Docker response to be an array")?;

        // deserialize into images vector
        let images: Vec<Image> = json_as_array
            .iter()
            .map(|item| {
                let map_response = image_mapper(&item);
                Image::from_json(&map_response)
            })
            .collect();

        // serialize the json array
        Ok(images)
    }

    pub async fn inspect_image(&self, id: &str) -> Result<Value, Box<dyn Error>> {
        // format the docker api endpoints
        let endpoint = DockerEndpoints::INSPECT_AN_IMAGE.replace("{id}", id);
        let url = format!("http://{}/{}{}", *HOST, *DOCKER_API_VERSION, endpoint);
        let res = self.app_config.client.get(url).send().await?;
        let json: Value = res.json().await?;
        Ok(json)
    }

    pub async fn get_image_attestation(&self, id: &str) -> Result<Value, Box<dyn Error>> {
        // format the docker api endpoints
        let endpoint = DockerEndpoints::GET_ATTESTATION_STATEMENT_OF_AN_IMAGE.replace("{id}", id);
        let url = format!("http://{}/{}{}", *HOST, *DOCKER_API_VERSION, endpoint);
        let res = self.app_config.client.get(url).send().await?;
        let json: Value = res.json().await?;
        Ok(json)
    }

    pub async fn get_image_history(&self, id: &str) -> Result<Value, Box<dyn Error>> {
        // format the docker api endpoints
        let endpoint = DockerEndpoints::GET_HISTORY_OF_AN_IMAGE.replace("{id}", id);
        let url = format!("http://{}/{}{}", *HOST, *DOCKER_API_VERSION, endpoint);
        let res = self.app_config.client.get(url).send().await?;
        let json: Value = res.json().await?;
        Ok(json)
    }

    pub async fn delete_image(&self, id: &str) -> Result<(), Box<dyn Error>> {
        let endpoint = DockerEndpoints::DELETE_AN_IMAGE.replace("{id}", id);
        let url = format!("http://{}/{}{}", *HOST, *DOCKER_API_VERSION, endpoint);
        let res = self.app_config.client.delete(url).send().await?;
        if !res.status().is_success() {
            let err_text = res.text().await.unwrap_or_default();
            return Err(format!("Docker delete image failed: {err_text}").into());
        }
        Ok(())
    }

    pub async fn export_image(&self, id: &str) -> Result<Value, Box<dyn Error>> {
        let endpoint = DockerEndpoints::EXPORT_AN_IMAGE.replace("{id}", id);
        let url = format!("http://{}/{}{}", *HOST, *DOCKER_API_VERSION, endpoint);
        let res = self.app_config.client.get(url).send().await?;
        if !res.status().is_success() {
            let err_text = res.text().await.unwrap_or_default();
            return Err(format!("Docker export image failed: {err_text}").into());
        }
        Ok(serde_json::json!({ "id": id, "status": "exported" }))
    }
}
