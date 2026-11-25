use std::{env, sync::LazyLock};

fn get_env(beacon_key: &str, legacy_key: &str, default: &str) -> String {
    env::var(beacon_key)
        .or_else(|_| env::var(legacy_key))
        .unwrap_or_else(|_| default.to_string())
}

pub static DOCKER_API_VERSION: LazyLock<String> =
    LazyLock::new(|| get_env("BEACON_DOCKER_API_VERSION", "DOCKER_API_VERSION", "v1.51"));

pub static PORT: LazyLock<String> =
    LazyLock::new(|| get_env("BEACON_PORT", "PORT", "8000"));

pub static HOST: LazyLock<String> =
    LazyLock::new(|| get_env("BEACON_HOST", "HOST", "0.0.0.0"));

pub static UNIX_SOCKET_PATH: LazyLock<String> =
    LazyLock::new(|| get_env("BEACON_DOCKER_SOCKET", "UNIX_SOCKET_PATH", "/var/run/docker.sock"));

pub static CORS_ORIGIN_ALLOWED_ENDPOINT: LazyLock<String> =
    LazyLock::new(|| get_env("BEACON_CORS_ORIGIN", "CORS_ORIGIN_ALLOWED_ENDPOINT", ""));

pub static WEB_DIR: LazyLock<String> =
    LazyLock::new(|| get_env("BEACON_WEB_DIR", "WEB_DIR", "apps/web/dist/client"));
