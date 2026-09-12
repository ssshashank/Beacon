use crate::modules::images::services::ImageService;
use axum::Json;
use serde_json::Value;

pub struct ImageController {
    service: ImageService,
}

impl ImageController {
    pub fn new(image_service: ImageService) -> Self {
        Self {
            service: image_service,
        }
    }

    pub async fn get_all_images(&self) -> Json<Value> {
        match self.service.get_all_images().await {
            Ok(json) => Json(json),
            Err(e) => {
                eprintln!("Error talking to Docker socket: {e}");
                Json(Value::Array(vec![]))
            }
        }
    }

    pub async fn inspect_image(&self, id: &str) -> Json<Value> {
        match self.service.inspect_image(id).await {
            Ok(json) => Json(json),
            Err(e) => {
                eprintln!("Error talking to Docker socket: {e}");
                Json(Value::Array(vec![]))
            }
        }
    }

    pub async fn get_image_attestation(&self, id: &str) -> Json<Value> {
        match self.service.get_image_attestation(id).await {
            Ok(json) => Json(json),
            Err(e) => {
                eprintln!("Error talking to Docker socket: {e}");
                Json(Value::Array(vec![]))
            }
        }
    }

    pub async fn get_image_history(&self, id: &str) -> Json<Value> {
        match self.service.get_image_history(id).await {
            Ok(json) => Json(json),
            Err(e) => {
                eprintln!("Error talking to Docker socket: {e}");
                Json(Value::Array(vec![]))
            }
        }
    }
}
