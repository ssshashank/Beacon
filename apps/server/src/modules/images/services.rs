use crate::global::{docker::DockerEndpoints, utils};
use serde_json::Value;
use std::error::Error;

pub struct ImageService {
    client: reqwest::Client,
}

impl ImageService {
    pub fn new(client: reqwest::Client) -> Self {
        Self { client }
    }

    pub async fn get_all_images(&self) -> Result<Value, Box<dyn Error>> {
        utils::call_end_points(&self.client, DockerEndpoints::LIST_IMAGES, None).await
    }

    pub async fn inspect_image(&self, id: &str) -> Result<Value, Box<dyn Error>> {
        utils::call_end_points(&self.client, DockerEndpoints::INSPECT_AN_IMAGE, Some(id)).await
    }

    pub async fn get_image_attestation(&self, id: &str) -> Result<Value, Box<dyn Error>> {
        utils::call_end_points(
            &self.client,
            DockerEndpoints::GET_ATTESTATION_STATEMENT_OF_AN_IMAGE,
            Some(id),
        )
        .await
    }

    pub async fn get_image_history(&self, id: &str) -> Result<Value, Box<dyn Error>> {
        utils::call_end_points(&self.client, DockerEndpoints::GET_HISTORY_OF_AN_IMAGE, Some(id))
            .await
    }
}
