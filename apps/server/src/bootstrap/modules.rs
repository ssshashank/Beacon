use crate::modules::{
    containers::{controller::ContainerController, service::ContainerService},
    events::{controller::EventController, services::EventService},
};
use reqwest::Client;
use std::sync::Arc;

// Holds every feature module once it's wired up
pub struct Modules {
    pub containers: Arc<ContainerController>,
    pub events: Arc<EventController>,
}

pub fn init_modules(docker_client: Client) -> Modules {
    let container_service = ContainerService::new(docker_client.clone());
    let container_controller = Arc::new(ContainerController::new(container_service));
    let event_service = EventService::new(docker_client);
    let event_controller = Arc::new(EventController::new(event_service));

    Modules {
        containers: container_controller,
        events: event_controller,
    }
}
