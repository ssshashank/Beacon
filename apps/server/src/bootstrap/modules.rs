use crate::{
    config::app::AppConfig,
    modules::{
        containers::{controller::ContainerController, service::ContainerService},
        events::{controller::EventController, services::EventService},
        exec::{controller::ExecController, services::ExecService},
        images::{controller::ImageController, services::ImageService},
    },
};
use std::sync::Arc;

// Holds every feature module once it's wired up
pub struct Modules {
    pub containers: Arc<ContainerController>,
    pub events: Arc<EventController>,
    pub images: Arc<ImageController>,
    pub exec: Arc<ExecController>,
}

pub fn init_modules(app_config: AppConfig) -> Modules {
    let container_service = ContainerService::new(app_config.clone());
    let container_controller = Arc::new(ContainerController::new(container_service));
    let event_service = EventService::new(app_config.clone());
    let event_controller = Arc::new(EventController::new(event_service));
    let image_service = ImageService::new(app_config.clone());
    let image_controller = Arc::new(ImageController::new(image_service));
    let exec_service = ExecService::new(app_config.clone());
    let exec_controller = Arc::new(ExecController::new(exec_service));

    Modules {
        containers: container_controller,
        events: event_controller,
        images: image_controller,
        exec: exec_controller,
    }
}
