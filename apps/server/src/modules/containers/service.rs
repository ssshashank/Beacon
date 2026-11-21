use crate::{
    config::app::AppConfig,
    global::{
        config::{DOCKER_API_VERSION, HOST},
        docker::DockerEndpoints,
        utils,
    },
    modules::containers::{
        dto::{Container, Process},
        mapper::{container_process_mapper, inspect_container_mapper, list_container_mapper},
    },
};
use axum::response::sse::Event;
use futures_util::{StreamExt, stream::BoxStream};
use serde_json::Value;
use std::convert::Infallible;
use std::error::Error;
use tokio_stream::wrappers::BroadcastStream;

// Type alias
type FutureImpl = BoxStream<'static, Result<Event, Infallible>>;

fn transform_archive_event(raw: &str) -> Option<Event> {
    if let Ok(val) = serde_json::from_str::<Value>(raw) {
        if val["event"].as_str() == Some("end") || val["status"].as_str() == Some("completed") {
            return Some(
                Event::default()
                    .event("end")
                    .data(r#"{"status":"completed"}"#),
            );
        }
    }
    Some(Event::default().data(raw.to_string()))
}

pub struct ContainerService {
    app_config: AppConfig,
}

impl ContainerService {
    pub fn new(app_config: AppConfig) -> Self {
        Self { app_config }
    }

    // Get all containers service
    pub async fn get_all_containers(&self) -> Result<Vec<Container>, Box<dyn std::error::Error>> {
        // format the docker api endpoints
        let url = format!(
            "http://{}/{}{}",
            *HOST,
            *DOCKER_API_VERSION,
            DockerEndpoints::LIST_CONTAINERS
        );

        let res = self.app_config.client.get(url).send().await?;
        let json: Value = res.json().await?;

        // check if json is array
        let json_as_array = json
            .as_array()
            .ok_or_else(|| "Expected Docker response to be an array")?;

        // deserialize into container vector
        let containers: Vec<Container> = json_as_array
            .iter()
            .map(|item| {
                let map_response = list_container_mapper(&item);
                Container::from_json(&map_response)
            })
            .collect();

        // serialize the json array
        Ok(containers)
    }

    // Inspect a container service
    pub async fn inspect_container(&self, id: &str) -> Result<Container, Box<dyn Error>> {
        // format the docker api endpoints
        let endpoint = DockerEndpoints::INSPECT_A_CONTAINER.replace("{id}", id);
        let url = format!("http://{}/{}{}", *HOST, *DOCKER_API_VERSION, endpoint);

        let res = self.app_config.client.get(url).send().await?;
        let json: Value = res.json().await?;
        let _ = json
            .as_object()
            .ok_or_else(|| "Expected docker response must be in an object")?;

        // map the container data
        let mapped_response = inspect_container_mapper(&json);
        let container: Container = Container::from_json(&mapped_response);
        Ok(container)
    }

    // List all container processes
    pub async fn list_containers_process(&self, id: &str) -> Result<Vec<Process>, Box<dyn Error>> {
        // format the docker api endpoints
        let endpoint = DockerEndpoints::LIST_PROCESS_RUNNING_IN_A_CONTAINER.replace("{id}", id);
        let url = format!("http://{}/{}{}", *HOST, *DOCKER_API_VERSION, endpoint);

        let res = self.app_config.client.get(url).send().await?;
        let json: Value = res.json().await?;
        let json_as_array = json["Processes"]
            .as_array()
            .ok_or_else(|| "Expected docker response must be an array")?;

        let titles: Vec<String> = json["Titles"]
            .as_array()
            .map(|arr| {
                arr.iter()
                    .filter_map(Value::as_str)
                    .map(|s| s.to_string())
                    .collect()
            })
            .unwrap_or_default();

        let process_list: Vec<Process> = json_as_array
            .iter()
            .map(|item| {
                let mapped_value = container_process_mapper(&titles, &item);
                Process::from_json(&mapped_value)
            })
            .collect();

        Ok(process_list)
    }

    // Get container logs
    pub async fn stream_container_logs(&self, id: &str) -> FutureImpl {
        // format the docker api endpoints
        let endpoint = DockerEndpoints::GET_CONTAINER_LOGS.replace("{id}", id);
        let url = format!("http://{}/{}{}", *HOST, *DOCKER_API_VERSION, endpoint);
        let topic = format!("containers:logs:{id}");

        let (rx, past_logs) = self.app_config.event_bus.subscribe_or_spawn(
            &topic,
            self.app_config.client.clone(),
            self.app_config.shutdown.clone(),
            url,
        );

        let past_stream = futures_util::stream::iter(
            past_logs
                .into_iter()
                .map(|msg| Ok(Event::default().data(msg))),
        );

        let live_stream = BroadcastStream::new(rx)
            .filter_map(|msg| async move { msg.ok().map(|s| Ok(Event::default().data(s))) });

        past_stream.chain(live_stream).boxed()
    }

    // Stream file system archive with 512-byte tar header parsing (works on distroless & scratch containers)
    pub async fn stream_archive_of_a_file_system(
        &self,
        id: &str,
        path: Option<&str>,
    ) -> FutureImpl {
        let req_path = path.unwrap_or("/").trim();
        let safe_path = if req_path.is_empty() { "/" } else { req_path };
        let url = format!(
            "http://{}/{}/containers/{id}/archive?path={safe_path}",
            *HOST, *DOCKER_API_VERSION
        );
        let topic = format!("containers:archive:{id}:{safe_path}");

        let (rx, past_logs) = self.app_config.event_bus.subscribe_or_spawn(
            &topic,
            self.app_config.client.clone(),
            self.app_config.shutdown.clone(),
            url,
        );

        let past_stream = futures_util::stream::iter(
            past_logs
                .into_iter()
                .filter_map(|raw| transform_archive_event(&raw).map(Ok)),
        );

        let live_stream = BroadcastStream::new(rx).filter_map(|msg_res| async move {
            let raw = msg_res.ok()?;
            transform_archive_event(&raw).map(Ok)
        });

        past_stream.chain(live_stream).boxed()
    }

    pub async fn get_changes_on_container_file_system(
        &self,
        id: &str,
    ) -> Result<Value, Box<dyn Error>> {
        utils::call_end_points(
            &self.app_config.client,
            DockerEndpoints::GET_CHANGES_ON_CONTAINER_FILE_SYSYTEM,
            Some(id),
        )
        .await
    }

    pub async fn export_a_container(&self, id: &str) -> Result<Value, Box<dyn Error>> {
        utils::call_end_points(
            &self.app_config.client,
            DockerEndpoints::EXPORT_A_CONTAINER,
            Some(id),
        )
        .await
    }

    // Stream container resource usage
    pub async fn stream_container_resource_usage(&self, id: &str) -> FutureImpl {
        // format the docker api endpoints
        let endpoint = DockerEndpoints::GET_CONTAINERS_RESOURSE_USAGE_STATS.replace("{id}", id);
        let url = format!("http://{}/{}{}", *HOST, *DOCKER_API_VERSION, endpoint);
        let topic = format!("containers:stats:{id}");
        let (rx, _) = self.app_config.event_bus.subscribe_or_spawn(
            &topic,
            self.app_config.client.clone(),
            self.app_config.shutdown.clone(),
            url,
        );

        BroadcastStream::new(rx)
            .filter_map(|msg| async move { msg.ok().map(|s| Ok(Event::default().data(s))) })
            .boxed()
    }
}
