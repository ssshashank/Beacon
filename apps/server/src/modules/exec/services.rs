use crate::{
    config::app::AppConfig,
    global::{
        config::{DOCKER_API_VERSION, HOST},
        docker::DockerEndpoints,
    },
    modules::exec::utils::parse_ls_line,
};
use axum::response::sse::Event;
use futures_util::{StreamExt, stream::BoxStream};
use serde_json::{Value, json};
use std::convert::Infallible;
use std::error::Error;
use tokio_stream::wrappers::BroadcastStream;

// Type alias
pub type FutureImpl = BoxStream<'static, Result<Event, Infallible>>;

fn transform_exec_log(raw: &str) -> Option<Event> {
    let val: Value = serde_json::from_str(raw).ok()?;
    if val["event"].as_str() == Some("end") || val["status"].as_str() == Some("completed") {
        return Some(
            Event::default()
                .event("end")
                .data(r#"{"status":"completed"}"#),
        );
    }
    let msg = val["message"].as_str()?;
    let exec = parse_ls_line(msg)?;
    Some(Event::default().data(exec.to_json().to_string()))
}

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

    // Stream exec output directly (mapped to ExecDTO)
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
                .filter_map(|raw| transform_exec_log(&raw).map(Ok)),
        );

        let live_stream = BroadcastStream::new(rx).filter_map(|msg_res| async move {
            let raw = msg_res.ok()?;
            transform_exec_log(&raw).map(Ok)
        });

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
