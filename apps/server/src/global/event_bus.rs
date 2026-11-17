use axum::response::sse::Event;
use futures_util::StreamExt;
use papaya::HashMap;
use reqwest::Client;
use serde_json::json;
use std::collections::VecDeque;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tokio::sync::broadcast;
use tokio_util::sync::CancellationToken;

const CHANNEL_CAPACITY: usize = 1000;
const BUFFER_CAPACITY: usize = 100;

#[derive(Clone)]
pub struct TopicChannel {
    pub tx: broadcast::Sender<Event>,
    pub buffer: Arc<Mutex<VecDeque<String>>>,
}

impl TopicChannel {
    pub fn new() -> Self {
        let (tx, _) = broadcast::channel(CHANNEL_CAPACITY);
        Self {
            tx,
            buffer: Arc::new(Mutex::new(VecDeque::with_capacity(BUFFER_CAPACITY))),
        }
    }
}

impl Default for TopicChannel {
    fn default() -> Self {
        Self::new()
    }
}

// Event bus of broadcast channels with replay buffer support

#[derive(Clone)]
pub struct EventBus {
    channels: Arc<HashMap<String, TopicChannel>>,
}

impl EventBus {
    pub fn new() -> Self {
        Self {
            channels: Arc::new(HashMap::new()),
        }
    }

    // Subscribes to the channel for `topic`, returning (live_receiver, past_messages)
    pub fn subscribe_or_spawn(
        &self,
        topic: &str,
        client: Client,
        shutdown: CancellationToken,
        url: String,
    ) -> (broadcast::Receiver<Event>, Vec<String>) {
        let pinned = self.channels.pin();

        if let Some(channel) = pinned.get(topic) {
            let past_messages = {
                let buf = channel.buffer.lock().unwrap();
                buf.iter().cloned().collect::<Vec<_>>()
            };
            return (channel.tx.subscribe(), past_messages);
        }

        let channel = TopicChannel::new();
        match pinned.try_insert(topic.to_string(), channel) {
            Ok(channel_ref) => {
                let channels = self.channels.clone();
                let topic_str = topic.to_string();
                spawn_listener(
                    client,
                    channel_ref.tx.clone(),
                    channel_ref.buffer.clone(),
                    shutdown,
                    url,
                    Some(Box::new(move || {
                        channels.pin().remove(&topic_str);
                    })),
                );
                (channel_ref.tx.subscribe(), Vec::new())
            }
            Err(err) => {
                let past_messages = {
                    let buf = err.current.buffer.lock().unwrap();
                    buf.iter().cloned().collect::<Vec<_>>()
                };
                (err.current.tx.subscribe(), past_messages)
            }
        }
    }
}

impl Default for EventBus {
    fn default() -> Self {
        Self::new()
    }
}

// Single long-lived task that owns one Docker connection and fans every event
pub fn spawn_listener(
    client: Client,
    tx: broadcast::Sender<Event>,
    buffer: Arc<Mutex<VecDeque<String>>>,
    shutdown: CancellationToken,
    url: String,
    on_exit: Option<Box<dyn FnOnce() + Send + 'static>>,
) {
    tokio::spawn(async move {
        let is_logs = url.contains("/logs");
        loop {
            tokio::select! {
                _ = shutdown.cancelled() => break,
                _ = poll_once(&client, &tx, &buffer, &url) => {
                    // For container logs: once a follow stream terminates (container stopped/exited),
                    // break out instead of repeatedly re-fetching tail=100 in an infinite loop!
                    if is_logs {
                        break;
                    }
                }
            }
        }
        if let Some(cleanup) = on_exit {
            cleanup();
        }
    });
}

async fn poll_once(
    client: &Client,
    tx: &broadcast::Sender<Event>,
    buffer: &Arc<Mutex<VecDeque<String>>>,
    url: &str,
) {
    if let Ok(response) = client.get(url).send().await {
        let mut stream = response.bytes_stream();
        let is_logs = url.contains("/logs");

        while let Some(chunk) = stream.next().await {
            let Ok(bytes) = chunk else { break };
            if bytes.is_empty() {
                continue;
            }

            if is_logs {
                let frames = parse_docker_log_frames(&bytes);
                for (stream_type, message) in frames {
                    let data = json!({
                        "stream": stream_type,
                        "message": message
                    })
                    .to_string();

                    // Buffer the log line into recent history for new/revisiting subscribers
                    if let Ok(mut buf) = buffer.lock() {
                        if buf.len() >= BUFFER_CAPACITY {
                            buf.pop_front();
                        }
                        buf.push_back(data.clone());
                    }

                    let _ = tx.send(Event::default().data(data));
                }
            } else {
                let s = String::from_utf8_lossy(&bytes);
                for line in s.lines() {
                    let trimmed = line.trim();
                    if !trimmed.is_empty() {
                        let _ = tx.send(Event::default().data(trimmed));
                    }
                }
            }
        }
    }

    tokio::time::sleep(Duration::from_secs(1)).await;
}

// Parses Docker multiplexed 8-byte frames:
// Byte 0: 1 = stdout, 2 = stderr, 0 = stdin
// Bytes 1..4: unused/zeros
// Bytes 4..8: big-endian frame size
// Bytes 8..: log message payload
fn parse_docker_log_frames(bytes: &[u8]) -> Vec<(String, String)> {
    let mut frames = Vec::new();
    let mut offset = 0;

    while offset + 8 <= bytes.len() {
        let stream_byte = bytes[offset];
        if (stream_byte <= 2)
            && bytes[offset + 1] == 0
            && bytes[offset + 2] == 0
            && bytes[offset + 3] == 0
        {
            let stream_type = match stream_byte {
                1 => "stdout",
                2 => "stderr",
                _ => "stdin",
            };
            let payload_size = u32::from_be_bytes([
                bytes[offset + 4],
                bytes[offset + 5],
                bytes[offset + 6],
                bytes[offset + 7],
            ]) as usize;

            let start = offset + 8;
            let end = (start + payload_size).min(bytes.len());
            let message = String::from_utf8_lossy(&bytes[start..end]);

            for line in message.lines() {
                let trimmed = line.trim_end_matches('\r');
                if !trimmed.is_empty() {
                    frames.push((stream_type.to_string(), trimmed.to_string()));
                }
            }

            offset = start + payload_size;
        } else {
            let message = String::from_utf8_lossy(&bytes[offset..]);
            for line in message.lines() {
                let trimmed = line.trim_end_matches('\r');
                if !trimmed.is_empty() {
                    frames.push(("stdout".to_string(), trimmed.to_string()));
                }
            }
            break;
        }
    }

    if frames.is_empty() && !bytes.is_empty() {
        let message = String::from_utf8_lossy(bytes);
        for line in message.lines() {
            let trimmed = line.trim_end_matches('\r');
            if !trimmed.is_empty() {
                frames.push(("stdout".to_string(), trimmed.to_string()));
            }
        }
    }

    frames
}
