use axum::response::sse::Event;
use futures_util::StreamExt;
use papaya::HashMap;
use reqwest::Client;
use std::time::Duration;
use tokio::sync::broadcast;
use tokio_util::sync::CancellationToken;

const CHANNEL_CAPACITY: usize = 1000;

// SSE registry of broadcast channels
pub struct SseRegistry {
    channels: HashMap<String, broadcast::Sender<Event>>,
}

impl SseRegistry {
    pub fn new() -> Self {
        Self {
            channels: HashMap::new(),
        }
    }

    // Subscribes to the channel for `key`, spawning its listener on first
    pub fn subscribe_or_spawn(
        &self,
        key: &str,
        client: Client,
        shutdown: CancellationToken,
        url: String,
    ) -> broadcast::Receiver<Event> {
        let pinned = self.channels.pin();

        if let Some(tx) = pinned.get(key) {
            return tx.subscribe();
        }

        let (tx, _rx) = broadcast::channel(CHANNEL_CAPACITY);
        match pinned.try_insert(key.to_string(), tx) {
            Ok(tx_ref) => {
                spawn_listener(client, tx_ref.clone(), shutdown, url);
                tx_ref.subscribe()
            }
            Err(err) => err.current.subscribe(),
        }
    }
}

impl Default for SseRegistry {
    fn default() -> Self {
        Self::new()
    }
}

// Single long-lived task that owns one Docker connection and fans every event
pub fn spawn_listener(
    client: Client,
    tx: broadcast::Sender<Event>,
    shutdown: CancellationToken,
    url: String,
) {
    tokio::spawn(async move {
        loop {
            tokio::select! {
                _ = shutdown.cancelled() => break,
                _ = poll_once(&client, &tx, &url) => {}
            }
        }
    });
}

async fn poll_once(client: &Client, tx: &broadcast::Sender<Event>, url: &str) {
    if tx.receiver_count() == 0 {
        tokio::time::sleep(Duration::from_secs(1)).await;
        return;
    }

    if let Ok(response) = client.get(url).send().await {
        let mut stream = response.bytes_stream();
        while let Some(chunk) = stream.next().await {
            let Ok(bytes) = chunk else { break };
            let data = String::from_utf8_lossy(&bytes).to_string();
            let _ = tx.send(Event::default().data(data));
        }
    }

    tokio::time::sleep(Duration::from_secs(1)).await;
}
