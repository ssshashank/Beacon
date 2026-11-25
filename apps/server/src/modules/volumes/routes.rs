use crate::{
    global::dto::ResponseBody,
    modules::volumes::{constant::VolumeRoutesName, controller::VolumeController, dto::Volume},
};
use axum::{
    Json, Router,
    extract::{Path, State},
    routing::{delete, get},
};
use serde_json::Value;
use std::sync::Arc;

pub fn routes(controller: Arc<VolumeController>) -> Router {
    Router::new()
        .route(VolumeRoutesName::GET_ALL_VOLUMES, get(get_all_volumes))
        .route(
            VolumeRoutesName::INSPECT_VOLUME_BY_NAME,
            get(inspect_volume),
        )
        .route(
            VolumeRoutesName::DELETE_VOLUME_BY_NAME,
            delete(delete_volume),
        )
        .with_state(controller)
}

async fn get_all_volumes(
    State(controller): State<Arc<VolumeController>>,
) -> Json<ResponseBody<Vec<Volume>>> {
    controller.get_all_volumes().await
}

async fn inspect_volume(
    State(controller): State<Arc<VolumeController>>,
    Path(name): Path<String>,
) -> Json<Value> {
    controller.inspect_volume(&name).await
}

async fn delete_volume(
    State(controller): State<Arc<VolumeController>>,
    Path(name): Path<String>,
) -> Json<ResponseBody<Value>> {
    controller.delete_volume(&name).await
}
