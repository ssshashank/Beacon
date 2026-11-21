use crate::config::app::AppConfig;
use crate::global::{
    config::{DOCKER_API_VERSION, HOST},
    docker::DockerEndpoints,
    event_bus,
};
use axum::response::sse::Event;
use futures_util::{StreamExt, stream::BoxStream};
use std::collections::VecDeque;
use std::convert::Infallible;
use std::sync::{Arc, Mutex};
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

        event_bus::spawn_listener(
            app_config.client.clone(),
            app_config.event_tx.clone(),
            Arc::new(Mutex::new(VecDeque::new())),
            app_config.shutdown.clone(),
            url,
            None,
            None,
        );

        Self { app_config }
    }

    pub async fn stream_events(&self) -> FutureImpl {
        let rx = self.app_config.event_tx.subscribe();

        BroadcastStream::new(rx)
            .filter_map(|msg| async move { msg.ok().map(|s| Ok(Event::default().data(s))) })
            .boxed()
    }
}
