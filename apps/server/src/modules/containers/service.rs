use crate::global::{
    config::{self, HOST},
    docker::DockerEndpoints,
    utils,
};
use axum::response::sse::Event;
use futures_util::{StreamExt, stream::BoxStream};
use serde_json::Value;
use std::convert::Infallible;
use std::error::Error;

pub struct ContainerService {
    client: reqwest::Client,
}
type FutureImpl = BoxStream<'static, Result<Event, Infallible>>;

impl ContainerService {
    pub fn new(client: reqwest::Client) -> Self {
        Self { client }
    }

    pub async fn get_all_containers(&self) -> Result<Value, Box<dyn Error>> {
        utils::call_end_points(&self.client, DockerEndpoints::LIST_CONTAINERS, None).await
    }

    pub async fn inspect_container(&self, id: &str) -> Result<Value, Box<dyn Error>> {
        utils::call_end_points(&self.client, DockerEndpoints::INSPECT_A_CONTAINER, Some(id)).await
    }

    pub async fn list_containers_process(&self, id: &str) -> Result<Value, Box<dyn Error>> {
        utils::call_end_points(
            &self.client,
            DockerEndpoints::LIST_PROCESS_RUNNING_IN_A_CONTAINER,
            Some(id),
        )
        .await
    }

    pub async fn stream_container_logs(&self, id: &str) -> FutureImpl {
        let url = format!(
            "http://{}/{}/containers/{}/logs?stdout=1&stderr=1&timestamp=1&follow=1",
            *HOST,
            config::APP_VERSION,
            id
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

    pub async fn get_changes_on_container_file_system(
        &self,
        id: &str,
    ) -> Result<Value, Box<dyn Error>> {
        utils::call_end_points(
            &self.client,
            DockerEndpoints::GET_CHANGES_ON_CONTAINER_FILE_SYSYTEM,
            Some(id),
        )
        .await
    }

    pub async fn export_a_container(&self, id: &str) -> Result<Value, Box<dyn Error>> {
        utils::call_end_points(&self.client, DockerEndpoints::EXPORT_A_CONTAINER, Some(id)).await
    }

    pub async fn get_containers_resource_usage(&self, id: &str) -> Result<Value, Box<dyn Error>> {
        utils::call_end_points(
            &self.client,
            DockerEndpoints::GET_CONTAINERS_RESOURSE_USAGE_STATS,
            Some(id),
        )
        .await
    }
}
