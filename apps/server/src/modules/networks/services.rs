use crate::{
    config::app::AppConfig,
    global::{
        config::{DOCKER_API_VERSION, HOST},
        docker::DockerEndpoints,
    },
    modules::networks::dto::Network,
};
use serde_json::Value;
use std::error::Error;

pub struct NetworkService {
    app_config: AppConfig,
}

impl NetworkService {
    pub fn new(app_config: AppConfig) -> Self {
        Self { app_config }
    }

    pub async fn get_all_networks(&self) -> Result<Vec<Network>, Box<dyn Error>> {
        let url = format!(
            "http://{}/{}{}",
            *HOST,
            *DOCKER_API_VERSION,
            DockerEndpoints::LIST_NETWORKS
        );
        let res = self.app_config.client.get(url).send().await?;
        let json: Value = res.json().await?;

        let networks_array = json
            .as_array()
            .ok_or_else(|| "Expected Docker response to be an array of networks")?;

        // Docker's GET /networks omits connected Containers for performance.
        // We inspect networks in parallel so each Network model has its real Containers map and count.
        let mut tasks = Vec::new();
        for item in networks_array {
            let client = self.app_config.client.clone();
            let net_id = item
                .get("Id")
                .and_then(Value::as_str)
                .unwrap_or("")
                .to_string();
            let fallback_item = item.clone();

            tasks.push(tokio::spawn(async move {
                if !net_id.is_empty() {
                    let endpoint = DockerEndpoints::INSPECT_A_NETWORK.replace("{id}", &net_id);
                    let url = format!("http://{}/{}{}", *HOST, *DOCKER_API_VERSION, endpoint);
                    if let Ok(inspect_res) = client.get(url).send().await {
                        if inspect_res.status().is_success() {
                            if let Ok(inspect_json) = inspect_res.json::<Value>().await {
                                return Network::from_json(&inspect_json);
                            }
                        }
                    }
                }
                Network::from_json(&fallback_item)
            }));
        }

        let mut networks = Vec::new();
        for task in tasks {
            if let Ok(net) = task.await {
                networks.push(net);
            }
        }

        Ok(networks)
    }

    pub async fn inspect_network(&self, id: &str) -> Result<Value, Box<dyn Error>> {
        let endpoint = DockerEndpoints::INSPECT_A_NETWORK.replace("{id}", id);
        let url = format!("http://{}/{}{}", *HOST, *DOCKER_API_VERSION, endpoint);
        let res = self.app_config.client.get(url).send().await?;
        let json: Value = res.json().await?;
        Ok(json)
    }

    pub async fn delete_network(&self, id: &str) -> Result<(), Box<dyn Error>> {
        let endpoint = DockerEndpoints::DELETE_A_NETWORK.replace("{id}", id);
        let url = format!("http://{}/{}{}", *HOST, *DOCKER_API_VERSION, endpoint);
        let res = self.app_config.client.delete(url).send().await?;
        if !res.status().is_success() {
            let err_text = res.text().await.unwrap_or_default();
            return Err(format!("Docker delete network failed: {err_text}").into());
        }
        Ok(())
    }
}
