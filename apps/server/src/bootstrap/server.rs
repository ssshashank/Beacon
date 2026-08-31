use crate::global::config;
use axum::Router;

// Binds and starts the HTTP server
pub async fn run(app: Router) {
    let addr = format!("{}:{}", *config::HOST, *config::PORT);

    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .unwrap_or_else(|_| panic!("Failed to bind {addr}"));

    axum::serve(listener, app).await.unwrap();
}
