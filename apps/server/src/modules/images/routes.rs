use crate::{
    global::dto::ResponseBody,
    modules::images::{constant::ImageRoutesName, controller::ImageController, dto::Image},
};
use axum::{
    Json, Router,
    extract::{Path, State},
    routing::{delete, get},
};
use serde_json::Value;
use std::sync::Arc;

pub fn routes(controller: Arc<ImageController>) -> Router {
    Router::new()
        .route(ImageRoutesName::GET_ALL_IMAGES, get(get_all_images))
        .route(ImageRoutesName::INSPECT_IMAGE_BY_ID, get(inspect_image))
        .route(
            ImageRoutesName::GET_IMAGE_ATTESTATION_BY_ID,
            get(get_image_attestation),
        )
        .route(
            ImageRoutesName::GET_IMAGE_HISTORY_BY_ID,
            get(get_image_history),
        )
        .route(ImageRoutesName::DELETE_IMAGE_BY_ID, delete(delete_image))
        .route(ImageRoutesName::EXPORT_IMAGE_BY_ID, get(export_image))
        .with_state(controller)
}

async fn get_all_images(
    State(controller): State<Arc<ImageController>>,
) -> Json<ResponseBody<Vec<Image>>> {
    controller.get_all_images().await
}

async fn inspect_image(
    State(controller): State<Arc<ImageController>>,
    Path(id): Path<String>,
) -> Json<Value> {
    controller.inspect_image(&id).await
}

async fn get_image_attestation(
    State(controller): State<Arc<ImageController>>,
    Path(id): Path<String>,
) -> Json<Value> {
    controller.get_image_attestation(&id).await
}

async fn get_image_history(
    State(controller): State<Arc<ImageController>>,
    Path(id): Path<String>,
) -> Json<Value> {
    controller.get_image_history(&id).await
}

async fn delete_image(
    State(controller): State<Arc<ImageController>>,
    Path(id): Path<String>,
) -> Json<ResponseBody<Value>> {
    controller.delete_image(&id).await
}

async fn export_image(
    State(controller): State<Arc<ImageController>>,
    Path(id): Path<String>,
) -> Json<ResponseBody<Value>> {
    controller.export_image(&id).await
}
