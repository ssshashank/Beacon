use crate::bootstrap::{modules, routes};
use crate::client::docker;
use crate::config::app::AppConfig;
use crate::global::config::CORS_ORIGIN_ALLOWED_ENDPOINT;
use crate::global::event_bus::EventBus;
use axum::Router;
use axum::http::{HeaderValue, Method, header};
use tokio::sync::broadcast;
use tokio_util::sync::CancellationToken;
use tower_http::cors::{AllowOrigin, CorsLayer};

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

    let origin = CORS_ORIGIN_ALLOWED_ENDPOINT.trim();
    let allow_origin = if origin == "*" || origin.is_empty() {
        AllowOrigin::mirror_request()
    } else {
        match origin.parse::<HeaderValue>() {
            Ok(val) => AllowOrigin::exact(val),
            Err(_) => AllowOrigin::mirror_request(),
        }
    };

    let cors = CorsLayer::new()
        .allow_origin(allow_origin)
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::DELETE,
            Method::PATCH,
        ])
        .allow_headers([header::CONTENT_TYPE, header::AUTHORIZATION])
        .allow_credentials(true);

    let app_router = routes::build_routes(&modules)
        .layer(cors)
        .layer(axum::middleware::from_fn(log_requests));

    (app_router, shutdown)
}

async fn log_requests(
    req: axum::extract::Request,
    next: axum::middleware::Next,
) -> axum::response::Response {
    let method = req.method().clone();
    let path = req.uri().path().to_string();
    let start = std::time::Instant::now();
    let res = next.run(req).await;
    let elapsed = start.elapsed();
    let status = res.status().as_u16();

    if path.starts_with("/api/") {
        let now = chrono::Utc::now().to_rfc3339();
        println!("{now} [INFO ] [beacon::api] {method} {path} -> {status} ({elapsed:?})");
    }

    res
}
