use crate::global::config;
use reqwest::Client;
use std::path::Path;

// Build and return a docker client
pub fn build_docker_client() -> Client {
    let client = Client::builder()
        .unix_socket(Path::new(config::SOCKET_PATH))
        .build()
        .expect("Failed to build Docker client");

    return client;
}
