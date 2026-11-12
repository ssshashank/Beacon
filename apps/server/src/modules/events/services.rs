use crate::config::app::AppConfig;
use crate::global::{
    config::{DOCKER_API_VERSION, HOST},
    docker::DockerEndpoints,
    sse_broadcast,
};
use axum::response::sse::Event;
use futures_util::{StreamExt, stream::BoxStream};
use std::convert::Infallible;
use tokio_stream::wrappers::BroadcastStream;

pub struct EventService {
    app_config: AppConfig,
}

type FutureImpl = BoxStream<'static, Result<Event, Infallible>>;

impl EventService {
    pub fn new(app_config: AppConfig) -> Self {
        let url = format!(
            "http://{}/{}{}",
            *HOST,
            *DOCKER_API_VERSION,
            DockerEndpoints::STREAM_EVENTS
        );

        sse_broadcast::spawn_listener(
            app_config.client.clone(),
            app_config.event_tx.clone(),
            app_config.shutdown.clone(),
            url,
        );

        Self { app_config }
    }

    pub async fn stream_events(&self) -> FutureImpl {
        let rx = self.app_config.event_tx.subscribe();
        dbg!(" in stream events usgae");

        BroadcastStream::new(rx)
            .filter_map(|event| async move { event.ok().map(Ok) })
            .boxed()
    }
}
