use crate::bootstrap::{modules, routes};
use crate::client::docker;
use crate::config::app::AppConfig;
use crate::global::config::CORS_ORIGIN_ALLOWED_ENDPOINT;
use crate::global::event_bus::EventBus;
use axum::Router;
use axum::http::{HeaderValue, Method, header};
use tokio::sync::broadcast;
use tokio_util::sync::CancellationToken;
use tower_http::cors::CorsLayer;

// Wires config + modules + routes together
pub fn build_app() -> (Router, CancellationToken) {
    let (tx, _) = broadcast::channel(1000);
    let shutdown = CancellationToken::new();

    let app = AppConfig {
        client: docker::build_docker_client(),
        event_tx: tx,
        shutdown: shutdown.clone(),
        event_bus: EventBus::new(),
    };

    let modules = modules::init_modules(app);

    let cors = CorsLayer::new()
        .allow_origin(CORS_ORIGIN_ALLOWED_ENDPOINT.parse::<HeaderValue>().unwrap())
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::DELETE,
            Method::PATCH,
        ])
        .allow_headers([header::CONTENT_TYPE, header::AUTHORIZATION])
        .allow_credentials(true);

    (routes::build_routes(&modules).layer(cors), shutdown)
}
