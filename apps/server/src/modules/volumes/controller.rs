use crate::{
    global::dto::ResponseBody,
    modules::volumes::{dto::Volume, services::VolumeService},
};
use axum::Json;
use reqwest::StatusCode;
use serde_json::Value;

pub struct VolumeController {
    service: VolumeService,
}

impl VolumeController {
    pub fn new(volume_service: VolumeService) -> Self {
        Self {
            service: volume_service,
        }
    }

    pub async fn get_all_volumes(&self) -> Json<ResponseBody<Vec<Volume>>> {
        match self.service.get_all_volumes().await {
            Ok(volumes) => Json(ResponseBody::success(StatusCode::OK, volumes)),
            Err(e) => {
                eprintln!("Error getting volumes: {e}");
                Json(ResponseBody::error(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "VOLUMES_NOT_FOUND",
                    "list of volumes not found",
                ))
            }
        }
    }

    pub async fn inspect_volume(&self, name: &str) -> Json<Value> {
        match self.service.inspect_volume(name).await {
            Ok(json) => Json(json),
            Err(e) => {
                eprintln!("Error inspecting volume {name}: {e}");
                Json(Value::Null)
            }
        }
    }

    pub async fn delete_volume(&self, name: &str) -> Json<ResponseBody<Value>> {
        match self.service.delete_volume(name).await {
            Ok(_) => Json(ResponseBody::success(
                StatusCode::OK,
                serde_json::json!({ "name": name, "status": "deleted" }),
            )),
            Err(e) => {
                eprintln!("Error deleting volume {name}: {e}");
                Json(ResponseBody::error(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "DELETE_VOLUME_FAILED",
                    e.to_string(),
                ))
            }
        }
    }
}
