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
    pub tx: broadcast::Sender<String>,
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
    ) -> (broadcast::Receiver<String>, Vec<String>) {
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
                    None,
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

    // Subscribes or spawns a POST stream (e.g. for Docker exec start)
    pub fn subscribe_or_spawn_post(
        &self,
        topic: &str,
        client: Client,
        shutdown: CancellationToken,
        url: String,
        payload: serde_json::Value,
    ) -> (broadcast::Receiver<String>, Vec<String>) {
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
                    Some(payload),
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

fn decode_percent(s: &str) -> String {
    let mut result = String::with_capacity(s.len());
    let mut chars = s.chars().peekable();
    while let Some(c) = chars.next() {
        if c == '%' {
            let h1 = chars.next();
            let h2 = chars.next();
            if let (Some(c1), Some(c2)) = (h1, h2) {
                if let Ok(byte) = u8::from_str_radix(&format!("{}{}", c1, c2), 16) {
                    result.push(byte as char);
                    continue;
                }
            }
        }
        result.push(c);
    }
    result
}

// Single long-lived task that owns one Docker connection and fans every event
pub fn spawn_listener(
    client: Client,
    tx: broadcast::Sender<String>,
    buffer: Arc<Mutex<VecDeque<String>>>,
    shutdown: CancellationToken,
    url: String,
    payload: Option<serde_json::Value>,
    on_exit: Option<Box<dyn FnOnce() + Send + 'static>>,
) {
    tokio::spawn(async move {
        let is_logs = url.contains("/logs");
        let is_exec = url.contains("/exec/") && url.contains("/start");
        let is_archive = url.contains("/archive");
        let is_oneshot = is_logs || is_exec || is_archive;

        loop {
            tokio::select! {
                _ = shutdown.cancelled() => break,
                _ = poll_once(&client, &tx, &buffer, &url, payload.as_ref()) => {
                    // For container logs, exec, and archive: once stream terminates,
                    // break out instead of repeatedly re-fetching in an infinite loop!
                    if is_oneshot {
                        break;
                    }
                }
            }
        }
        if is_exec || is_archive {
            let _ = tx.send(json!({"event": "end", "status": "completed"}).to_string());
        }
        if let Some(cleanup) = on_exit {
            cleanup();
        }
    });
}

async fn poll_once(
    client: &Client,
    tx: &broadcast::Sender<String>,
    buffer: &Arc<Mutex<VecDeque<String>>>,
    url: &str,
    payload: Option<&serde_json::Value>,
) {
    let req = if let Some(body) = payload {
        client.post(url).json(body)
    } else {
        client.get(url)
    };

    if let Ok(response) = req.send().await {
        let mut stream = response.bytes_stream();
        let is_archive = url.contains("/archive");
        let is_multiplexed =
            url.contains("/logs") || (url.contains("/exec/") && url.contains("/start"));

        let mut tar_buffer = Vec::new();
        let mut tar_seen = std::collections::HashSet::new();
        let target_dir = if is_archive {
            let raw_path = url
                .split("path=")
                .nth(1)
                .unwrap_or("")
                .split('&')
                .next()
                .unwrap_or("");
            let decoded = decode_percent(raw_path);
            decoded.trim_matches('/').to_string()
        } else {
            String::new()
        };

        while let Some(chunk) = stream.next().await {
            let Ok(bytes) = chunk else { break };
            if bytes.is_empty() {
                continue;
            }

            if is_archive {
                tar_buffer.extend_from_slice(&bytes);
                while tar_buffer.len() >= 512 {
                    if tar_buffer[..512].iter().all(|&b| b == 0) {
                        tar_buffer.drain(..512);
                        continue;
                    }

                    let (raw_name, kind, size, mtime) = parse_tar_header_block(&tar_buffer[..512]);
                    let content_bytes = ((size + 511) / 512) * 512;
                    let total_entry_bytes = 512 + content_bytes as usize;

                    if tar_buffer.len() < total_entry_bytes {
                        break;
                    }

                    let clean_name = raw_name
                        .trim_matches('/')
                        .trim_start_matches("./")
                        .to_string();

                    if !clean_name.is_empty()
                        && clean_name != target_dir
                        && clean_name != "."
                        && clean_name != ".."
                    {
                        let rel_path = if target_dir.is_empty() {
                            clean_name.as_str()
                        } else if clean_name.starts_with(&target_dir) {
                            let rest = &clean_name[target_dir.len()..];
                            if rest.is_empty() {
                                ""
                            } else if rest.starts_with('/') {
                                rest.trim_start_matches('/')
                            } else {
                                ""
                            }
                        } else {
                            ""
                        };

                        if !rel_path.is_empty() {
                            let mut segments = rel_path.split('/');
                            if let Some(first_seg) = segments.next() {
                                if !first_seg.is_empty()
                                    && first_seg != "."
                                    && first_seg != ".."
                                    && !tar_seen.contains(first_seg)
                                {
                                    tar_seen.insert(first_seg.to_string());
                                    let is_folder = kind == "Folder" || segments.next().is_some();
                                    let modified_date = if mtime > 0 {
                                        chrono::DateTime::from_timestamp(mtime, 0)
                                            .map(|dt| dt.format("%d %b %H:%M").to_string())
                                            .unwrap_or_default()
                                    } else {
                                        String::new()
                                    };

                                    let exec = crate::modules::exec::dto::Exec {
                                        name: first_seg.to_string(),
                                        modified_date,
                                        user_type: "root".to_string(),
                                        size: format_tar_size(size, is_folder),
                                        kind: if is_folder {
                                            "Folder".to_string()
                                        } else {
                                            "File".to_string()
                                        },
                                    };

                                    let data = exec.to_json().to_string();
                                    if let Ok(mut buf) = buffer.lock() {
                                        if buf.len() >= BUFFER_CAPACITY {
                                            buf.pop_front();
                                        }
                                        buf.push_back(data.clone());
                                    }
                                    let _ = tx.send(data);
                                }
                            }
                        }
                    }

                    tar_buffer.drain(..total_entry_bytes);
                }
            } else if is_multiplexed {
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

                    let _ = tx.send(data);
                }
            } else {
                let s = String::from_utf8_lossy(&bytes);
                for line in s.lines() {
                    let trimmed = line.trim();
                    if !trimmed.is_empty() {
                        let _ = tx.send(trimmed.to_string());
                    }
                }
            }
        }
    }

    let is_oneshot = url.contains("/logs")
        || (url.contains("/exec/") && url.contains("/start"))
        || url.contains("/archive");

    if !is_oneshot {
        tokio::time::sleep(Duration::from_secs(1)).await;
    }
}

fn parse_tar_header_block(header: &[u8]) -> (String, String, u64, i64) {
    let name_end = header[0..100].iter().position(|&b| b == 0).unwrap_or(100);
    let name_part = String::from_utf8_lossy(&header[0..name_end])
        .trim_matches('\0')
        .trim()
        .to_string();

    let raw_name = if header.len() >= 500 && header[345] != 0 {
        let prefix_end = header[345..500].iter().position(|&b| b == 0).unwrap_or(155);
        let prefix = String::from_utf8_lossy(&header[345..345 + prefix_end])
            .trim_matches('\0')
            .trim()
            .to_string();
        if !prefix.is_empty() {
            format!("{}/{}", prefix, name_part)
        } else {
            name_part
        }
    } else {
        name_part
    };

    let typeflag = header[156];
    let kind = match typeflag {
        b'5' => "Folder".to_string(),
        b'2' => "Folder".to_string(),
        _ => {
            if raw_name.ends_with('/') {
                "Folder".to_string()
            } else {
                "File".to_string()
            }
        }
    };

    let size_slice = &header[124..136];
    let size_end = size_slice.iter().position(|&b| b == 0 || b == b' ').unwrap_or(12);
    let size_str = std::str::from_utf8(&size_slice[..size_end]).unwrap_or("0").trim();
    let size = u64::from_str_radix(size_str, 8).unwrap_or(0);

    let mtime_slice = &header[136..148];
    let mtime_end = mtime_slice.iter().position(|&b| b == 0 || b == b' ').unwrap_or(12);
    let mtime_str = std::str::from_utf8(&mtime_slice[..mtime_end]).unwrap_or("0").trim();
    let mtime = i64::from_str_radix(mtime_str, 8).unwrap_or(0);

    (raw_name, kind, size, mtime)
}

fn format_tar_size(size: u64, is_dir: bool) -> String {
    if is_dir {
        "-".to_string()
    } else if size == 0 {
        "Zero kB".to_string()
    } else if size < 1024 {
        format!("{} B", size)
    } else if size < 1024 * 1024 {
        format!("{} kB", size / 1024)
    } else {
        format!("{:.1} MB", size as f64 / (1024.0 * 1024.0))
    }
}

// Parses Docker multiplexed 8-byte frames:
// Byte 0: 1 = stdout, 2 = stderr, 0 = stdin
// Bytes 1..4: unused/zeros
// Bytes 4..8: big-endian frame size
// Bytes 8..: log message payload
pub fn parse_docker_log_frames(bytes: &[u8]) -> Vec<(String, String)> {
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
