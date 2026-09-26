use reqwest::Client;
use std::path::Path;

use crate::global::config::UNIX_SOCKET_PATH;

// Build and return a docker client
pub fn build_docker_client() -> Client {
    let client = Client::builder()
        .unix_socket(Path::new(UNIX_SOCKET_PATH.as_str()))
        .build()
        .expect("Failed to build Docker client");

    return client;
}
