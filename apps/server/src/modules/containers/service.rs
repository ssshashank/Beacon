use crate::{
    global::{
        config::{DOCKER_API_VERSION, HOST},
        docker::DockerEndpoints,
        utils,
    },
    modules::containers::{
        dto::{Container, Process},
        mapper::{inspect_container_mapper, list_container_mapper},
    },
};
use axum::response::sse::Event;
use futures_util::{StreamExt, stream::BoxStream};
use serde_json::{Value, json};
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

    // Get all containers service
    pub async fn get_all_containers(&self) -> Result<Vec<Container>, Box<dyn std::error::Error>> {
        // format the docker api endpoints
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

        let res = self.client.get(url).send().await?;
        let json: Value = res.json().await?;
        let _ = json
            .as_object()
            .ok_or_else(|| "Expected docker response must be in an object")?;

        // map the container data
        let mapped_response = inspect_container_mapper(&json);
        let container: Container = Container::from_json(&mapped_response);
        Ok(container)
    }

    pub async fn list_containers_process(&self, id: &str) -> Result<Vec<Process>, Box<dyn Error>> {
        // format the docker api endpoints
        let endpoint = DockerEndpoints::LIST_PROCESS_RUNNING_IN_A_CONTAINER.replace("{id}", id);
        let url = format!("http://{}/{}{}", *HOST, *DOCKER_API_VERSION, endpoint);

        let res = self.client.get(url).send().await?;
        let json: Value = res.json().await?;
        let json_as_array = json["Processes"]
            .as_array()
            .ok_or_else(|| "Expected docker response must be an array")?;

        let process_list: Vec<Process> = json_as_array
            .iter()
            .filter_map(|item| {
                let arr = item.as_array()?;
                if let [uid, pid, ppid, c, stime, tty, time, cmd] = arr.as_slice() {
                    let mapped_value = json!({
                        "uid": uid.as_str().unwrap_or(""),
                        "pid": pid.as_str().unwrap_or(""),
                        "ppid": ppid.as_str().unwrap_or(""),
                        "cpu": c.as_str().unwrap_or(""),
                        "start_time": stime.as_str().unwrap_or(""),
                        "tty": tty.as_str().unwrap_or(""),
                        "time": time.as_str().unwrap_or(""),
                        "command": cmd.as_str().unwrap_or("")
                    });

                    Some(Process::from_json(&mapped_value))
                } else {
                    None
                }
            })
            .collect();

        Ok(process_list)
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
