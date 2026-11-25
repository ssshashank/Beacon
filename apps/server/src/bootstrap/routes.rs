use crate::bootstrap::modules::Modules;
use crate::global::config::WEB_DIR;
use crate::modules::{containers, events, exec, images, networks, system, volumes};
use axum::Router;
use std::path::Path;
use tower_http::services::{ServeDir, ServeFile};

const API_V1: &str = "/api/v1";

// Merges every module's router into the app's final router, grouped under /api/v1
// and serves static frontend assets with SPA fallback when WEB_DIR exists
pub fn build_routes(modules: &Modules) -> Router {
    let v1 = Router::new()
        .nest(
            "/containers",
            containers::routes::routes(modules.containers.clone()),
        )
        .nest("/events", events::routes::routes(modules.events.clone()))
        .nest("/images", images::routes::routes(modules.images.clone()))
        .nest("/exec", exec::routes::routes(modules.exec.clone()))
        .nest("/volumes", volumes::routes::routes(modules.volumes.clone()))
        .nest("/system", system::routes::routes(modules.system.clone()))
        .nest(
            "/networks",
            networks::routes::routes(modules.networks.clone()),
        );

    let router = Router::new().nest(API_V1, v1);

    let web_path = Path::new(WEB_DIR.as_str());
    if web_path.exists() {
        let index_file = web_path.join("index.html");
        let serve_dir = ServeDir::new(web_path).not_found_service(ServeFile::new(index_file));
        router.fallback_service(serve_dir)
    } else {
        router
    }
}
