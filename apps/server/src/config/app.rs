use crate::global::event_bus::EventBus;
use axum::response::sse::Event;
use reqwest::Client;
use tokio::sync::broadcast;
use tokio_util::sync::CancellationToken;

#[derive(Clone)]
pub struct AppConfig {
    pub client: Client,
    pub event_tx: broadcast::Sender<Event>,
    pub shutdown: CancellationToken,
    pub event_bus: EventBus,
}
