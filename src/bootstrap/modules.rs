use crate::modules::containers::{controller::ContainerController, service::ContainerService};
use reqwest::Client;
use std::sync::Arc;

// Holds every feature module once it's wired up
pub struct Modules {
    pub containers: Arc<ContainerController>,
}

pub fn init_modules(docker_client: Client) -> Modules {
    let container_service = ContainerService::new(docker_client);
    let container_controller = Arc::new(ContainerController::new(container_service));

    Modules {
        containers: container_controller,
    }
}
