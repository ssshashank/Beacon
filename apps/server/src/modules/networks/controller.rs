use crate::{
    global::dto::ResponseBody,
    modules::networks::{dto::Network, services::NetworkService},
};
use axum::Json;
use reqwest::StatusCode;
use serde_json::Value;

pub struct NetworkController {
    service: NetworkService,
}

impl NetworkController {
    pub fn new(network_service: NetworkService) -> Self {
        Self {
            service: network_service,
        }
    }

    pub async fn get_all_networks(&self) -> Json<ResponseBody<Vec<Network>>> {
        match self.service.get_all_networks().await {
            Ok(networks) => Json(ResponseBody::success(StatusCode::OK, networks)),
            Err(e) => {
                eprintln!("Error getting networks: {e}");
                Json(ResponseBody::error(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "NETWORKS_NOT_FOUND",
                    "list of networks not found",
                ))
            }
        }
    }

    pub async fn inspect_network(&self, id: &str) -> Json<Value> {
        match self.service.inspect_network(id).await {
            Ok(json) => Json(json),
            Err(e) => {
                eprintln!("Error inspecting network {id}: {e}");
                Json(Value::Null)
            }
        }
    }

    pub async fn delete_network(&self, id: &str) -> Json<ResponseBody<Value>> {
        match self.service.delete_network(id).await {
            Ok(_) => Json(ResponseBody::success(
                StatusCode::OK,
                serde_json::json!({ "id": id, "status": "deleted" }),
            )),
            Err(e) => {
                eprintln!("Error deleting network {id}: {e}");
                Json(ResponseBody::error(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "DELETE_NETWORK_FAILED",
                    e.to_string(),
                ))
            }
        }
    }
}
