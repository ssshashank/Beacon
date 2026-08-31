use std::{env, sync::LazyLock};

pub static PORT: LazyLock<String> =
    LazyLock::new(|| env::var("PORT").unwrap_or_else(|_| "5000".to_string()));

pub static HOST: LazyLock<String> =
    LazyLock::new(|| env::var("HOST").unwrap_or_else(|_| "localhost".to_string()));

pub static APP_VERSION: &str = "v1.51";
pub static SOCKET_PATH: &str = "/var/run/docker.sock";
