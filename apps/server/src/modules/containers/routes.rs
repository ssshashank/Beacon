use crate::modules::containers::{constant::ContainerRoutesName, controller::ContainerController};
use axum::{
    Json, Router,
    extract::{Path, State},
    routing::get,
};
use serde_json::Value;
use std::sync::Arc;

pub fn routes(controller: Arc<ContainerController>) -> Router {
    Router::new()
        .route(
            ContainerRoutesName::GET_ALL_CONTAINERS,
            get(get_all_containers),
        )
        .route(
            ContainerRoutesName::INSPECT_CONTAINER_BY_ID,
            get(inspect_container),
        )
        .route(
            ContainerRoutesName::GET_ALL_PROCESS_RUNNING_IN_CONTAINER,
            get(get_all_process_running_in_container_by_id),
        )
        .route(
            ContainerRoutesName::GET_CONTAINER_LOGS,
            get(get_container_logs_by_id),
        )
        .route(
            ContainerRoutesName::GET_CHANGES_ON_CONTAINER_FILE_SYSTEM_BY_ID,
            get(get_changes_on_container_file_system_by_id),
        )
        .route(
            ContainerRoutesName::EXPORT_CONTAINER_BY_ID,
            get(export_container_by_id),
        )
        .route(
            ContainerRoutesName::GET_CONTAINER_RESOURCE_USAGE_STATS_BY_ID,
            get(get_container_resource_usage_stats_by_id),
        )
        .with_state(controller)
}

async fn get_all_containers(State(controller): State<Arc<ContainerController>>) -> Json<Value> {
    controller.get_all_containers().await
}

async fn inspect_container(
    State(controller): State<Arc<ContainerController>>,
    Path(id): Path<String>,
) -> Json<Value> {
    controller.inspect_container(&id).await
}

async fn get_all_process_running_in_container_by_id(
    State(controller): State<Arc<ContainerController>>,
    Path(id): Path<String>,
) -> Json<Value> {
    controller.get_all_process_running_in_container(&id).await
}

async fn get_container_logs_by_id(
    State(controller): State<Arc<ContainerController>>,
    Path(id): Path<String>,
) -> Json<Value> {
    controller.get_container_logs_by_id(&id).await
}

async fn get_changes_on_container_file_system_by_id(
    State(controller): State<Arc<ContainerController>>,
    Path(id): Path<String>,
) -> Json<Value> {
    controller
        .get_changes_on_container_file_system_by_id(&id)
        .await
}

async fn export_container_by_id(
    State(controller): State<Arc<ContainerController>>,
    Path(id): Path<String>,
) -> Json<Value> {
    controller.export_container_by_id(&id).await
}

async fn get_container_resource_usage_stats_by_id(
    State(controller): State<Arc<ContainerController>>,
    Path(id): Path<String>,
) -> Json<Value> {
    controller
        .get_container_resource_usage_stats_by_id(&id)
        .await
}
