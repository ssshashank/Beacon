use crate::{
    global::{
        config::{DOCKER_API_VERSION, HOST},
        docker::DockerEndpoints,
        utils,
    },
    modules::containers::dto::Container,
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

    pub async fn get_all_containers(&self) -> Result<Vec<Container>, Box<dyn std::error::Error>> {
        let url = format!(
            "http://{}/{}{}",
            *HOST,
            *DOCKER_API_VERSION,
            DockerEndpoints::LIST_CONTAINERS
        );

        let res = self.client.get(url).send().await?;
        let json: Value = res.json().await?;

        // check if json is array
        let json_as_array = json
            .as_array()
            .ok_or_else(|| "Expected Docker response to be an array")?;

        // deserialize into container vector
        let containers: Vec<Container> = json_as_array
            .iter()
            .map(|item| Container::from_json(item))
            .collect();

        // serialize the json array
        Ok(containers)
    }

    pub async fn inspect_container(&self, id: &str) -> Result<Container, Box<dyn Error>> {
        let endpoint = DockerEndpoints::INSPECT_A_CONTAINER.replace("{id}", id);
        let url = format!("http://{}/{}{}", *HOST, *DOCKER_API_VERSION, endpoint);

        let res = self.client.get(url).send().await?;
        let json: Value = res.json().await?;
        let _ = json
            .as_object()
            .ok_or_else(|| "Expected docker response must be in an object")?;

        let container: Container = Container::from_json(&json);
        Ok(container)
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
            *HOST, *DOCKER_API_VERSION, id
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

    pub async fn stream_container_resource_usage(&self, id: &str) -> FutureImpl {
        let url = format!(
            "http://{}/{}/containers/{}/stats",
            *HOST, *DOCKER_API_VERSION, id
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
