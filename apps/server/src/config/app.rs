use crate::global::event_bus::EventBus;
use reqwest::Client;
use tokio::sync::broadcast;
use tokio_util::sync::CancellationToken;

#[derive(Clone)]
pub struct AppConfig {
    pub client: Client,
    pub event_tx: broadcast::Sender<String>,
    pub shutdown: CancellationToken,
    pub event_bus: EventBus,
}
