use crate::modules::containers::service::ContainerService;
use axum::Json;
use axum::response::{Sse, sse::Event};
use serde_json::Value;
use std::convert::Infallible;

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

    pub async fn inspect_container(&self, id: &str) -> Json<Value> {
        match self.service.inspect_container(id).await {
            Ok(json) => Json(json),
            Err(e) => {
                eprintln!("Error talking to Docker socket: {e}");
                Json(Value::Array(vec![]))
            }
        }
    }

    pub async fn get_all_process_running_in_container(&self, id: &str) -> Json<Value> {
        match self.service.list_containers_process(id).await {
            Ok(json) => Json(json),
            Err(e) => {
                eprintln!("Error talking to Docker socket: {e}");
                Json(Value::Array(vec![]))
            }
        }
    }

    pub async fn stream_container_logs_by_id(
        &self,
        id: &str,
    ) -> Sse<impl futures_util::Stream<Item = Result<Event, Infallible>> + use<>> {
        Sse::new(self.service.stream_container_logs(id).await)
    }

    pub async fn get_changes_on_container_file_system_by_id(&self, id: &str) -> Json<Value> {
        match self.service.get_changes_on_container_file_system(id).await {
            Ok(json) => Json(json),
            Err(e) => {
                eprintln!("Error talking to Docker socket: {e}");
                Json(Value::Array(vec![]))
            }
        }
    }

    pub async fn export_container_by_id(&self, id: &str) -> Json<Value> {
        match self.service.export_a_container(id).await {
            Ok(json) => Json(json),
            Err(e) => {
                eprintln!("Error talking to Docker socket: {e}");
                Json(Value::Array(vec![]))
            }
        }
    }

    pub async fn get_container_resource_usage_stats_by_id(&self, id: &str) -> Json<Value> {
        match self.service.get_containers_resource_usage(id).await {
            Ok(json) => Json(json),
            Err(e) => {
                eprintln!("Error talking to Docker socket: {e}");
                Json(Value::Array(vec![]))
            }
        }
    }
}
