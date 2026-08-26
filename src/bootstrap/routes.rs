use crate::bootstrap::modules::Modules;
use crate::modules::containers;
use axum::Router;

const API_V1: &str = "/api/v1";

// Merges every module's router into the app's final router, grouped under /api/v1
pub fn build_routes(modules: &Modules) -> Router {
    let v1 = Router::new().nest("/containers", containers::routes::routes(modules.containers.clone()));

    Router::new().nest(API_V1, v1)
}
