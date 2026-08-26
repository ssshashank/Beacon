use crate::modules::containers::service::ContainerService;
use axum::Json;
use serde_json::Value;

pub struct ContainerController {
    service: ContainerService,
}

impl ContainerController {
    pub fn new(container_service: ContainerService) -> Self {
        Self {
            service: container_service,
        }
    }

    pub async fn get_all_containers(&self) -> Json<Value> {
        match self.service.get_all_containers().await {
            Ok(json) => Json(json),
            Err(e) => {
                eprintln!("Error talking to Docker socket: {e}");
                Json(Value::Array(vec![]))
            }
        }
    }
}
