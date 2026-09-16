use crate::bootstrap::{modules, routes};
use crate::client::docker;
use axum::Router;
use axum::http::{HeaderValue, Method, header};
use tower_http::cors::CorsLayer;

// Wires config + modules + routes together
pub fn build_app() -> Router {
    let docker_client = docker::build_docker_client();
    let modules = modules::init_modules(docker_client);

    let cors = CorsLayer::new()
        .allow_origin("http://100.65.87.119:3000".parse::<HeaderValue>().unwrap())
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE, Method::PATCH])
        .allow_headers([header::CONTENT_TYPE, header::AUTHORIZATION])
        .allow_credentials(true);

    routes::build_routes(&modules).layer(cors)
}
