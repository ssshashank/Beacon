use crate::global::config;
use axum::Router;
use tokio_util::sync::CancellationToken;

// Binds and starts the HTTP server
pub async fn run(app: Router, shutdown: CancellationToken) {
    let addr = format!("{}:{}", *config::HOST, *config::PORT);

    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .unwrap_or_else(|_| panic!("Failed to bind {addr}"));

    axum::serve(listener, app)
        .with_graceful_shutdown(async move {
            let _ = tokio::signal::ctrl_c().await;
            shutdown.cancel();
        })
        .await
        .unwrap();
}
