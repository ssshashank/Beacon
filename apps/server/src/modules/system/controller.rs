use crate::{global::dto::ResponseBody, modules::system::services::SystemService};
use axum::Json;
use reqwest::StatusCode;
use serde_json::Value;
use std::sync::Arc;

pub struct SystemController {
    service: Arc<SystemService>,
}

impl SystemController {
    pub fn new(system_service: Arc<SystemService>) -> Self {
        Self {
            service: system_service,
        }
    }

    pub async fn get_system_df(&self) -> Json<ResponseBody<Value>> {
        match self.service.get_system_df().await {
            Ok(json) => Json(ResponseBody::success(StatusCode::OK, json)),
            Err(e) => {
                eprintln!("Error getting system df: {e}");
                Json(ResponseBody::error(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "SYSTEM_DF_FAILED",
                    e.to_string(),
                ))
            }
        }
    }

    pub async fn get_system_info(&self) -> Json<ResponseBody<Value>> {
        match self.service.get_system_info().await {
            Ok(json) => Json(ResponseBody::success(StatusCode::OK, json)),
            Err(e) => {
                eprintln!("Error getting system info: {e}");
                Json(ResponseBody::error(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "SYSTEM_INFO_FAILED",
                    e.to_string(),
                ))
            }
        }
    }

    pub async fn get_system_version(&self) -> Json<ResponseBody<Value>> {
        match self.service.get_system_version().await {
            Ok(json) => Json(ResponseBody::success(StatusCode::OK, json)),
            Err(e) => {
                eprintln!("Error getting system version: {e}");
                Json(ResponseBody::error(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "SYSTEM_VERSION_FAILED",
                    e.to_string(),
                ))
            }
        }
    }

    pub async fn ping(&self) -> Json<ResponseBody<String>> {
        match self.service.ping().await {
            Ok(res) => Json(ResponseBody::success(StatusCode::OK, res)),
            Err(e) => {
                eprintln!("Error pinging Docker: {e}");
                Json(ResponseBody::error(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "PING_FAILED",
                    e.to_string(),
                ))
            }
        }
    }
}
