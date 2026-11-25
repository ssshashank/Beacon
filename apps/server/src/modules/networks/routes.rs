use crate::{
    global::dto::ResponseBody,
    modules::networks::{constant::NetworkRoutesName, controller::NetworkController, dto::Network},
};
use axum::{
    Json, Router,
    extract::{Path, State},
    routing::{delete, get},
};
use serde_json::Value;
use std::sync::Arc;

pub fn routes(controller: Arc<NetworkController>) -> Router {
    Router::new()
        .route(NetworkRoutesName::GET_ALL_NETWORKS, get(get_all_networks))
        .route(
            NetworkRoutesName::INSPECT_NETWORK_BY_ID,
            get(inspect_network),
        )
        .route(
            NetworkRoutesName::DELETE_NETWORK_BY_ID,
            delete(delete_network),
        )
        .with_state(controller)
}

async fn get_all_networks(
    State(controller): State<Arc<NetworkController>>,
) -> Json<ResponseBody<Vec<Network>>> {
    controller.get_all_networks().await
}

async fn inspect_network(
    State(controller): State<Arc<NetworkController>>,
    Path(id): Path<String>,
) -> Json<Value> {
    controller.inspect_network(&id).await
}

async fn delete_network(
    State(controller): State<Arc<NetworkController>>,
    Path(id): Path<String>,
) -> Json<ResponseBody<Value>> {
    controller.delete_network(&id).await
}
