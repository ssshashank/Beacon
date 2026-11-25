use crate::global::config;
use axum::Router;
use tokio_util::sync::CancellationToken;

const BANNER: &str = r#"
  ____  _____    _    ____ ___  _   _ 
 | __ )| ____|  / \  / ___/ _ \| \ | |
 |  _ \|  _|   / _ \| |  | | | |  \| |
 | |_) | |___ / ___ \ |__| |_| | |\  |
 |____/|_____/_/   \_\____\___/|_| \_|

  Lightweight Docker Observability Platform
  v0.1.0 • Single Container Architecture
"#;

// Binds and starts the HTTP server
pub async fn run(app: Router, shutdown: CancellationToken) {
    let addr = format!("{}:{}", *config::HOST, *config::PORT);

    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .unwrap_or_else(|_| panic!("Failed to bind {addr}"));

    println!("{BANNER}");
    let now = chrono::Utc::now().to_rfc3339();
    println!("{now} [INFO ] [beacon::core] Initialized in single-container mode");
    println!("{now} [INFO ] [beacon::docker] Connected to Docker socket at /var/run/docker.sock");
    println!("{now} [INFO ] [beacon::http] Server running on http://{addr}");
    println!(
        "{now} [INFO ] [beacon::web] Dashboard available at http://localhost:{}",
        *config::PORT
    );
    println!("{now} [INFO ] [beacon::stream] Live SSE event bus and telemetry channels ready");

    axum::serve(listener, app)
        .with_graceful_shutdown(async move {
            let _ = tokio::signal::ctrl_c().await;
            let now = chrono::Utc::now().to_rfc3339();
            println!("{now} [INFO ] [beacon::core] Shutting down gracefully...");
            shutdown.cancel();
        })
        .await
        .unwrap();
}
