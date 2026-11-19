use crate::{
    config::app::AppConfig,
    global::{
        config::{DOCKER_API_VERSION, HOST},
        docker::DockerEndpoints,
    },
};
use axum::response::sse::Event;
use futures_util::{StreamExt, stream::BoxStream};
use serde_json::{Value, json};
use std::convert::Infallible;
use std::error::Error;
use tokio_stream::wrappers::BroadcastStream;

// Type alias
pub type FutureImpl = BoxStream<'static, Result<Event, Infallible>>;

pub struct ExecService {
    app_config: AppConfig,
}

impl ExecService {
    pub fn new(app_config: AppConfig) -> Self {
        Self { app_config }
    }

    pub async fn create_an_exec(&self, id: &str, payload: &Value) -> Result<Value, Box<dyn Error>> {
        // format the docker api endpoints
        let endpoint = DockerEndpoints::CREATE_AN_EXEC.replace("{id}", id);
        let url = format!("http://{}/{}{}", *HOST, *DOCKER_API_VERSION, endpoint);
        let res = self
            .app_config
            .client
            .post(url)
            .json(payload)
            .send()
            .await?;

        let json: Value = res.json().await?;
        Ok(json)
    }

    // Stream exec output directly (same pattern as stream_container_logs)
    pub async fn start_an_exec(&self, id: &str) -> FutureImpl {
        let endpoint = DockerEndpoints::START_AN_EXEC.replace("{id}", id);
        let url = format!("http://{}/{}{}", *HOST, *DOCKER_API_VERSION, endpoint);
        let topic = format!("exec:stream:{id}");

        let payload = json!({
            "Detach": false,
            "Tty": false
        });

        let (rx, past_logs) = self.app_config.event_bus.subscribe_or_spawn_post(
            &topic,
            self.app_config.client.clone(),
            self.app_config.shutdown.clone(),
            url,
            payload,
        );

        let past_stream = futures_util::stream::iter(
            past_logs
                .into_iter()
                .map(|msg| Ok(Event::default().data(msg))),
        );

        let live_stream =
            BroadcastStream::new(rx).filter_map(|event| async move { event.ok().map(Ok) });

        past_stream.chain(live_stream).boxed()
    }

    pub async fn inspect_an_exec(&self, id: &str) -> Result<Value, Box<dyn Error>> {
        // format the docker api endpoints
        let endpoint = DockerEndpoints::INSPECT_AN_EXEC.replace("{id}", id);
        let url = format!("http://{}/{}{}", *HOST, *DOCKER_API_VERSION, endpoint);
        let res = self.app_config.client.get(url).send().await?;
        let json: Value = res.json().await?;
        Ok(json)
    }
}
