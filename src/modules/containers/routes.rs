use crate::modules::containers::{constant::ContainerRoutesName, controller::ContainerController};
use axum::{Json, Router, extract::State, routing::get};
use serde_json::Value;
use std::sync::Arc;

pub fn routes(controller: Arc<ContainerController>) -> Router {
    Router::new()
        .route(
            ContainerRoutesName::GET_ALL_CONTAINERS,
            get(get_all_containers),
        )
        .with_state(controller)
}

async fn get_all_containers(State(controller): State<Arc<ContainerController>>) -> Json<Value> {
    controller.get_all_containers().await
}
