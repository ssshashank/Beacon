use crate::{global::dto::ResponseBody, modules::exec::services::ExecService};
use axum::{
    Json,
    response::sse::{Event, Sse},
};
use reqwest::StatusCode;
use serde_json::Value;
use std::convert::Infallible;

pub struct ExecController {
    service: ExecService,
}

impl ExecController {
    pub fn new(service: ExecService) -> Self {
        Self { service }
    }

    pub async fn create_an_exec(&self, id: &str, payload: &Value) -> Json<ResponseBody<Value>> {
        match self.service.create_an_exec(id, payload).await {
            Ok(val) => Json(ResponseBody::success(StatusCode::OK, val)),
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

    pub async fn start_an_exec(
        &self,
        id: &str,
    ) -> Sse<impl futures_util::Stream<Item = Result<Event, Infallible>> + use<>> {
        Sse::new(self.service.start_an_exec(id).await)
    }

    pub async fn inspect_an_exec(&self, id: &str) -> Json<ResponseBody<Value>> {
        match self.service.inspect_an_exec(id).await {
            Ok(val) => Json(ResponseBody::success(StatusCode::OK, val)),
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
}
