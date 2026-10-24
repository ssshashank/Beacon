use crate::global::dto::ResponseBody;
use crate::modules::containers::dto::{Container, Process};
use crate::modules::containers::service::ContainerService;
use axum::Json;
use axum::response::{Sse, sse::Event};
use reqwest::StatusCode;
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

    pub async fn get_all_containers(&self) -> Json<ResponseBody<Vec<Container>>> {
        match self.service.get_all_containers().await {
            Ok(container) => Json(ResponseBody::success(StatusCode::OK, container)),
            Err(_) => Json(ResponseBody::error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "CONTAINER_NOT_FOUND",
                "list of containers not found",
            )),
        }
    }

    pub async fn inspect_container(&self, id: &str) -> Json<ResponseBody<Container>> {
        match self.service.inspect_container(id).await {
            Ok(container) => Json(ResponseBody::success(StatusCode::OK, container)),
            Err(e) => {
                eprintln!("Error talking to Docker socket: {e}");
                Json(ResponseBody::error(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "CONTAINER_NOT_FOUND",
                    "Container with this id not found.",
                ))
            }
        }
    }

    pub async fn get_all_process_running_in_container(
        &self,
        id: &str,
    ) -> Json<ResponseBody<Vec<Process>>> {
        match self.service.list_containers_process(id).await {
            Ok(json) => Json(ResponseBody::success(StatusCode::OK, json)),
            Err(e) => {
                eprintln!("Error talking to Docker socket: {e}");
                Json(ResponseBody::error(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "CONTAINER_NOT_FOUND",
                    "Container with this id not found.",
                ))
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

    pub async fn stream_container_resource_usage(
        &self,
        id: &str,
    ) -> Sse<impl futures_util::Stream<Item = Result<Event, Infallible>> + use<>> {
        Sse::new(self.service.stream_container_resource_usage(id).await)
    }
}
