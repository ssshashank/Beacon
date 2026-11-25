use crate::{
    global::dto::ResponseBody,
    modules::system::{constant::SystemRoutesName, controller::SystemController},
};
use axum::{Json, Router, extract::State, routing::get};
use serde_json::Value;
use std::sync::Arc;

pub fn routes(controller: Arc<SystemController>) -> Router {
    Router::new()
        .route(SystemRoutesName::GET_SYSTEM_DF, get(get_system_df))
        .route(SystemRoutesName::GET_SYSTEM_INFO, get(get_system_info))
        .route(
            SystemRoutesName::GET_SYSTEM_VERSION,
            get(get_system_version),
        )
        .route(SystemRoutesName::PING, get(ping))
        .with_state(controller)
}

async fn get_system_df(
    State(controller): State<Arc<SystemController>>,
) -> Json<ResponseBody<Value>> {
    controller.get_system_df().await
}

async fn get_system_info(
    State(controller): State<Arc<SystemController>>,
) -> Json<ResponseBody<Value>> {
    controller.get_system_info().await
}

async fn get_system_version(
    State(controller): State<Arc<SystemController>>,
) -> Json<ResponseBody<Value>> {
    controller.get_system_version().await
}

async fn ping(State(controller): State<Arc<SystemController>>) -> Json<ResponseBody<String>> {
    controller.ping().await
}
