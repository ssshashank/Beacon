use crate::modules::events::services::EventService;
use axum::response::{Sse, sse::Event};
use std::convert::Infallible;

pub struct EventController {
    service: EventService,
}

impl EventController {
    pub fn new(event_service: EventService) -> Self {
        Self {
            service: event_service,
        }
    }

    pub async fn stream_events(
        &self,
    ) -> Sse<impl futures_util::Stream<Item = Result<Event, Infallible>> + use<>> {
        Sse::new(self.service.stream_events().await)
    }
}
