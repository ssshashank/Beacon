use std::{env, sync::LazyLock};

pub static DOCKER_API_VERSION: LazyLock<String> =
    LazyLock::new(|| env::var("DOCKER_API_VERSION").unwrap_or_else(|_| "v1.51".to_string()));

pub static PORT: LazyLock<String> =
    LazyLock::new(|| env::var("PORT").unwrap_or_else(|_| "5000".to_string()));

pub static HOST: LazyLock<String> =
    LazyLock::new(|| env::var("HOST").unwrap_or_else(|_| "localhost".to_string()));

pub static UNIX_SOCKET_PATH: LazyLock<String> =
    LazyLock::new(|| env::var("UNIX_SOCKET_PATH").unwrap_or_else(|_| "".to_string()));

pub static CORS_ORIGIN_ALLOWED_ENDPOINT: LazyLock<String> =
    LazyLock::new(|| env::var("CORS_ORIGIN_ALLOWED_ENDPOINT").unwrap_or_else(|_| "".to_string()));
