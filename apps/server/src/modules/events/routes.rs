use crate::modules::events::{constant::EventRoutesName, controller::EventController};
use axum::{
    Router,
    extract::State,
    response::{Sse, sse::Event},
    routing::get,
};
use std::{convert::Infallible, sync::Arc};

pub fn routes(controller: Arc<EventController>) -> Router {
    Router::new()
        .route(EventRoutesName::STREAM_EVENTS, get(stream_events))
        .with_state(controller)
}

async fn stream_events(
    State(controller): State<Arc<EventController>>,
) -> Sse<impl futures_util::Stream<Item = Result<Event, Infallible>>> {
    controller.stream_events().await
}
