use crate::{
    global::dto::ResponseBody,
    modules::images::{dto::Image, services::ImageService},
};
use axum::Json;
use reqwest::StatusCode;
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

    pub async fn get_all_images(&self) -> Json<ResponseBody<Vec<Image>>> {
        match self.service.get_all_images().await {
            Ok(json) => Json(ResponseBody::success(StatusCode::OK, json)),
            Err(_) => Json(ResponseBody::error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "IMAGES_NOT_FOUND",
                "list of images not found",
            )),
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

    pub async fn delete_image(&self, id: &str) -> Json<ResponseBody<Value>> {
        match self.service.delete_image(id).await {
            Ok(_) => Json(ResponseBody::success(
                StatusCode::OK,
                serde_json::json!({ "id": id, "status": "deleted" }),
            )),
            Err(e) => {
                eprintln!("Error deleting image {id}: {e}");
                Json(ResponseBody::error(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "DELETE_IMAGE_FAILED",
                    e.to_string(),
                ))
            }
        }
    }

    pub async fn export_image(&self, id: &str) -> Json<ResponseBody<Value>> {
        match self.service.export_image(id).await {
            Ok(val) => Json(ResponseBody::success(StatusCode::OK, val)),
            Err(e) => {
                eprintln!("Error exporting image {id}: {e}");
                Json(ResponseBody::error(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "EXPORT_IMAGE_FAILED",
                    e.to_string(),
                ))
            }
        }
    }
}
