use crate::global::sse_broadcast::SseRegistry;
use axum::response::sse::Event;
use reqwest::Client;
use std::sync::Arc;
use tokio::sync::broadcast;
use tokio_util::sync::CancellationToken;

#[derive(Clone)]
pub struct AppConfig {
    pub client: Client,
    pub event_tx: broadcast::Sender<Event>,
    pub shutdown: CancellationToken,
    pub container_stats: Arc<SseRegistry>,
    pub container_logs: Arc<SseRegistry>,
}
