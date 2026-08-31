use crate::global::{config, docker::DockerEndpoints};
use axum::response::sse::Event;
use futures_util::{StreamExt, stream::BoxStream};
use std::convert::Infallible;

pub struct EventService {
    client: reqwest::Client,
}

type FutureImpl = BoxStream<'static, Result<Event, Infallible>>;

impl EventService {
    pub fn new(client: reqwest::Client) -> Self {
        Self { client }
    }

    pub async fn stream_events(&self) -> FutureImpl {
        let url = format!(
            "http://localhost/{}{}",
            config::APP_VERSION,
            DockerEndpoints::STREAM_EVENTS
        );
        let client = self.client.clone();
        let stream_fut = async move {
            let response = client.get(url).send().await.unwrap();
            response.bytes_stream().map(|chunk| {
                let bytes = chunk.unwrap();
                let data = String::from_utf8_lossy(&bytes).to_string();
                Ok(Event::default().data(data))
            })
        };
        futures_util::stream::once(stream_fut).flatten().boxed()
    }
}
