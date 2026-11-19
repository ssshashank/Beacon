use crate::{
    global::dto::ResponseBody,
    modules::exec::{constant::ExecRoutesName, controller::ExecController},
};
use axum::{
    Json, Router,
    extract::{Path, State},
    response::sse::{Event, Sse},
    routing::{get, post},
};
use serde_json::Value;
use std::convert::Infallible;
use std::sync::Arc;

pub fn routes(controller: Arc<ExecController>) -> Router {
    Router::new()
        .route(
            ExecRoutesName::INSPECT_AN_EXEC_BY_ID,
            get(inspect_an_exec_by_id),
        )
        .route(
            ExecRoutesName::CREATE_AN_EXEC,
            post(create_an_exec_by_container_id),
        )
        .route(
            ExecRoutesName::START_AN_EXEC,
            get(start_an_exec_by_exec_id).post(start_an_exec_by_exec_id),
        )
        .with_state(controller)
}

async fn inspect_an_exec_by_id(
    State(controller): State<Arc<ExecController>>,
    Path(id): Path<String>,
) -> Json<ResponseBody<Value>> {
    controller.inspect_an_exec(&id).await
}

async fn create_an_exec_by_container_id(
    State(controller): State<Arc<ExecController>>,
    Path(id): Path<String>,
    Json(payload): Json<Value>,
) -> Json<ResponseBody<Value>> {
    controller.create_an_exec(&id, &payload).await
}

async fn start_an_exec_by_exec_id(
    Path(id): Path<String>,
    State(controller): State<Arc<ExecController>>,
) -> Sse<impl futures_util::Stream<Item = Result<Event, Infallible>>> {
    controller.start_an_exec(&id).await
}
