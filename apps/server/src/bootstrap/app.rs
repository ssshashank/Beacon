use crate::bootstrap::{modules, routes};
use crate::client::docker;
use axum::Router;

// Wires config + modules + routes together
pub fn build_app() -> Router {
    let docker_client = docker::build_docker_client();
    let modules = modules::init_modules(docker_client);

    routes::build_routes(&modules)
}
